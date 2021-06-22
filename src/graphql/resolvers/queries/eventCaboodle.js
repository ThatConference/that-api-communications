import debug from 'debug';
import sessionStore from '../../../dataSources/cloudFirestore/session';

const dlog = debug('that:api:communications:query:eventCaboodle');

export const fieldResolvers = {
  EventCaboodleQuery: {
    members: ({ eventId }) => {
      dlog('members called for event %s', eventId);
      return { eventId };
    },
    tickets: ({ eventId }) => {
      dlog('ticket called for event %s', eventId);
      return { eventId };
    },
    sessions: async (
      { eventId },
      { targetLocation },
      { dataSources: { firestore } },
    ) => {
      dlog('session called for event %s', eventId);
      const eventSessions = await sessionStore(
        firestore,
      ).findAllSessionsForSelectionEmails({ eventId, targetLocation });

      const acceptedMap = new Map();
      const regretsMap = new Map();
      const waitListedMap = new Map();
      const notAccpeted = [];

      eventSessions.forEach(session => {
        if (session.status === 'ACCEPTED') {
          session.speakers.forEach(spkr => {
            let a = acceptedMap.get(spkr);
            if (!a) a = [];
            a.push(session);
            acceptedMap.set(spkr, a);
          });
        } else if (session.status === 'WAIT_LIST') {
          session.speakers.forEach(spkr => {
            let w = waitListedMap.get(spkr);
            if (!w) w = [];
            w.push(session);
            waitListedMap.set(spkr, w);
          });
        } else if (session.status === 'NOT_ACCEPTED') {
          notAccpeted.push(session);
        }
      });

      notAccpeted.forEach(session => {
        session.speakers.forEach(spkr => {
          const a = acceptedMap.get(spkr);
          const w = waitListedMap.get(spkr);
          if (!a && !w) {
            regretsMap.set(spkr, []);
          }
        });
      });

      const accepted = [];
      const waitListed = [];
      const regrets = [];
      acceptedMap.forEach((value, key) => {
        accepted.push({ speakerId: key, sessions: value });
      });
      waitListedMap.forEach((value, key) => {
        waitListed.push({ speakerId: key, sessions: value });
      });
      regretsMap.forEach((value, key) => {
        regrets.push({ speakerId: key, sessions: value });
      });

      return {
        accepted,
        regrets,
        waitListed,
      };
    },
  },
};
