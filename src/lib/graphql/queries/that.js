const messageQuery = {
  registered: {
    gqlQuery: `query getRegisteredUsers($eventId: ID!) {
      caboodle {
        event(eventId: $eventId) {
          members {
            registered {
              event {
                name
                startDate
                type
                slug
                website
              }
              allocatedTo {
                firstName
                lastName
                email
              }
              purchasedBy {
                firstName
              }
            }
          }
        }
      }
    }`,
    dataPath: 'data.caboodle.event.members.registered',
  },
  unallocated: {
    gqlQuery: `query getUnregisteredAllocations($eventId: ID!) {
    caboodle {
      event(eventId: $eventId) {
        members {
          unregistered {
            event {
              name
              startDate
              type
              slug
              website              
            }
            purchasedBy {
              firstName
              lastName
              email
            }
          }
        }
      }
    }
  }`,
    dataPath: 'data.caboodle.event.members.unregistered',
  },
  subscriber: {
    gqlQuery: ``,
    dataPath: '',
  },
  memberExpire: {
    gqlQuery: ``,
    dataPath: '',
  },
};

export default dataSourceType => {
  let query = null;
  switch (dataSourceType) {
    case 'REGISTERED':
      query = messageQuery.registered;
      break;
    case 'UNALLOCATED':
      query = messageQuery.unallocated;
      break;
    default:
      throw new Error(`Unknown dataSource type requested: ${dataSourceType}`);
  }

  return query;
};
