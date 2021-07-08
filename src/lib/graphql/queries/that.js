import sessionSelection from './sessionSelection';

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
  orderHolders: {
    gqlQuery: `query getOrderUsers($eventId: ID!) {
      caboodle {
        event(eventId: $eventId) {
          members {
            orderHolders {
              orderId
              event {
                id
                name
              }
              purchasedBy {
                firstName
                lastName
                profileSlug
                email
              }
              lastUpdatedAt
              orderDate
            }
          }
        }
      }
    }`,
    dataPath: `data.caboodle.event.members.orderHolders`,
  },
  subscriber: {
    gqlQuery: ``,
    dataPath: '',
  },
  memberExpire: {
    gqlQuery: ``,
    dataPath: '',
  },
  ...sessionSelection,
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
    case 'ORDER_HOLDERS':
      query = messageQuery.orderHolders;
      break;
    case 'ACCEPTED':
      query = messageQuery.accepted;
      break;
    case 'REGRETS':
      query = messageQuery.regrets;
      break;
    case 'WAIT_LIST':
      query = messageQuery.waitListed;
      break;
    default:
      throw new Error(`Unknown dataSource type requested: ${dataSourceType}`);
  }

  return query;
};
