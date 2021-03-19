import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:communications:dataSources:firebase:messageQueue');
const { entityDateForge } = utility.firestoreDateForge;
const msgQueuedOnLogDateForge = entityDateForge({ fields: ['createdAt'] });

const collectionName = 'messageQueue';
const queuedOnCollectionName = 'messageQueuedOnLog';

const messageQueue = dbInstance => {
  dlog('messageQueue instance created');

  const msgQueueCollection = dbInstance.collection(collectionName);
  const queuedOnCollection = dbInstance.collection(queuedOnCollectionName);

  function addOne(queueMessage) {
    return msgQueueCollection
      .doc(queueMessage.messageQueueId)
      .set(queueMessage);
  }

  function addMany(queueMessages) {
    if (!Array.isArray(queueMessages))
      throw new Error('addMany requires an array of messages to queue');
    dlog('queueMany called on %d messages', queueMessages.length);
    if (queueMessages.length > 500)
      throw new Error('addMany array too large, > 500');

    const batch = dbInstance.batch();
    queueMessages.forEach(q => {
      const docRef = msgQueueCollection.doc(q.messageQueueId);
      batch.set(docRef, q);
    });

    return batch.commit();
  }

  function findMessageQueuedOnLog({ eventId, thatMessageType }) {
    return queuedOnCollection
      .where('eventId', '==', eventId)
      .where('thatMessageType', '==', thatMessageType)
      .get()
      .then(querySnap =>
        querySnap.docs.map(d => {
          const r = {
            id: d.id,
            ...d.data(),
          };

          return msgQueuedOnLogDateForge(r);
        }),
      );
  }

  function makeMessageQueuedOnLogId({ eventId, thatMessageType }) {
    // `0` at end is iteration. for future use.
    return `${eventId}|${thatMessageType}|0`;
  }

  function addMessageQueuedOnLog({
    eventId,
    eventName,
    thatMessageType,
    messagesId,
    sendOnDate,
    addresseeCount,
    addresseeUniqueCount,
  }) {
    const messageQueuedOnLogId = makeMessageQueuedOnLogId({
      eventId,
      thatMessageType,
    });
    return queuedOnCollection
      .doc(messageQueuedOnLogId)
      .set({
        eventId,
        eventName,
        thatMessageType,
        messagesId,
        sendOnDate,
        addresseeCount,
        addresseeUniqueCount,
        createdAt: new Date(),
      })
      .then(() => messageQueuedOnLogId);
  }

  return {
    addOne,
    addMany,
    findMessageQueuedOnLog,
    makeMessageQueuedOnLogId,
    addMessageQueuedOnLog,
  };
};

export default messageQueue;
