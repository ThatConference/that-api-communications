import debug from 'debug';
import messageAddresseeQuery from './queries/that';

const dlog = debug('that:api:communications:graphql:fetch');

function getObjectAtPath(obj, path) {
  dlog('getObjectAtPath :: %o', obj);
  let data = obj;
  const pathParts = path.split('.');
  for (let i = 0; i < pathParts.length; i += 1) {
    data = data[pathParts[i]];
  }
  return data;
}

function fetchAddressees({ eventId, msgDataSource, thatApi }) {
  dlog(
    'fetchAddressees called for event %s with type %s',
    eventId,
    msgDataSource,
  );

  const query = messageAddresseeQuery(msgDataSource);
  const payload = {
    query: query.gqlQuery,
    variables: {
      eventId,
    },
  };
  return thatApi
    .postGraphQl(payload)
    .then(data => getObjectAtPath(data, query.dataPath));
}

export { fetchAddressees };
