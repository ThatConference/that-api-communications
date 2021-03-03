import debug from 'debug';

const dlog = debug('that:api:communications:query:communications');

export const fieldResolvers = {
  communicationsQuery: {
    event: () => {
      dlog('event reslover called');
      throw new Error('not implemented');
    },
  },
};
