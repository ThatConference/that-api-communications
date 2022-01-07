import root from './root';

import { fieldResolvers as communicationFields } from './communications';
import { fieldResolvers as communicationsMessagesFields } from './communicationsMessages';
import { fieldResolvers as messageDefinitionFields } from './messageDefinition';
import { fieldResolvers as eventAllocationFields } from './eventAllocation';
import { fieldResolvers as eventOrderFields } from './eventOrder';
import { fieldResolvers as caboodleFields } from './caboodle';
import { fieldResolvers as eventCaboodleFields } from './eventCaboodle';
import { fieldResolvers as eventMembersCaboodleFields } from './eventMembersCaboodle';
import { fieldResolvers as eventTicketsCaboodleFields } from './eventTicketsCaboodle';
import { fieldResolvers as eventSessionCaboodleFields } from './eventSessionsCaboodle';
import { fieldResolvers as speakerSessionsFields } from './speakerSessions';
import { fieldResolvers as newsFields } from './news';
import { fieldResolvers as newsPostFields } from './newsPost';
import { fieldResolvers as meNewsPostFields } from './meNews';

export default {
  ...root,
};

export const fieldResolvers = {
  ...communicationFields,
  ...communicationsMessagesFields,
  ...messageDefinitionFields,
  ...eventAllocationFields,
  ...eventOrderFields,
  ...caboodleFields,
  ...eventCaboodleFields,
  ...eventMembersCaboodleFields,
  ...eventTicketsCaboodleFields,
  ...eventSessionCaboodleFields,
  ...speakerSessionsFields,
  ...newsFields,
  ...newsPostFields,
  ...meNewsPostFields,
};
