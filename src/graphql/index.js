import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { buildSubgraphSchema } from '@apollo/subgraph';
import debug from 'debug';
import * as Sentry from '@sentry/node';
import {
  security,
  dataSources as thatApiDataSources,
} from '@thatconference/api';
import { isNil } from 'lodash';
import DataLoader from 'dataloader';

// Graph Types and Resolvers
import typeDefs from './typeDefs';
import resolvers from './resolvers';
import directives from './directives';
import ThatApi from '../dataSources/rest/thatApi';

const dlog = debug('that:api:communications:graphServer');
const jwtClient = security.jwt();
const memberStore = thatApiDataSources.cloudFirestore.member;

/**
 * will create you a configured instance of an apollo gateway
 * @param {object} userContext - user context that w
 * @return {object} a configured instance of an apollo gateway.
 *
 * @example
 *
 *     createGateway(userContext)
 */
const createServerParts = ({ dataSources, httpServer }) => {
  dlog('🚜 creating apollo server and context');
  let schema = {};

  dlog('🚜 building subgraph schema');
  schema = buildSubgraphSchema([{ typeDefs, resolvers }]);

  const directiveTransformers = [
    directives.auth('auth').authDirectiveTransformer,
  ];

  dlog('🚜 adding directiveTransformers: %O', directiveTransformers);
  schema = directiveTransformers.reduce(
    (curSchema, transformer) => transformer(curSchema),
    schema,
  );

  dlog('🚜 assembling datasources');
  const { firestore } = dataSources;
  const amendedDataSources = {
    ...dataSources,
    memberLoader: new DataLoader(ids =>
      memberStore(firestore)
        .getSecureBatch(ids)
        .then(members => {
          if (members.includes(null)) {
            Sentry.withScope(scope => {
              scope.setLevel('error');
              scope.setContext(
                `Members requested in memberLoader don't exist in member collection`,
                { ids },
                { members },
              );
              Sentry.captureMessage(
                `Members requested in memberLoader don't exist in member collection`,
              );
            });
          }
          return ids.map(id => members.find(m => m && m.id === id));
        }),
    ),
  };

  dlog('🚜 creating new apollo server instance');
  const graphQlServer = new ApolloServer({
    schema,
    introspection: JSON.parse(process.env.ENABLE_GRAPH_INTROSPECTION || false),
    csrfPrevention: true,
    cache: 'bounded',
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    formatError: err => {
      dlog('formatError %O', err);

      Sentry.addBreadcrumb({
        category: 'apollo server',
        message: 'graphql format error discovered',
        level: 'warning',
      });

      Sentry.withScope(scope => {
        scope.setTag('formatError', true);
        scope.setLevel('warning');
        scope.setContext('originalError', { originalError: err.originalError });
        scope.setContext('path', { path: err.path });
        scope.setContext('error object', { error: err });
        Sentry.captureException(err);
      });

      return err;
    },
  });

  dlog('🚜 creating createContext function');
  const createContext = async ({ req, res }) => {
    dlog('🚜 building graphql user context');
    let context = {
      dataSources: {
        ...amendedDataSources,
      },
    };

    dlog('🚜 auth header %o', req.headers);
    if (!isNil(req.headers.authorization)) {
      dlog('🚜 validating token for %o:', req.headers.authorization);

      Sentry.addBreadcrumb({
        category: 'graphql context',
        message: `user has authToken`,
        level: 'info',
      });

      const validatedToken = await jwtClient.verify(req.headers.authorization);

      Sentry.configureScope(scope => {
        scope.setUser({
          id: validatedToken.sub,
          permissions: validatedToken.permissions.toString(),
        });
      });

      dlog('🚜 validated token: %o', validatedToken);
      context = {
        user: {
          ...validatedToken,
          authToken: req.userContext.authToken,
          site: req.userContext.site,
          correlationId: req.userContext.correlationId,
        },
        dataSources: {
          ...amendedDataSources,
          thatApi: new ThatApi({ authToken: req.userContext.authToken }),
        },
      };
    }

    return context;
  };

  return {
    graphQlServer,
    createContext,
  };
};

export default createServerParts;

// const createServer = ({ dataSources }) => {
//   dlog('creating apollo server');
//   let schema = {};

//   schema = buildSubgraphSchema([{ typeDefs, resolvers }]);
//   const directiveTransformers = [
//     directives.auth('auth').authDirectiveTransformer,
//   ];

//   dlog('directiveTransformers: %O', directiveTransformers);
//   schema = directiveTransformers.reduce(
//     (curSchema, transformer) => transformer(curSchema),
//     schema,
//   );

//   return new ApolloServer({
//     schema,
//     introspection: JSON.parse(process.env.ENABLE_GRAPH_INTROSPECTION || false),
//     csrfPrevention: true,
//     cache: 'bounded',
//     dataSources: () => {
//       dlog('creating dataSources');
//       const { firestore } = dataSources;

//       const memberLoader = new DataLoader(ids =>
//         memberStore(firestore)
//           .getSecureBatch(ids)
//           .then(members => {
//             if (members.includes(null)) {
//               Sentry.withScope(scope => {
//                 scope.setLevel('error');
//                 scope.setContext(
//                   `Members requested in memberLoader don't exist in member collection`,
//                   { ids },
//                   { members },
//                 );
//                 Sentry.captureMessage(
//                   `Members requested in memberLoader don't exist in member collection`,
//                 );
//               });
//             }
//             return ids.map(id => members.find(m => m && m.id === id));
//           }),
//       );

//       return {
//         ...dataSources,
//         memberLoader,
//         thatApi: new ThatApi(),
//       };
//     },
//     context: async ({ req, res }) => {
//       dlog('building graphql user context');
//       let context = {};

//       if (!isNil(req.headers.authorization)) {
//         dlog('validating token for %o:', req.headers.authorization);
//         Sentry.addBreadcrumb({
//           category: 'graphql context',
//           message: 'user has authToken',
//           level: 'info',
//         });

//         const validatedToken = await jwtClient.verify(
//           req.headers.authorization,
//         );

//         Sentry.configureScope(scope => {
//           scope.setUser({
//             id: validatedToken.sub,
//             permissions: validatedToken.permissions.toString(),
//           });
//         });

//         dlog('validated token: %o', validatedToken);
//         context = {
//           ...context,
//           user: {
//             ...validatedToken,
//             authToken: req.userContext.authToken,
//             site: req.userContext.site,
//             correlationId: req.userContext.correlationId,
//           },
//         };
//       }

//       return context;
//     },
//     plugins: [],
//     formatError: err => {
//       dlog('formatError %O', err);

//       Sentry.withScope(scope => {
//         scope.setTag('formatError', true);
//         scope.setLevel('warning');
//         scope.setExtra('originalError', err.originalError);
//         scope.setExtra('path', err.path);
//         Sentry.captureException(err);
//       });

//       return err;
//     },
//   });
// };

// export default createServer;
