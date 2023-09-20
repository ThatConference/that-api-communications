import debug from 'debug';

const dlog = debug('that:api:communications:query:communications');

export const fieldResolvers = {
  CommunicationsQuery: {
    messages: () => {
      dlog('Messages called');
      return {};
    },
    checks: () => ({}),
  },
};
