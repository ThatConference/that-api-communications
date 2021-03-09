import debug from 'debug';

const dlog = debug('that:api:communications:query:CommunicationsMessages');

export const fieldResolvers = {
  CommunicationsMessagesQuery: {
    all: () => {
      dlog('all called');
      return [];
    },

    message: ({ messageId }) => {
      dlog('message called for id %s', messageId);
      return {};
    },
  },
};
