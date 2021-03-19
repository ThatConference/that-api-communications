import debug from 'debug';
import messageAddresseeQuery from './queries/that';
import getObjectAtPath from '../getObjectAtPath';

const dlog = debug('that:api:communications:graphql:fetch');

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
