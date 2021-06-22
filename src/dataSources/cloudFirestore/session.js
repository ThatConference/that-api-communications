import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:communications:dataSources:firebase:session');
const { sessions: sessionDateForge } = utility.firestoreDateForge;

const collectionName = 'sessions';

const session = dbInstance => {
  dlog('session instance created');
  const sessionCollection = dbInstance.collection(collectionName);

  function findAllSessionsForSelectionEmails({ eventId, targetLocation }) {
    dlog('findAllSessionsForSelectionEmails, event: %s', eventId);
    const sessionStatus = [
      'ACCEPTED',
      'NOT_ACCEPTED',
      'WAIT_LIST',
      'SCHEDULED',
    ];

    let query = sessionCollection
      .where('eventId', '==', eventId)
      .where('status', 'in', sessionStatus);
    if (targetLocation) {
      query = query.where('targetLocation', '==', targetLocation);
    }
    query = query.select('type', 'status', 'speakers');

    return query.get().then(querySnap =>
      querySnap.docs.map(d => {
        const s = {
          id: d.id,
          ...d.data(),
        };

        return sessionDateForge(s);
      }),
    );

    // return sessionCollection
    //   .where('eventId', '==', eventId)
    //   .where('status', 'in', sessionStatus)
    //   .select('type', 'status', 'speakers')
    //   .get()
    //   .then(querySnap =>
    //     querySnap.docs.map(d => {
    //       const s = {
    //         id: d.id,
    //         ...d.data(),
    //       };

    //       return sessionDateForge(s);
    //     }),
    //   );
  }

  return { findAllSessionsForSelectionEmails };
};

export default session;
