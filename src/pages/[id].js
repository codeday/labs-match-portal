import React, { useReducer, useState } from 'react';
import getConfig from 'next/config';
import { sign } from 'jsonwebtoken';
import axios from 'axios';
import Airtable from 'airtable';
import Text, { Heading, Link } from '@codeday/topo/Atom/Text';
import Content from '@codeday/topo/Molecule/Content';
import Box, { Grid } from '@codeday/topo/Atom/Box';
import Button from '@codeday/topo/Atom/Button';
import Page from '../components/page';
import Explain from '../components/explain';
import { MatchesList } from '../components/matches';
import Sorter from '../components/sorter';

const { serverRuntimeConfig } = getConfig();
const minProjectsToSubmit = 5;
const displayProjectsCount = 15;

export const getServerSideProps = async ({ query: { debug }, res, params: { id } }) => {

  const table = new Airtable({ apiKey: serverRuntimeConfig.airtableKey })
    .base(serverRuntimeConfig.airtableBase)(serverRuntimeConfig.airtableTable);

  let record;
  try {
    record = (await table.find(id)).fields;
  } catch (err) {
    res.statusCode = 404;
    return { props: { matches: [] }};
  }

  try {
    const fetchVotesJwt = sign({ student_id: id }, serverRuntimeConfig.matchSecret);
    const fetchVotesUrl = `${serverRuntimeConfig.matchUrl}/votes/${fetchVotesJwt}`;
    const priorVotes = (await axios({ method: 'get', url: fetchVotesUrl, responseType: 'json'})).data;
    if (priorVotes.length > 0) {
      return { props: { priorVotes: priorVotes.sort((a, b) => a.choice - b.choice), record }}
    }
  } catch (err) {
    console.error(err);
    return { props: { matches: [] } };
  }

  const matchRecord = {
    id,
    name: record.Name,
    rural: record.Rural || false,
    underrepresented: record.Underrepresented || false,
    timezone: record.Timezone || -4,
    interestCompanies: (record['Interested Companies'] || '').split(','),
    interestTags: record['Interests'] || [],
    requireExtended: record['Extended Internship'] || false,
    track: record.Track || 'Advanced',
  };

  const jwt = sign(matchRecord, serverRuntimeConfig.matchSecret);
  const url = `${serverRuntimeConfig.matchUrl}/matches/${jwt}`;
  let matches = [];
  try {
    matches = (await axios({ method: 'get', url, responseType: 'json' })).data;
  } catch (err) {
    console.error(err);
  }

  return {
    props: {
      matches: matches.slice(0, displayProjectsCount),
      record,
      id,
      debug: debug ? true : false,
      hasSubmitted: false,
    }
  }
}

export default function Home({ id, matches, record, debug, priorVotes }) {
  const [picks, updatePicks] = useReducer((picks, { action, data }) => {
    if (action === 'add') {
      return [...picks, data];
    }
    if (action === 'delete') {
      return picks.filter((pick) => pick.project.id !== data.project.id);
    }
  }, []);
  const [ranking, setRanking] = useState([]);
  const [isWarned, setIsWarned] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(priorVotes && priorVotes.length > 0 || false);

  if (priorVotes && priorVotes.length > 0) {
	return (
		<Page slug={`/${id}`} title={`Project Preferences`}>
			<Content>
				<Heading as="h2" fontSize="5xl" textAlign="center" mb={8}>
          Project Preferences{record && ` for ${record.Name}`}
        </Heading>
        <Box bg="yellow.50" color="yellow.900" borderColor="yellow.100" borderWidth={2} p={4} mb={8}>
          <Text bold fontSize="lg">You already submitted your preferences.</Text>
          <Text>Below you can see your submitted choices, in order of most to least preferable.</Text>
        </Box>
        <Box>
          <MatchesList
            record={record}
            debug={debug}
            matches={priorVotes}
            selected={picks}
            onSelect={(match) => { updatePicks({ action: 'add', data: match}); setIsWarned(false); }}
            onDeselect={(match) => { updatePicks({ action: 'delete', data: match }); setIsWarned(false); }}
          />
        </Box>
			</Content>
		</Page>
	)
  }

  if (!matches || matches.length === 0) {
    return (
      <Page slug={`/${id}`} title={`Project Preferences`}>
        <Content>
          <Heading as="h2" fontSize="5xl" textAlign="center">Error</Heading>
          <Text>
            Sorry, something went wrong and we couldn't load your matches. Try refreshing in a couple minutes and if
            you're still getting this error, contact <Link href="mailto:labs@codeday.org">labs@codeday.org</Link>
          </Text>
        </Content>
      </Page>
    )
  }

  if (isSubmitted) {
    return (
      <Page slug={`/${id}`} title={`Project Preferences`}>
        <Content>
          <Heading as="h2" fontSize="5xl" textAlign="center">Your preferences were submitted.</Heading>
          <Text>Keep an eye out for your mentor introduction a few days before CodeLabs starts.</Text>
        </Content>
      </Page>
    );
  }

	return (
		<Page slug={`/${id}`} title={`Project Preferences`}>
			<Content>
				<Heading as="h2" fontSize="5xl" textAlign="center" mb={8}>
          Project Preferences{record && ` for ${record.Name}`}
        </Heading>
        <Box p={4} mb={8} display={{ base: 'block', md: 'none' }} bg="red.50" borderColor="red.500" borderWidth={2} color="red.900">
          <Text fontSize="xl" bold>We recommend viewing this site on a device with a larger screen.</Text>
          <Text>There's a lot of information on this page, and it's hard to see it all on a phone.</Text>
        </Box>
        <Explain record={record} />
        <Grid templateColumns={{ base: '1fr', md: '2fr 4fr' }}>
          <Box mr={4}>
            <Heading as="h3" fontSize="xl">Rank Your Favorite Projects</Heading>
            <Text>
              Select at least {minProjectsToSubmit} projects, then drag-and-drop to reorder your final preferences. The
              projects on the top of your list are the ones you're most likely to get.
            </Text>
            <Text bold>Your submission is final.</Text>
            <Button
              disabled={ranking.length < minProjectsToSubmit}
              variantColor="green"
              variant={isWarned ? 'solid' : 'outline'}
              mb={4}
              onClick={async () => {
                if (!isWarned) {
                  setIsWarned(true);
                  return;
                }
                setIsSubmitting(true);
                const result = await (await fetch('/api/preferences', {
                  method: 'POST',
                  headers: { 'Content-type': 'application/json' },
                  body: JSON.stringify({
                    id,
                    votes: Object.keys(ranking)
                      .map((index) => ({ rank: Number.parseInt(index)+1, id: ranking[index].project.id }))
                    }),
                })).json();
                setIsSubmitting(false);
                if (result && result.ok) {
                  setIsSubmitted(true);
                }
              }}
            >
              {(() => {
                if (isSubmitting) return "Submitting...";
                if (isWarned) return "Are you sure? Choices are final!";
                if (ranking.length < minProjectsToSubmit) return `Pick at least ${minProjectsToSubmit}`;
                return "Submit";
              })()}
            </Button>
            <Sorter matches={picks} onUpdate={(r) => { setRanking(r); setIsWarned(false); }} />
          </Box>
          <Box>
            <MatchesList
              record={record}
              debug={debug}
              matches={matches}
              selected={picks}
              onSelect={(match) => { updatePicks({ action: 'add', data: match}); setIsWarned(false); }}
              onDeselect={(match) => { updatePicks({ action: 'delete', data: match }); setIsWarned(false); }}
              allowSelect
            />
          </Box>
        </Grid>
			</Content>
		</Page>
	)
}
