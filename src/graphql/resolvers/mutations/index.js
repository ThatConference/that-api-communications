import rootMutation from './root';

import { fieldResolvers as notificationFields } from './notifications';

export default {
  ...rootMutation,
};

export const fieldResolvers = {
  ...notificationFields,
};
