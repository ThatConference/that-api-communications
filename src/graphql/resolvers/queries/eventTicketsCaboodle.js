import debug from 'debug';
import allocationStore from '../../../dataSources/cloudFirestore/orderAllocation';

const dlog = debug('that:api:communications:query:eventTicketsCaboodle');

export const fieldResolvers = {
  EventTicketsCaboodleQuery: {
    all: ({ eventId }, { productTypes }, { dataSources: { firestore } }) => {
      dlog(
        'all allocations for event %s with product types %o',
        eventId,
        productTypes,
      );
      // get's all allocations for event
      return allocationStore(firestore)
        .findAllAllocationsByEvent({
          eventId,
          productTypes,
        })
        .then(data => {
          // deduplicate purchasers and allocated to id's
          dlog('OrderAllocation Count: %d', data.length);
          const attendees = new Set();
          data.forEach(oa => {
            if (!oa.status || oa.status !== 'REFUNDED') {
              attendees.add(oa.purchasedBy);
              if (oa.allocatedTo) attendees.add(oa.allocatedTo);
            }
          });
          return [...attendees].map(id => ({ id }));
        });
    },
    allocated: ({ eventId }, __, { dataSources: { firestore } }) => {
      dlog('allocated resolver called for %s', eventId);
      // return allocationStore(firestore).findIsAllocatedAllocationsByEvent(
      //   eventId,
      // );
      throw new Error('Not Implemented yet');
    },
    unallocated: ({ eventId }, __, { dataSources: { firestore } }) => {
      dlog('unallocated resolver called for %s', eventId);
      // return allocationStore(firestore).findNotAllocatedAllocationsByEvent(
      //   eventId,
      // );
      throw new Error('Not Implemented yet');
    },
  },
};
