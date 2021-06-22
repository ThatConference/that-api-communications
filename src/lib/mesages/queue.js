// for provided event and message type
// queues messasges to be sent (messageQueue)
import debug from 'debug';
import * as Sentry from '@sentry/node';
import { dataSources } from '@thatconference/api';
import messagesStore from '../../dataSources/cloudFirestore/messages';
import msgQueueFunc from '../../dataSources/cloudFirestore/messageQueue';
import { fetchAddressees } from '../graphql/fetch';
import envConfig from '../../envConfig';
import determineSendOnDate from './determineSendOnDate';
import createMessageQueue from './createMessageQueue';

const dlog = debug('that:api:communications:messages:queue');
const eventStore = dataSources.cloudFirestore.event;

export default async ({ eventId, messageType, firestore, thatApi }) => {
  dlog('queue messages called');
  Sentry.addBreadcrumb({
    category: 'message queuing',
    message: 'start message queue process for event',
  });
  Sentry.setTags({
    messageQueueEventId: eventId,
    messageQueueMessageType: messageType,
  });

  const msgQueueStore = msgQueueFunc(firestore);
  const writeQueueRate = envConfig.messageQueueWriteRate;

  // check if this event / thatMessageType has been queued already
  const messageQueuedOn = await msgQueueStore.findMessageQueuedOnLog({
    eventId,
    thatMessageType: messageType,
  });
  if (messageQueuedOn.length > 0) {
    Sentry.setContext('messagedQueuedOnLog', { messageQueuedOn });
    const err = new Error(
      `Message type ${messageType} has already been queued for event ${eventId}`,
    );
    Sentry.captureException(err);
    throw err;
  }

  // get event
  const event = await eventStore(firestore).get(eventId);
  if (!event) {
    const err = new Error(`Unkown event id provided, ${eventId}`);
    Sentry.captureException(err);
    throw err;
  }
  const eventType = event.type;
  Sentry.setTag('messageQueueEventType', eventType);
  let message = null;
  if (eventType === 'ONLINE') {
    message = await messagesStore(firestore).findOnlineMessageByType(
      messageType,
    );
    // ONLINE messages go for many eventId's lets add eventId for later reference
    if (message && message.length > 0) message[0].event = eventId;
  } else
    message = await messagesStore(firestore).findByEventIdAndType({
      eventId,
      messageType,
    });

  if (!message || (message && message.length < 1)) {
    const err = new Error(
      `Unable to queue messages, no message definition for event type ${eventType}, eventId ${eventId} with messageType ${messageType}`,
    );
    Sentry.captureException(err);
    throw err;
  }
  [message] = message;
  dlog('message:: %O', message);

  let addVariables = {};
  if (message.addVariables) {
    addVariables = JSON.parse(message.addVariables);
    dlog('addVariables:: %o', addVariables);
    if (typeof addVariables !== 'object' || Array.isArray(addVariables)) {
      Sentry.configureScope(scope => {
        scope.setTag('messageType', messageType);
        scope.setContext('message', JSON.stringify(message));
        scope.setContext('addVariables', addVariables);
        Sentry.captureMessage(
          'Messages Additional Variables did not parse to an object. It will be ignored',
          Sentry.Severity.Info,
        );
      });
      addVariables = {};
    }
  }

  const sendOnDate = determineSendOnDate({
    startDate: event.startDate,
    endDate: event.endDate,
    messageType: message.messageType,
  });

  const addressees = await fetchAddressees({
    eventId,
    msgDataSource: message.dataSource,
    thatApi,
    addVariables,
  });

  // Messages have unique id's in the `messageQueue` collection.
  // This deduplicates the messages.
  const messageQueuedOnLogId = msgQueueStore.makeMessageQueuedOnLogId({
    eventId,
    thatMessageType: messageType,
  });

  const messageQueue = createMessageQueue({
    addressees,
    event,
    message,
    sendOnDate,
    messageQueuedOnLogId,
    writeQueueRate,
  });

  const uniqueCount = new Set();
  messageQueue.forEach(q => q.forEach(i => uniqueCount.add(i.emailTo)));
  const logPromise = msgQueueStore.addMessageQueuedOnLog({
    eventId,
    eventName: event.name,
    thatMessageType: messageType,
    messagesId: message.id,
    sendOnDate,
    addresseeCount: addressees.length,
    addresseeUniqueCount: uniqueCount.size,
  });

  // Send each messageQueue array of messages to Firestore via a batch
  let messageCount = 0;
  const queuePromises = messageQueue.map(iq => {
    messageCount += iq.length;
    return msgQueueStore.addMany(iq);
  });

  dlog('number of messages: %d', messageCount);

  /*
   * this is good for efficiency, but not so good if one of the queues fail.
   * the Promise.all will fail, but the requests are already sent to Firestore
   * and may or may not complete.
   * To assist with troubleshooting each queued messaged has a unique signature
   * this allows the batch to be rerun to reload ALL the data.
   * This will resend emails if the queue has already been processed/read.
   */

  // add log creation promise to Promise array for effiency:
  queuePromises.push(logPromise);

  return Promise.all(queuePromises).then(() => messageCount);
};
