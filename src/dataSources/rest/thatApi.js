import debug from 'debug';
import { RESTDataSource } from 'apollo-datasource-rest';
import envConfig from '../../envConfig';

const dlog = debug('that:api:communications:dataSources:rest:thatapi');

class ThatApi extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = envConfig.thatGateway;
  }

  willSendRequest(request) {
    dlog('willSendRequest:: %o', request);
    request.headers.set('Authorization', this.context.user.authToken);
  }

  postGraphQl(payload) {
    return this.post('', payload, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export default ThatApi;
