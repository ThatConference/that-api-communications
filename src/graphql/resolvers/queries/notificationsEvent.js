import debug from 'debug';

const dlog = debug('that:api:notifications:query:notificationsEvent');

export const fieldResolvers = {
  NotificationsEventQuery: {
    registered: () => {
      dlog('registered resolver called');
      throw new Error('not implemented');
    },
    unregistered: () => {
      dlog('unregistered resolver called');
      throw new Error('not implemented');
    },
  },
};
