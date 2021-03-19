import { constants as apiConstants } from '@thatconference/api';

const constants = {
  ...apiConstants,
  STRIPE: {
    CHECKOUT_MODE: {
      PAYMENT: 'payment',
      SUBSCRIPTION: 'subscription',
    },
  },
};

export default constants;
