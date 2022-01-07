export const fieldResolvers = {
  NewsPost: {
    isApproved: ({ approvedBy, approvedAt }) =>
      approvedBy !== null && approvedAt !== null,
    tags: ({ tags }) => tags ?? [],
    createdBy: ({ createdBy }, __, { dataSources: { memberLoader } }) =>
      memberLoader.load(createdBy),
  },
};
