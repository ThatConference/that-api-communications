import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:communications:dataSources:firebase:messageQueue');
const { entityDateForge } = utility.firestoreDateForge;
const msgQueueDateForge = entityDateForge({ fields: ['lastUpdatedAt'] });

const collectionName = 'messageQueue';

const messageQueue = dbInstance => {
  dlog('messageQueue instance created');

  const msgQueueCollection = dbInstance.collection(collectionName);

  function addOne(queueMessage) {
    return msgQueueCollection.add(queueMessage);
  }

  function addMany(queueMessages) {
    if (!Array.isArray(queueMessages))
      throw new Error('addMany requires an array of messages to queue');
    dlog('queueMany called on %d messages', queueMessages.length);
    if (queueMessages.length > 500)
      throw new Error('addMany array too large, > 500');

    const batch = dbInstance.batch();
    queueMessages.forEach(q => {
      const docRef = msgQueueCollection.doc();
      batch.set(docRef, q);
    });

    return batch.commit();
  }

  function updateOne(queueId, msgUpdate) {
    return msgQueueCollection.doc(queueId, msgUpdate);
  }

  function updateMany(queueIds, msgUpdate) {
    if (!Array.isArray(queueIds))
      throw new Error('updateMany requires an array of queue ids');
    if (queueIds.length > 500)
      throw new Error('updateMany array too large, > 500');

    const batch = dbInstance.batch();
    queueIds.forEach(q => {
      const docRef = msgQueueCollection(q);
      batch.update(docRef, msgUpdate);
    });

    return batch.commit();
  }

  return { addOne, addMany, updateOne, updateMany };
};

export default messageQueue;
