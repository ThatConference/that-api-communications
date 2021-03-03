import debug from 'debug';

const dlog = debug('that:api:notifications:mutation');

const resolvers = {
  notifications: () => {
    dlog('root mutation called');
    return {};
  },
};

export default resolvers;
