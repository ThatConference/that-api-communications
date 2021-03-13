import debug from 'debug';
import getObjectAtPath from '../getObjectAtPath';

const dlog = debug('that:api:communications:lib:messages');

export default function createMessageQueue({
  addressees,
  event,
  message,
  sendOnDate,
  constants,
}) {
  const totalAddressees = addressees.length;
  dlog('number of addressees %d', totalAddressees);

  const queueRate = constants.THAT.MESSAGING.WRITE_QUEUE_RATE;
  dlog('queue rate %d', queueRate);
  const iterations = Math.ceil(totalAddressees / queueRate);
  const messageQueue = [];
  let iterationQueue = [];
  dlog('number of queue iterations: %d', iterations);
  const queueDate = new Date();
  for (let i = 0; i < iterations; i += 1) {
    dlog('on iteration, %d', i);
    iterationQueue = [];
    // when on last iteration use the remander otherwise use the write queue rate
    const jMax = i === iterations - 1 ? totalAddressees % queueRate : queueRate;

    for (let j = 0; j < jMax; j += 1) {
      const addressee = addressees[i * queueRate + j];
      const allocatedTo = addressee.allocatedTo || {};
      const purchasedBy = addressee.purchasedBy || {};

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
          startDate: event.startDate || '',
          endDate: event.endDate || '',
        },
      };
      const msg = {
        emailTo:
          getObjectAtPath(templateModel, message.emailToTemplatePath) || '',
        postmarkAlias: message.postmarkAlias,
        postmarkMessageType: message.postmarkMessageType,
        templateModel,
        isQueued: false,
        isSent: false,
        queueDate,
        sendOnDate,
      };

      iterationQueue.push(msg);
    }

    messageQueue.push(iterationQueue);
  }

  return messageQueue;
}
