import debug from 'debug';

const dlog = debug('that:api:communications:query:communicationsEvent');

export const fieldResolvers = {
  communicationsEventQuery: {
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
