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

if (!constants.THAT.MESSAGING) constants.THAT.MESSAGING = {};
constants.THAT.MESSAGING.WRITE_QUEUE_RATE = 100;

export default constants;
