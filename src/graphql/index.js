import { ApolloServer, SchemaDirectiveVisitor } from 'apollo-server-express';
import { buildFederatedSchema } from '@apollo/federation';
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
const createServer = ({ dataSources }) => {
  dlog('creating graph server');

  const schema = buildFederatedSchema([{ typeDefs, resolvers }]);
  SchemaDirectiveVisitor.visitSchemaDirectives(schema, directives);

  return new ApolloServer({
    schema,
    introspection: JSON.parse(process.env.ENABLE_GRAPH_INTROSPECTION || false),
    playground: JSON.parse(process.env.ENABLE_GRAPH_PLAYGROUND)
      ? { endpoint: '/' }
      : false,

    dataSources: () => {
      dlog('creating dataSources');
      const { firestore } = dataSources;

      const memberLoader = new DataLoader(ids =>
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
      );

      return {
        ...dataSources,
        memberLoader,
        thatApi: new ThatApi(),
      };
    },

    context: async ({ req, res }) => {
      dlog('building graphql user context');
      let context = {};

      if (!isNil(req.headers.authorization)) {
        dlog('validating token for %o:', req.headers.authorization);
        Sentry.addBreadcrumb({
          category: 'graphql context',
          message: 'user has authToken',
          level: Sentry.Severity.Info,
        });

        const validatedToken = await jwtClient.verify(
          req.headers.authorization,
        );

        Sentry.configureScope(scope => {
          scope.setUser({
            id: validatedToken.sub,
            permissions: validatedToken.permissions.toString(),
          });
        });

        dlog('validated token: %o', validatedToken);
        context = {
          ...context,
          user: {
            ...validatedToken,
            authToken: req.userContext.authToken,
            site: req.userContext.site,
            correlationId: req.userContext.correlationId,
          },
        };
      }

      return context;
    },

    plugins: [],

    formatError: err => {
      dlog('formatError %O', err);

      Sentry.withScope(scope => {
        scope.setTag('formatError', true);
        scope.setLevel('warning');
        scope.setExtra('originalError', err.originalError);
        scope.setExtra('path', err.path);
        Sentry.captureException(err);
      });

      return err;
    },
  });
};

export default createServer;
