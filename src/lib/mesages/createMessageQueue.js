import debug from 'debug';
import dateformat from 'dateformat';
import getObjectAtPath from '../getObjectAtPath';

const dlog = debug('that:api:communications:lib:messages');

export default function createMessageQueue({
  addressees,
  event,
  message,
  sendOnDate,
  messageQueuedOnLogId,
  writeQueueRate,
}) {
  const totalAddressees = addressees.length;
  dlog('number of addressees %d', totalAddressees);

  const queueRate = writeQueueRate;
  dlog('queue rate %d', queueRate);
  const iterations = Math.ceil(totalAddressees / queueRate);
  const messageQueue = [];
  let iterationQueue = [];
  dlog('number of queue iterations: %d', iterations);
  const createdAt = new Date();
  const dateFormatString = 'dddd, mmmm dS, yyyy "@" h:MM TT Z';
  for (let i = 0; i < iterations; i += 1) {
    dlog('on iteration, %d', i);
    iterationQueue = [];
    // when on last iteration use the remander otherwise use the write queue rate
    const jMax = i === iterations - 1 ? totalAddressees % queueRate : queueRate;

    for (let j = 0; j < jMax; j += 1) {
      const addressee = addressees[i * queueRate + j];
      const allocatedTo = addressee.allocatedTo || {};
      const purchasedBy = addressee.purchasedBy || {};
      const eventStartDate =
        event.startDate instanceof Date
          ? dateformat(event.startDate, dateFormatString)
          : event.startDate;
      const eventEndDate =
        event.endDate instanceof Date
          ? dateformat(event.endDate, dateFormatString)
          : event.endDate;

      const templateModel = {
        member: {
          firstName: allocatedTo.firstName || '',
          lastName: allocatedTo.lastName || '',
          email: allocatedTo.email || '',
        },
        purchasedBy: {
          firstName: purchasedBy.firstName || '',
          lastName: purchasedBy.lastName || '',
          email: purchasedBy.email || '',
        },
        event: {
          name: event.name || '',
          startDate: eventStartDate || '',
          endDate: eventEndDate || '',
        },
      };
      const msg = {
        emailTo:
          getObjectAtPath(templateModel, message.emailToTemplatePath) || '',
        postmarkAlias: message.postmarkAlias,
        postmarkMessageType: message.postmarkMessageType,
        thatMessageType: message.messageType,
        templateModel,
        isQueuedToSend: false,
        isSent: false,
        createdAt,
        sendOnDate,
        messageQueuedOnLogId,
        queuedAt: null,
        isInError: false,
      };
      const idPieces = `${event.id}|${message.messageType}|${msg.emailTo}`;
      msg.messageQueueId = Buffer.from(idPieces, 'utf-8').toString('base64');

      iterationQueue.push(msg);
    }

    messageQueue.push(iterationQueue);
  }

  return messageQueue;
}
