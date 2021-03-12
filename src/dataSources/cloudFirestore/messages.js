import debug from 'debug';
import * as Sentry from '@sentry/node';

const dlog = debug('that:api:communications:dataSources:firebase:messages');

const collectionName = 'messages';

const messages = dbInstance => {
  dlog('messages instance created');

  const messageCollection = dbInstance.collection(collectionName);

  function get(id) {
    dlog('get called on %s', id);
    return messageCollection
      .doc(id)
      .get()
      .then(docSnap => {
        let result = null;
        if (docSnap.exists) {
          result = {
            id: docSnap.id,
            ...docSnap.data(),
          };
        }

        return result;
      });
  }

  function findOnlineMessageByType(messageType) {
    dlog('findOnlineMessageByType called for type %s', messageType);
    return messageCollection
      .where('messageType', '==', messageType)
      .where('isOnline', '==', true)
      .get()
      .then(querySnap => {
        dlog('query size %d', querySnap.size);
        if (querySnap.size > 1) {
          Sentry.setTags({ messageType });
          const messageIds = JSON.stringify(querySnap.docs.map(q => q.id));
          Sentry.setContext('message ids', messageIds);
          Sentry.setContext('parameters', { messageType });
          const err = new Error(
            `Multiple messages returned for ONLINE with type ${messageType}`,
          );
          Sentry.captureException(err);
          throw err;
        }
        return querySnap.docs.map(m => ({
          id: m.id,
          ...m.data(),
        }));
      });
  }

  function findByEventIdAndType({ eventId, messageType }) {
    dlog(
      'findByEventIdAndType for eventId %s and type %s',
      eventId,
      messageType,
    );
    return messageCollection
      .where('event', '==', eventId)
      .where('messageType', '==', messageType)
      .get()
      .then(querySnap => {
        if (querySnap.size > 1) {
          Sentry.setTags({ messageType, eventId });
          const messageIds = JSON.stringify(querySnap.docs.map(q => q.id));
          Sentry.setContext('message ids', messageIds);
          Sentry.setContext('parameters', { eventId, messageType });
          const err = new Error(
            `Multiple messages returned for event ${eventId} with type ${messageType}`,
          );
          Sentry.captureException(err);
          throw err;
        }
        return querySnap.docs.map(m => ({
          id: m.id,
          ...m.data(),
        }));
      });
  }

  async function create(newMessage) {
    dlog('create called %o', newMessage);
    let result;
    if (newMessage.isOnline) {
      if (newMessage.event) {
        throw new Error(
          `isOnline MessageDefinitions should not have an Event id set`,
        );
      }
      result = await findOnlineMessageByType(newMessage.messageType);
    } else {
      if (!newMessage.event)
        throw new Error('When isOnline is false event id is required');
      result = await findByEventIdAndType({
        eventId: newMessage.event,
        messageType: newMessage.messageType,
      });
    }
    if (result.length > 0)
      throw new Error(
        `Document already exists for: isOnline: ${newMessage.isOnline}, Event: ${newMessage.event}, messageType: ${newMessage.messageType}`,
      );

    return messageCollection.add(newMessage).then(docRef => get(docRef.id));
  }

  function update({ messageId, updatedMessage }) {
    dlog('update called on document %s:: %o', messageId, updatedMessage);
    const docRef = messageCollection.doc(messageId);
    return docRef.update(updatedMessage).then(() => get(messageId));
  }

  function getAll() {
    return messageCollection.get().then(querySnap =>
      querySnap.docs.map(d => ({
        id: d.id,
        ...d.data(),
      })),
    );
  }

  return {
    get,
    findOnlineMessageByType,
    findByEventIdAndType,
    create,
    update,
    getAll,
  };
};

export default messages;
