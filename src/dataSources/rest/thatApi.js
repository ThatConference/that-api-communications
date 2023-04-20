import debug from 'debug';
import { RESTDataSource } from '@apollo/datasource-rest';
import envConfig from '../../envConfig';

const dlog = debug('that:api:communications:dataSources:rest:thatapi');

class ThatApi extends RESTDataSource {
  constructor({ authToken }) {
    super();
    this.baseURL = envConfig.thatGateway;
    this.authToken = authToken;
  }

  willSendRequest(request) {
    dlog('⚡ willSendRequest:: %o', request);
    request.headers.authorization = this.authToken;
  }

  postGraphQl(payload) {
    return this.post('', {
      body: payload,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // return this.post('', payload, {
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // });
  }
}

export default ThatApi;
