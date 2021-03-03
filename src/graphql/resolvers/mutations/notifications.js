import debug from 'debug';

const dlog = debug('that:api:notifications:mutation:notifications');

export const fieldResolvers = {
  NotificationsMutation: {
    notification: () => {
      dlog('notification called for %s');
      throw new Error('Not implemented yet');
    },
  },
};
