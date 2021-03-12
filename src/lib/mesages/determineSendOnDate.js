import debug from 'debug';

const dlog = debug('that:api:communications:determineSendOnDate');

export default function determineSendOnDate({
  startDate,
  endDate,
  messageType,
}) {
  dlog('determineSendOnDate for a message');

  const oneDay = 86400000; // in milliseconds
  const oneHour = 60000;
  const now = new Date().getTime();
  const _startDate = new Date(startDate).getTime();
  const _endDate = new Date(endDate).getTime();
  let sendOnDate;
  switch (messageType) {
    case 'THIRTY_DAYS_OUT':
      sendOnDate = _startDate + oneDay * 30;
      break;
    case 'TWO_WEEKS_OUT':
      sendOnDate = _startDate + oneDay * 14;
      break;
    case 'THREE_DAYS_OUT':
      sendOnDate = _startDate + oneDay * 3;
      break;
    case 'BE_PREPARED':
      sendOnDate = _startDate + oneDay;
      break;
    case 'WELCOME':
      sendOnDate = _startDate;
      break;
    case 'THANK_YOU':
      sendOnDate = _endDate + oneDay;
      break;
    case 'ACCEPTED':
      sendOnDate = now + oneHour;
      break;
    case 'REGRETS':
      sendOnDate = now + oneHour;
      break;
    default:
      throw new Error(
        `Unknown message type ${messageType}, unable to determine sendOn date`,
      );
  }

  dlog('will send on %s', Date(sendOnDate));

  return new Date(sendOnDate);
}
