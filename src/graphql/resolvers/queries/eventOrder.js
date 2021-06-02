export const fieldResolvers = {
  EventOrder: {
    orderId: ({ id: orderId }) => orderId,
    event: ({ event: id }) => ({ id }),
    allocatedTo: ({ allocatedTo: id }) => (id ? { id } : null),
    purchasedBy: ({ member: id }) => ({ id }),
  },
};
