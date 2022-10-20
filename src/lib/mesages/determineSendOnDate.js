import debug from 'debug';

const dlog = debug('that:api:communications:determineSendOnDate');

export default function determineSendOnDate({
  startDate,
  endDate,
  messageType,
}) {
  dlog('determineSendOnDate for a message');

  const oneDay = 86400000; // in milliseconds
  // const oneHour = 3600000;
  const halfHour = 1800000;
  const thirdHour = 1200000;
  const now = new Date().getTime();
  const _startDate = new Date(startDate).getTime();
  const _endDate = new Date(endDate).getTime();
  let sendOnDate;
  switch (messageType) {
    case 'THIRTY_DAYS_OUT':
      sendOnDate = _startDate - oneDay * 30;
      break;
    case 'TWO_WEEKS_OUT':
      sendOnDate = _startDate - oneDay * 14;
      break;
    case 'THREE_DAYS_OUT':
      sendOnDate = _startDate - oneDay * 3;
      break;
    case 'BE_PREPARED':
      sendOnDate = _startDate - oneDay;
      break;
    case 'WELCOME':
      sendOnDate = _startDate + halfHour;
      break;
    case 'THANK_YOU':
      sendOnDate = _endDate + oneDay;
      break;
    case 'ACCEPTED':
      sendOnDate = now + thirdHour;
      break;
    case 'ACCEPTED_ONLINE':
      sendOnDate = now + thirdHour;
      break;
    case 'ACCEPTED_IN_PERSON':
      sendOnDate = now + thirdHour;
      break;
    case 'REGRETS':
      sendOnDate = now + thirdHour;
      break;
    case 'WAIT_LIST':
      sendOnDate = now + thirdHour;
      break;
    case 'UNALLOCATED_TICKETS':
      sendOnDate = now + halfHour;
      break;
    case 'AD_HOC_A':
      sendOnDate = now + halfHour;
      break;
    case 'AD_HOC_B':
      sendOnDate = now + halfHour;
      break;
    default:
      throw new Error(
        `Unknown message type ${messageType}, unable to determine sendOn date`,
      );
  }

  dlog('will send on %s', Date(sendOnDate));

  return new Date(sendOnDate);
}
