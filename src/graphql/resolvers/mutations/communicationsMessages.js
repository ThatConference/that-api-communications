import debug from 'debug';
import queueMessages from '../../../lib/mesages/queue';
import messagesStore from '../../../dataSources/cloudFirestore/messages';

const dlog = debug('that:api:communications:mutation:CommunicationsMessages');

export const fieldResolvers = {
  CommunicationsMessagesMutation: {
    message: (_, { messageId }) => {
      dlog('message called for id %s', messageId);
      return { messageId };
    },
    create: (_, { newMessage }, { dataSources: { firestore } }) => {
      dlog('create called for new message %s', newMessage.name);
      return messagesStore(firestore).create(newMessage);
    },
    queue: (
      _,
      { eventId, messageType },
      { dataSources: { firestore, thatApi } },
    ) => {
      dlog(
        'send called for a message type of %s for event %s',
        eventId,
        messageType,
      );

      return queueMessages({
        eventId,
        messageType,
        firestore,
        thatApi,
      });
    },
  },
};
