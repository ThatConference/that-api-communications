import debug from 'debug';
import messagesStore from '../../../dataSources/cloudFirestore/messages';

const dlog = debug('that:api:communications:mutation:CommunicationsMessages');

export const fieldResolvers = {
  CommunicationsMessageMutation: {
    update: (
      { messageId },
      { updatedMessage },
      { dataSources: { firestore } },
    ) => {
      dlog('update message called');
      return messagesStore(firestore).update({ messageId, updatedMessage });
    },
  },
};
