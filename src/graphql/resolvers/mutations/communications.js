import debug from 'debug';

const dlog = debug('that:api:communications:mutation:communications');

export const fieldResolvers = {
  communicationsMutation: {
    communication: () => {
      dlog('communication called for %s');
      throw new Error('Not implemented yet');
    },
  },
};
