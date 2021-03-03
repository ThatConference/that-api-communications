import debug from 'debug';

const dlog = debug('that:api:communications:query');

const resolvers = {
  communications: () => {
    dlog('root communications called');
    return {};
  },
};

export default resolvers;
