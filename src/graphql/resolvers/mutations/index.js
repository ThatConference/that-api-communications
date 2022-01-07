import rootMutation from './root';

import { fieldResolvers as communicationsFields } from './communications';
import { fieldResolvers as communicationsMessagesFields } from './communicationsMessages';
import { fieldResolvers as communicationsMessageFields } from './communicationsMessage';
import { fieldResolvers as newsMutationFields } from './news';
import { fieldResolvers as newsPostMutationFields } from './newsPost';
import { fieldResolvers as newsPostMeMutationFields } from './newsPostMe';
import { fieldResolvers as newsPostAdminMutationFields } from './newsPostAdmin';

export default {
  ...rootMutation,
};

export const fieldResolvers = {
  ...communicationsFields,
  ...communicationsMessagesFields,
  ...communicationsMessageFields,
  ...newsMutationFields,
  ...newsPostMutationFields,
  ...newsPostMeMutationFields,
  ...newsPostAdminMutationFields,
};
