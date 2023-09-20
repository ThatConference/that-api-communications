import debug from 'debug';
import { fetchThatApiValidationCheck } from '../../../lib/graphql/fetch';

const dlog = debug('that:api:communications:quey:communicationChecks');

export const fieldResolvers = {
  CommunicationsChecksQuery: {
    check: () => {
      dlog('✅ Communications check');
      return true;
    },
    validateThatApiRequest: (_, __, { dataSources: { thatApi } }) => {
      dlog('✅ Validate THATApi RESTDataSource called');
      return fetchThatApiValidationCheck({ thatApi });
    },
  },
};
