import root from './root';

import { fieldResolvers as notificationFields } from './notifications';
import { fieldResolvers as notificationEventFields } from './notificationsEvent';

export default {
  ...root,
};

export const fieldResolvers = {
  ...notificationFields,
  ...notificationEventFields,
};
