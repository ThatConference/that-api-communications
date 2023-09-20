// GraphQL queries for running checks and validations

const queries = {
  thatApiValidation: {
    gqlQuery: `
      query validatingThatApi {
        communities {
          community(findBy: { slug: "that" }) {
            get {
              events(filter: ACTIVE) {
                id
              }
            }
          }
        }
      }
    `,
    dataPath: 'data.communities.community.get.events',
  },
};

export default { thatApiValidation: queries.thatApiValidation };
