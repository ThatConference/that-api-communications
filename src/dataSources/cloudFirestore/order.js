import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug('that:api:communications:dataSources:firebase:order');
const { orders: orderDateForge } = utility.firestoreDateForge;

const collectionName = 'orders';

const order = dbInstance => {
  dlog('order instance created');
  const orderCollection = dbInstance.collection(collectionName);

  function findAllOrdersByEvent(eventId) {
    dlog('findAllOrdersByEvent, %s', eventId);
    return orderCollection
      .where('event', '==', eventId)
      .get()
      .then(querySnap =>
        querySnap.docs.map(d => {
          const r = {
            id: d.id,
            ...d.data(),
          };

          return orderDateForge(r);
        }),
      );
  }

  return { findAllOrdersByEvent };
};

export default order;
