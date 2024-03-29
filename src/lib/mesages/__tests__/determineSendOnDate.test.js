import determineSendOnDate from '../determineSendOnDate';

const dayMilis = 24 * 60 * 60 * 1000; // 86400000

const tests = [
  {
    messageType: 'THIRTY_DAYS_OUT',
    expect: '2021-02-10T11:00:00.000Z',
  },
  {
    messageType: 'TWO_WEEKS_OUT',
    expect: '2021-02-26T11:00:00.000Z',
  },
  {
    messageType: 'THREE_DAYS_OUT',
    expect: '2021-03-09T11:00:00.000Z',
  },
  {
    messageType: 'BE_PREPARED',
    expect: '2021-03-11T11:00:00.000Z',
  },
  {
    messageType: 'WELCOME',
    expect: '2021-03-12T11:30:00.000Z',
  },
  {
    messageType: 'THANK_YOU',
    expect: '2021-03-15T16:30:00.000Z',
  },
];

describe('test determineSendOnDate', () => {
  const startDate = new Date('2021-03-12T11:00:00.000Z');
  const endDate = new Date('2021-03-14T16:30:00.000Z');

  it('does not mutate start and stop dates', () => {
    determineSendOnDate({ startDate, endDate, messageType: 'REGRETS' });
    expect(startDate.getTime()).toBe(
      new Date('2021-03-12T11:00:00.000Z').getTime(),
    );
    expect(endDate.getTime()).toBe(
      new Date('2021-03-14T16:30:00.000Z').getTime(),
    );
  });

  describe(`test message types (${tests.length}) `, () => {
    tests.forEach(t => {
      it(`calculates ${t.messageType}`, () => {
        const sendOn = determineSendOnDate({
          startDate,
          endDate,
          messageType: t.messageType,
        });
        expect(sendOn.getTime()).toBe(new Date(t.expect).getTime());
      });
    });

    it(`calculates ACCEPTED (now + 20 min)`, () => {
      const nowlow = new Date().getTime() + 1200000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'ACCEPTED',
      });
      const nowhigh = new Date().getTime() + 1200000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates ACCEPTED_ONLINE (now + 20 min)`, () => {
      const nowlow = new Date().getTime() + 1200000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'ACCEPTED_ONLINE',
      });
      const nowhigh = new Date().getTime() + 1200000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates ACCEPTED_IN_PERSON (now + 20 min)`, () => {
      const nowlow = new Date().getTime() + 1200000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'ACCEPTED_IN_PERSON',
      });
      const nowhigh = new Date().getTime() + 1200000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates REGRETS (a.k.a. regerts) (now + 20 min)`, () => {
      const nowlow = new Date().getTime() + 1200000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'REGRETS',
      });
      const nowhigh = new Date().getTime() + 1200000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates WAIT_LITED (now + 20 min)`, () => {
      const nowlow = new Date().getTime() + 1200000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'WAIT_LIST',
      });
      const nowhigh = new Date().getTime() + 1200000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates UNALLOCATED_TICKETS (now + 1/2 hr)`, () => {
      const nowlow = new Date().getTime() + 1800000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'UNALLOCATED_TICKETS',
      });
      const nowhigh = new Date().getTime() + 1800000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates AD_HOC_A (now + 1/2 hr)`, () => {
      const nowlow = new Date().getTime() + 1800000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'AD_HOC_A',
      });
      const nowhigh = new Date().getTime() + 1800000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`calculates AD_HOC_B (now + 1/2 hr)`, () => {
      const nowlow = new Date().getTime() + 1800000;
      const sendOn = determineSendOnDate({
        startDate,
        endDate,
        messageType: 'AD_HOC_B',
      });
      const nowhigh = new Date().getTime() + 1800000;
      expect(sendOn.getTime()).toBeGreaterThanOrEqual(nowlow);
      expect(sendOn.getTime()).toBeLessThanOrEqual(nowhigh);
    });
    it(`throws on unknown message type`, () => {
      expect(() =>
        determineSendOnDate({
          startDate,
          endDate,
          messageType: 'NOT_A_MESSAGE_TYPE!',
        }),
      ).toThrowError(
        `Unknown message type NOT_A_MESSAGE_TYPE!, unable to determine sendOn date`,
      );
    });
  });
});
