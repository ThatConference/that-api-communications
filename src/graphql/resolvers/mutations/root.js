import debug from 'debug';

const dlog = debug('that:api:communications:mutation');

const resolvers = {
  communications: () => {
    dlog('root mutation called');
    return {};
  },
};

export default resolvers;
