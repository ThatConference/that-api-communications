import debug from 'debug';
import allocationStore from '../../../dataSources/cloudFirestore/orderAllocation';

const dlog = debug('that:api:communications:query:eventTicketsCaboodle');

export const fieldResolvers = {
  EventTicketsCaboodleQuery: {
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
