import constants from './constants';

function configMissing(configKey) {
  throw new Error(`missing required .env setting for ${configKey}`);
}

const requiredConfig = () => ({
  postmarkApiToken:
    process.env.POSTMARK_API_TOKEN || configMissing('POSTMARK_API_TOKEN'),
  defaultProfileImage:
    'https://images.that.tech/members/person-placeholder.jpg',
  thatGateway:
    process.env.THAT_API_GATEWAY || configMissing('THAT_API_GATEWAY'),
  messageQueueWriteRate:
    process.env.MESSAGING_WRITE_QUEUE_RATE ||
    constants.THAT.MESSAGING.WRITE_QUEUE_RATE ||
    configMissing('MESSAGING_WRITE_QUEUE_RATE'),
});

export default requiredConfig();
