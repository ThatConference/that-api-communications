import debug from 'debug';

const dlog = debug('that:api:notifications:query:notifications');

export const fieldResolvers = {
  NotificationsQuery: {
    event: () => {
      dlog('event reslover called');
      throw new Error('not implemented');
    },
  },
};
