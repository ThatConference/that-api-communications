import debug from 'debug';
import messagesStore from '../../../dataSources/cloudFirestore/messages';

const dlog = debug('that:api:communications:query:CommunicationsMessages');

export const fieldResolvers = {
  CommunicationsMessagesQuery: {
    all: (_, __, { dataSources: { firestore } }) => {
      dlog('all called');
      return messagesStore(firestore).getAll();
    },

    message: (_, { messageId }, { dataSources: { firestore } }) => {
      dlog('message called for id %s', messageId);
      return messagesStore(firestore).get(messageId);
    },
  },
};
