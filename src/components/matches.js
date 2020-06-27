import Text, { Heading, Link } from '@codeday/topo/Atom/Text';
import Box from '@codeday/topo/Atom/Box';
import Button from '@codeday/topo/Atom/Button';
import truncate from 'truncate';
import { TagList } from './tag'
import { ordinal } from '../utils';

const nl2br = (str) => str && str
  .replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\n/g, '<br />')
  .replace(/(https?:\/\/[^\s\(\)]+)/g, (url) => `<a href="${url}" style="text-decoration: underline" target="_blank">${url}</a>`);

export const Match = ({ match, record, debug, onSelect, onDeselect, isSelected, allowSelect }) => (
  <Box mb={8} borderColor="gray.200" borderWidth={2} borderRadius={2}>
      <Heading p={4} as="h3" fontSize="xl" mb={2} backgroundColor="gray.100" borderBottomColor="gray.200" borderBottomWidth={2} mb={4}>
        {match.project.name}, {match.project.company}{' '}
        ({match.project.track}-track project)
      </Heading>

      {/* Tags */}
      <Box mb={8} ml={4} mr={4}>
        <TagList tags={match.project.proj_tags} featured={record['Interests']} />
      </Box>

      <Box mb={8} ml={4} mr={4}>
        {record['Extended Internship'] && match.project.okExtended && (
          <Text color="green.700" bold>This project is open to students needing extended internships.</Text>
        )}
        {match.project.preferToolExistingKnowledge && (
          <Text backgroundColor="red.50" bold color="red.800">{match.project.name} prefers students with existing knowledge of this tech stack.</Text>
        )}
      </Box>

      {/* Project Info */}
      <Box mb={8} mr={4} ml={4}>
        <Heading as="h4" fontSize="md" mb={2}>About the project</Heading>
        <Text pl={2} ml={2} borderLeftColor="gray.100" borderLeftWidth={2}>
          <div dangerouslySetInnerHTML={{ __html: nl2br(match.project.proj_description) }} />
        </Text>
      </Box>

      {/* Mentor Info */}
      <Box mb={8} mr={4} ml={4}>
        <Heading as="h4" fontSize="md" mb={2}>About {match.project.name}</Heading>
        <Text><div dangerouslySetInnerHTML={{ __html: nl2br(match.project.bio) }} /></Text>
      </Box>

      {/* Select button */}
      {allowSelect && (
        <Box mb={8} mr={4} ml={4}>
          <Button
            onClick={() => isSelected ? onDeselect(match) : onSelect(match)}
            variantColor={isSelected ? 'red' : 'green'}
            variant={isSelected ? 'outline' : 'solid'}
          >
            {isSelected ? 'Undo Selection' : 'Add to My Ranking'}
          </Button>
        </Box>
      )}

      {/* Debug Info */}
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
)

export const MiniMatch = ({ match, index }) => (
  <Box p={4} mb={1} borderColor="gray.200" borderWidth={2} borderRadius={2} bg="white">
    <Text fontSize="lg" bold mb={0}>{index+1}<sup>{ordinal(index+1)}</sup> choice: {match.project.name}</Text>
    <Text fontStyle="italic" mb={0}>{truncate(match.project.proj_description, 140)}</Text>
  </Box>
);

export const MatchesList = ({ matches, record, debug, selected, onSelect, onDeselect, allowSelect }) => matches
  .filter((match) => match.score !== 0)
  .map((match) => (
    <Match
      match={match}
      record={record}
      debug={debug}
      isSelected={selected.map((e) => e.project.id).includes(match.project.id)}
      onSelect={onSelect}
      onDeselect={onDeselect}
      allowSelect={allowSelect}
    />
  ));
