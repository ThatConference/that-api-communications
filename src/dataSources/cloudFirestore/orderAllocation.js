import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug(
  'that:api:communications:datasources:firebase:orderAllocation',
);
const { entityDateForge } = utility.firestoreDateForge;
const allocationDateForge = entityDateForge({ fields: ['lastUpdatedAt'] });

const collectionName = 'orderAllocations';

const orderAllocation = dbInstance => {
  dlog('orderAllocation instance created');

  const oaCollection = dbInstance.collection(collectionName);

  function findAllAllocationsByEvent(eventId) {
    dlog('findAllAllocationsByEvent called for %s', eventId);
    return oaCollection
      .where('event', '==', eventId || '')
      .get()
      .then(querySnap =>
        querySnap.docs.map(d => {
          const r = {
            id: d.id,
            ...d.data(),
          };

          return allocationDateForge(r);
        }),
      );
  }

  function findIsAllocatedAllocationsByEvent(eventId) {
    dlog('findIsAllocatedAllocationsByEvent called for %s', eventId);
    return oaCollection
      .where('event', '==', eventId || '')
      .where('isAllocated', '==', true)
      .get()
      .then(querySnap =>
        querySnap.docs.map(d => {
          const r = {
            id: d.id,
            ...d.data(),
          };

          return allocationDateForge(r);
        }),
      );
  }

  function findNotAllocatedAllocationsByEvent(eventId) {
    dlog('findNotAllocatedAllocationsByEvent called for %s', eventId);
    return oaCollection
      .where('event', '==', eventId || '')
      .where('isAllocated', '==', false)
      .get()
      .then(querySnap =>
        querySnap.docs.map(d => {
          const r = {
            id: d.id,
            ...d.data(),
          };

          return allocationDateForge(r);
        }),
      );
  }

  return {
    findAllAllocationsByEvent,
    findIsAllocatedAllocationsByEvent,
    findNotAllocatedAllocationsByEvent,
  };
};

export default orderAllocation;
