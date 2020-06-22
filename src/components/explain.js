import Box from '@codeday/topo/Atom/Box';
import Text, { Heading } from '@codeday/topo/Atom/Text';
import { TagList } from './tag';

export default ({ record, debug }) => (
  <Box borderColor="blue.500" borderWidth={2} borderRadius={2} padding={4} mb={8} color="blue.800" bg="blue.50">
    <Heading as="h3" fontSize="xl">Here's the info we're using to recommend these projects.</Heading>
    <Text fontStyle="italic" mb={4}>Contact us if anything in this section is wrong.</Text>
    <Text mb={0}><Text as="span" bold>How much time you committed:</Text> {record['Time Commitment']} per week</Text>
    <Text mb={0}><Text as="span" bold>Your track:</Text> {record['Track']}</Text>
    { debug && (
      <>
        <Text mb={0}><Text as="span" bold>Did you grow up in a rural area?</Text> {record['Rural'] ? 'Yes' : 'No' }</Text>
        <Text mb={0}><Text as="span" bold>Are you from a group underrepresented in technology:</Text> {record['Underrepresented'] ? 'Yes' : 'No'}</Text>
      </>
    )}
    <Text mb={0}><Text as="span" bold>Your timezone:</Text> GMT{record['Timezone'] >= 0 && "+"}{record['Timezone']}</Text>
    <Text mb={0}><Text as="span" bold>Do you need an extended internship for school credit?</Text> {record['Extended Internship'] ? 'Yes' : 'No' }</Text>
    <Text mb={0}><Text as="span" bold>Companies you're interested in:</Text> {(record['Interested Companies'] || '').split(',').join(', ')}</Text>
    <Text mb={0}><Text as="span" bold>Fields you're interested in:</Text> <TagList tags={record['Interests']} featured={record['Interests']} /></Text>
  </Box>
)
