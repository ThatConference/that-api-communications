import debug from 'debug';

const dlog = debug('that:api:communications:mutation:communications');

export const fieldResolvers = {
  CommunicationsMutation: {
    messages: () => {
      dlog('messages called');
      return {};
    },
  },
};
