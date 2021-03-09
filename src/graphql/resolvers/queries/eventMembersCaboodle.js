import debug from 'debug';
import allocationStore from '../../../dataSources/cloudFirestore/orderAllocation';

const dlog = debug('that:api:communications:query:eventMembersCaboodle');

export const fieldResolvers = {
  EventMembersCaboodleQuery: {
    registered: ({ eventId }, __, { dataSources: { firestore } }) => {
      dlog('registered resolver called for %s', eventId);
      return allocationStore(firestore).findIsAllocatedAllocationsByEvent(
        eventId,
      );
    },
    unregistered: ({ eventId }, __, { dataSources: { firestore } }) => {
      dlog('unregistered resolver called for %s', eventId);
      return allocationStore(firestore).findNotAllocatedAllocationsByEvent(
        eventId,
      );
    },
  },
};
