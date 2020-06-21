import getConfig from 'next/config';
import Text, { Heading } from '@codeday/topo/Atom/Text';
import Content from '@codeday/topo/Molecule/Content';
import Box from '@codeday/topo/Atom/Box';
import Page from '../components/page';
import { sign } from 'jsonwebtoken';
import axios from 'axios';
import Airtable from 'airtable';

const { serverRuntimeConfig } = getConfig();

const nl2br = (str) => str && str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br />');
const colors = {
  'Web Dev': 'purple',
  'Mobile': 'blue',
  'Services': 'green',
  'Frontend': 'green',
  'Backend': 'yellow',
  'Electronics': 'orange',
  'Research': 'red',
  'Sciences': 'red',
  'Health': 'red',
  'AI': 'gray',
  'Robotics': 'purple',
  'Cryptography': 'blue',
  'Games': 'green',
  'Data': 'green',
  'OS': 'yellow',
  'HCI/UX': 'orange',
  'Services': 'purple',
}
const drawTag = (tag, interests) => (
  <Box
    bg={`${colors[tag]}.100`}
    color={`${colors[tag]}.800`}
    borderRadius={4}
    d="inline"
    p={2}
    mr={2}
    borderColor={`${colors[tag]}.${interests && interests.includes(tag) ? 800 : 100}`}
    borderWidth={2}
    >
      {tag}
    </Box>
);
const sortTags = (interests) => {
  return (a, b) => {
    if (interests.includes(a) && !interests.includes(b)) return -1;
    if (interests.includes(b) && !interests.includes(a)) return 1;
    return 0;
  }
}

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
      matches,
      record,
      id,
      debug: debug ? true : false,
    }
  }
}

export default function Home({ id, matches, record, debug }) {
	return (
		<Page slug={`/${id}`} title={`Project Preferences`}>
			<Content>
				<Heading as="h2" fontSize="5xl" textAlign="center">Project Preferences{record && ` for ${record.Name}`}</Heading>
        <Box borderColor="green.500" borderWidth={2} borderRadius={2} padding={4} mb={8} color="green.800">
          <Heading as="h3" fontSize="xl" mb={4}>What we're using to make these recommendations:</Heading>
          <Text mb={0}><Text as="span" bold>How much time you committed:</Text> {record['Time Commitment']} per week</Text>
          <Text mb={0}><Text as="span" bold>Your track:</Text> {record['Track']}</Text>
          <Text mb={0}><Text as="span" bold>Did you grow up in a rural area?</Text> {record['Rural'] ? 'Yes' : 'No' }</Text>
          <Text mb={0}><Text as="span" bold>Are you from a group underrepresented in technology:</Text> {record['Underrepresented'] ? 'Yes' : 'No'}</Text>
          <Text mb={0}><Text as="span" bold>Your timezone:</Text> GMT{record['Timezone'] >= 0 && "+"}{record['Timezone']}</Text>
          <Text mb={0}><Text as="span" bold>Do you need an extended internship?</Text> {record['Extended Internship'] ? 'Yes' : 'No' }</Text>
          <Text mb={0}><Text as="span" bold>Companies you're interested in:</Text> {record['Interested Companies']}</Text>
          <Text mb={0}><Text as="span" bold>Fields you're interested in:</Text> {record['Interests'].map((t) => drawTag(t, record['Interests']))}</Text>
        </Box>
        {matches.length == 0 && (
          <Text>Sorry, something went wrong and we couldn't load your matches. If this error persists contact support.</Text>
        )}
        {
          matches.filter((match) => match.score !== 0).map((match) => (
            <Box mb={8} borderColor="gray.200" borderWidth={2} borderRadius={2}>
                <Heading p={4} as="h3" fontSize="xl" mb={2} backgroundColor="gray.100" borderBottomColor="gray.200" borderBottomWidth={2} mb={4}>
                  {match.project.name}, {match.project.company}{' '}
                  ({match.project.track}-track project{match.project.okExtended && ' for extended internships'})
                </Heading>
                <Box mb={8} ml={4} mr={4}>
                  {match.project.proj_tags && match.project.proj_tags.sort(sortTags(record['Interests'])).map((t) => drawTag(t, record['Interests']))}
                </Box>
                <Box mb={8} mr={4} ml={4}>
                  <Heading as="h4" fontSize="md" mb={2}>About the project</Heading>
                  <Text pl={2} ml={2} borderLeftColor="gray.100" borderLeftWidth={2}>
                    <div dangerouslySetInnerHTML={{ __html: nl2br(match.project.proj_description) }} />
                  </Text>
                  {match.project.preferToolExistingKnowledge && (
                    <Text backgroundColor="red.50" bold color="red.800">{match.project.name} prefers students with existing knowledge of this tech stack.</Text>
                  )}
                </Box>
                <Box mb={8} mr={4} ml={4}>
                  <Heading as="h4" fontSize="md" mb={2}>About {match.project.name}</Heading>
                  <Text>{nl2br(match.project.bio)}</Text>
                </Box>
                { debug && (
                  <Box pl={8} pr={4} borderTopColor="gray.100" borderTopWidth={2}>
                    <Heading as="h4" fontSize="md" mb={2} mt={4}>Debug</Heading>
                    <Text>
                      <Box d="inline" bg={match.project.preferStudentUnderRep > 0 ? 'red.300' : 'gray.100'} p={2} mr={2}>
                        prefUrm {match.project.preferStudentUnderRep}
                      </Box>
                      <Box d="inline" bg={match.project.okTimezoneDifference ? 'green.300' : 'gray.100'} p={2} mr={2}>
                        okTzDiff {match.project.okTimezoneDifference ? 'Yes' : 'No'}
                      </Box>
                      <Box d="inline" bg={{'-7': 'blue.50', '-6': 'blue.100', '-5': 'blue.200', '-4': 'blue.300'}[match.project.timezone] || 'gray.50'} p={2} mr={2}>
                        tz: {match.project.timezone},
                      </Box>
                      <Box d="inline" bg={`purple.${Math.max(9, Math.ceil(match.score) * 100)}`} color={match.score >= 5 ? 'white' : 'black'} p={2} mr={2}>
                        score: {match.score}
                      </Box>
                    </Text>
                  </Box>
                )}
            </Box>
          ))
        }
			</Content>
		</Page>
	)
}
