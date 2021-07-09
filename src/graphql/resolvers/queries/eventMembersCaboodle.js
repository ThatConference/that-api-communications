import debug from 'debug';
import allocationStore from '../../../dataSources/cloudFirestore/orderAllocation';
import orderStore from '../../../dataSources/cloudFirestore/order';

const dlog = debug('that:api:communications:query:eventMembersCaboodle');

export const fieldResolvers = {
  EventMembersCaboodleQuery: {
    registered: ({ eventId }, __, { dataSources: { firestore } }) => {
      dlog('registered resolver called for %s', eventId);
      return allocationStore(firestore).findIsAllocatedAllocationsByEvent(
        eventId,
      );
    },
    unregistered: (
      { eventId },
      { productTypes },
      { dataSources: { firestore } },
    ) => {
      dlog('unregistered resolver called for %s', eventId);
      return allocationStore(firestore)
        .findNotAllocatedAllocationsByEvent({
          eventId,
          productTypes,
        })
        .then(allocations =>
          allocations.filter(a => !a.status || a.status !== 'REFUNDED'),
        );
    },
    orderHolders: ({ eventId }, __, { dataSources: { firestore } }) => {
      dlog('orderHolders resolvered called for %s, eventId');
      return orderStore(firestore).findAllOrdersByEvent(eventId);
    },
  },
};
