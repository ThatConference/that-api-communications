// Session selection message queries
export default {
  accepted: {
    gqlQuery: `query getAcceptedList($eventId: ID!, $targetLocation: TargetLocation) {
      caboodle {
        event(eventId: $eventId) {
          sessions(targetLocation: $targetLocation) {
            accepted {
              speaker {
                id
                firstName
                lastName
                email
              }
              sessions {
                __typename
                ... on Base {
                  id
                  slug
                  title
                  type
                  status
                  startTime
                  durationInMinutes
                  location {
                    destination
                    digitalSign
                    url
                    isOnline
                  }
                }
              }
            }
          }
        }
      }
    }
    `,
    dataPath: 'data.caboodle.event.sessions.accepted',
  },
  regrets: {
    gqlQuery: `query getRegretsList($eventId: ID!) {
      caboodle {
        event(eventId: $eventId) {
          sessions {
            regrets {
              speaker {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      }
    }
    `,
    dataPath: 'data.caboodle.event.sessions.regrets',
  },
  waitListed: {
    gqlQuery: `query getWaitListedList($eventId: ID!) {
      caboodle {
        event(eventId: $eventId) {
          sessions {
            waitListed {
              speaker {
                id
                firstName
                lastName
                email
              }
              sessions {
                __typename
                ... on Base {
                  id
                  slug
                  title
                  type
                  status
                  startTime
                  durationInMinutes
                }
              }
            }
          }
        }
      }
    }
    `,
    dataPath: 'data.caboodle.event.sessions.waitListed',
  },
};
