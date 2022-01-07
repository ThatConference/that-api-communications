import debug from 'debug';

const dlog = debug('that:api:communications:query');

const resolvers = {
  communications: () => {
    dlog('root communications called');
    return {};
  },
  caboodle: () => {
    dlog('root caboodle called');
    return {};
  },
  news: () => {
    dlog('root news called');
    return {};
  },
};

export default resolvers;
