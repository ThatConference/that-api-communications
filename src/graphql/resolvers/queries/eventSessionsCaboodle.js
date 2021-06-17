import debug from 'debug';

const dlog = debug('that:api:communications:query:eventSessionsCaboodle');

export const fieldResolvers = {
  EventSessionsCaboodleQuery: {
    accepted: ({ accepted }) => {
      dlog('accepted:: %O', accepted);
      return accepted;
    },
    regrets: ({ regrets }) => regrets,
    waitListed: ({ waitListed }) => waitListed,
  },
};
