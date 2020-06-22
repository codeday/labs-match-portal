import Box from '@codeday/topo/Atom/Box';

const colors = {
  'Web Dev': 'purple',
  'Mobile': 'blue',
  'Services': 'yellow',
  'Frontend': 'purple',
  'Backend': 'yellow',
  'Electronics': 'orange',
  'Research': 'red',
  'Sciences': 'pink',
  'Health': 'indigo',
  'AI': 'gray',
  'Robotics': 'teal',
  'Cryptography': 'cyan',
  'Games': 'green',
  'Data': 'green',
  'OS': 'yellow',
  'HCI/UX': 'orange',
}
export const Tag = ({ tag, featured }) => (
  <Box
    bg={`${colors[tag]}.100`}
    color={`${colors[tag]}.800`}
    borderRadius={4}
    d="inline"
    p={2}
    mr={2}
    borderColor={`${colors[tag]}.${featured ? 800 : 100}`}
    borderWidth={2}
    style={{ whiteSpace: 'nowrap' }}
    >
      {tag}
    </Box>
);

export const TagList = ({ tags, featured }) => {
  return <Box d="inlineBlock" lineHeight={3}>
    {
      (tags || [])
        .sort((a, b) => {
          if (featured.includes(a) && !featured.includes(b)) return -1;
          if (featured.includes(b) && !featured.includes(a)) return 1;
          return 0;
        })
        .map((tag) => <><Tag tag={tag} featured={featured && featured.includes(tag)} />{' '}</>)
    }
  </Box>
}
