export const fieldResolvers = {
  MessageDefinition: {
    event: ({ event: id }) => (id ? { id } : null),
  },
};
