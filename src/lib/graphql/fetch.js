import debug from 'debug';
import messageAddresseeQuery from './queries/that';
import getObjectAtPath from '../getObjectAtPath';
import checksQueries from './queries/checks';

const dlog = debug('that:api:communications:graphql:fetch');

function fetchAddressees({
  eventId,
  msgDataSource,
  thatApi,
  addVariables = {},
}) {
  dlog(
    'fetchAddressees called for event %s with datasource %s',
    eventId,
    msgDataSource,
  );

  const query = messageAddresseeQuery(msgDataSource);
  const payload = {
    query: query.gqlQuery,
    variables: {
      eventId,
      ...addVariables,
    },
  };

  return thatApi
    .postGraphQl(payload)
    .then(data => getObjectAtPath(data, query.dataPath));
}

function fetchThatApiValidationCheck({ thatApi }) {
  dlog('⚡ fetch THATApi validation check called');
  const query = checksQueries.thatApiValidation;
  const payload = {
    query: query.gqlQuery,
    variables: {},
  };

  return thatApi.postGraphQl(payload).then(data => {
    const result = getObjectAtPath(data, query.dataPath);
    dlog('✅ ThatApi check result: %o', result);
    return result?.length >= 0;
  });
}

export { fetchAddressees, fetchThatApiValidationCheck };
