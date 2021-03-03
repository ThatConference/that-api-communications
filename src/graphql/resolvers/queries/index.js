import root from './root';

import { fieldResolvers as communicationFields } from './communications';
import { fieldResolvers as communicationEventFields } from './communicationsEvent';

export default {
  ...root,
};

export const fieldResolvers = {
  ...communicationFields,
  ...communicationEventFields,
};
