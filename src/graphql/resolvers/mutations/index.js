import rootMutation from './root';

import { fieldResolvers as communicationFields } from './communications';

export default {
  ...rootMutation,
};

export const fieldResolvers = {
  ...communicationFields,
};
