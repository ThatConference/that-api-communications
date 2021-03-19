import debug from 'debug';

const dlog = debug('that:api:communications:query:caboodle');

export const fieldResolvers = {
  CaboodleQuery: {
    event: (_, { eventId }) => {
      dlog('event reslover called for %s', eventId);
      return { eventId };
    },
  },
};
