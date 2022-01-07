export const fieldResolvers = {
  NewsPostMutation: {
    me: ({ newsPost }) => ({ newsPost }),
    admin: ({ newsPost }) => ({ newsPost }),
  },
};
