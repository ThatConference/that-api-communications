import rootMutation from './root';

import { fieldResolvers as communicationsFields } from './communications';
import { fieldResolvers as communicationsMessagesFields } from './communicationsMessages';
import { fieldResolvers as communicationsMessageFields } from './communicationsMessage';

export default {
  ...rootMutation,
};

export const fieldResolvers = {
  ...communicationsFields,
  ...communicationsMessagesFields,
  ...communicationsMessageFields,
};
