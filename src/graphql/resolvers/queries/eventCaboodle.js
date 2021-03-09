import debug from 'debug';

const dlog = debug('that:api:communications:query:eventCaboodle');

export const fieldResolvers = {
  EventCaboodleQuery: {
    members: ({ eventId }) => {
      dlog('members called for event %s', eventId);
      return { eventId };
    },
    tickets: ({ eventId }) => {
      dlog('ticket called for event %s', eventId);
      return { eventId };
    },
  },
};
