import debug from 'debug';
import { utility } from '@thatconference/api';

const dlog = debug(
  'that:api:communications:dataSources:firebase:orderAllocation',
);
const { entityDateForge } = utility.firestoreDateForge;
const allocationDateForge = entityDateForge({ fields: ['lastUpdatedAt'] });

const collectionName = 'orderAllocations';

const orderAllocation = dbInstance => {
  dlog('orderAllocation instance created');

  const oaCollection = dbInstance.collection(collectionName);

  function findAllAllocationsByEvent({ eventId, productTypes }) {
    dlog('findAllAllocationsByEventFiltered, %s, %o', eventId, productTypes);
    let query = oaCollection.where('event', '==', eventId || '');

    if (productTypes && !Array.isArray(productTypes))
      throw new Error(
        'When provided productTypes parameter must be in the form of an array',
      );
    else if (productTypes && Array.isArray(productTypes)) {
      query = query.where('productType', 'in', productTypes);
    }

    return query.get().then(querySnap =>
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

  function findNotAllocatedAllocationsByEvent({ eventId, productTypes }) {
    dlog(
      'findNotAllocatedAllocationsByEvent called for %s for products %o',
      eventId,
      productTypes,
    );
    // TODO: future when `status` is on all records
    // don't include REFUNDED orderAllocations
    let query = oaCollection
      .where('event', '==', eventId || '')
      .where('isAllocated', '==', false);
    if (productTypes && !Array.isArray(productTypes))
      throw new Error(
        'When provided productTypes parameter must be in the form of an array',
      );
    else if (productTypes && Array.isArray(productTypes)) {
      query = query.where('productType', 'in', productTypes);
    }

    return query.get().then(querySnap =>
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
