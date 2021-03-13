import * as yup from 'yup';
import createMessageQueue from '../createMessageQueue';
import addressees from './data/addressees.json';

const queueMessageSchema = yup.object().shape({
  emailTo: yup.string().email(),
  isQueued: yup.boolean().required(),
  isSent: yup.boolean().required(),
  postmarkAlias: yup.string().required().min(5),
  postmarkMessageType: yup.string().required().uppercase(),
  queueDate: yup.date().required(),
  sendOnDate: yup.date().required(),
  templateModel: yup.object({
    member: yup.object({
      email: yup.string().min(0),
      firstName: yup.string().min(0),
      lastName: yup.string().min(0),
    }),
    purchasedBy: yup.object({
      email: yup.string().min(0),
      firstName: yup.string().min(0),
      lastName: yup.string().min(0),
    }),
  }),
});

describe('createMessageQueue tests', () => {
  const event = {
    name: 'THAT Conference',
    startDate: new Date('2021-03-12T21:40:40.431Z'),
    endDate: new Date('2021-03-12T21:40:40.431Z'),
  };
  const message = {
    name: 'Test Message',
    description: 'This is only a test...',
    dataSource: 'REGISTERRED',
    emailToTemplatePath: 'member.email',
    isOnline: true,
    messageType: 'THREE_DAYS_OUT',
    postmarkAlias: 'test-record-alias',
    postmarkMessageType: 'TRANSACTIONAL',
  };
  const sendOnDate = new Date('2021-03-15T21:40:40.431Z');
  const constants = {
    THAT: {
      MESSAGING: {
        WRITE_QUEUE_RATE: 2,
      },
    },
  };

  describe('Queue messages and validate message objects', () => {
    describe('queue message checks', () => {
      const result = createMessageQueue({
        addressees,
        event,
        message,
        sendOnDate,
        constants,
      });
      it('queue will be the length of 3', () => {
        expect(result).toHaveLength(3);
      });
      it('will have a total queue count of 5', () => {
        const count = result.reduce((acc, cur) => acc + cur.length, 0);
        expect(count).toBe(5);
      });
      describe('yup validate created queue messages', () => {
        let c = 0;
        result.forEach(q => {
          q.forEach(iq => {
            c += 1;
            it(`validate message #${c}`, () =>
              expect(
                queueMessageSchema
                  .validate(iq, { strict: true, abortEarly: true })
                  .then(() => true),
              ).resolves.toEqual(true));
          });
        });
      });
    });
  });
});
