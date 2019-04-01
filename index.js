const crypto = require('crypto');

const ERROR_MESSAGE_NO_AUTHORIZATION = 'authorization required';
const ERROR_MESSAGE_INVALID_HEADER = 'invalid authorization header';
const ERROR_MESSAGE_INVALID_TOKEN = 'invalid authorization token';
const ERROR_MESSAGE_EXPIRED_TOKEN = 'expired authorization token';

function createDigest(encodedData, expiry, key, format) {
  return crypto
    .createHmac('sha256', key)
    .update(encodedData)
    .update(String(expiry))
    .digest(format);
}

/**
 * Encode source data to a string with a HMAC that used to detect
 * any tampering.  Thus, this data is safe to send to a client.
 * However, the data is **not** encrypted.
 */

function encode(sourceData, key, expiry) {
  const json = JSON.stringify(sourceData);
  const encodedData = Buffer.from(json).toString('base64');

  expiry = parseInt(expiry, 10) || 0;
  const digest = createDigest(encodedData, expiry, key, 'base64');

  return `${encodedData}!${digest}!${expiry}`;
}

/**
 * Decode a previously-encoded value and return it.
 */

function decode(value, key) {
  let [encodedData, sourceDigest, expiry] = value.split('!');

  if (!encodedData || !sourceDigest) {
    throw new Error(ERROR_MESSAGE_INVALID_TOKEN);
  }

  expiry = parseInt(expiry, 10);

  if (
    !crypto.timingSafeEqual(
      Buffer.from(sourceDigest, 'base64'),
      createDigest(encodedData, expiry, key)
    )
  ) {
    throw new Error(ERROR_MESSAGE_INVALID_TOKEN);
  }

  if (!isNaN(expiry) && expiry > 0 && Date.now() > new Date(expiry)) {
    throw new Error(ERROR_MESSAGE_EXPIRED_TOKEN);
  }

  return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));
}

/**
 * Express middleware to decode "Bearer tokens" (encoded values)
 * from the request's "Authorization" header.  The decoded value
 * is set on `req.user`.  If `required` and the header is invalid,
 * this throws an error.
 */

function decodeAuth({ required, key } = { required: false }) {
  if (!key) {
    throw new Error('key required');
  }

  return (req, res, next) => {
    const [type, value] = (req.headers['authorization'] || '').split(' ');

    req.user = null;

    if (!type && required) {
      throw new Error(ERROR_MESSAGE_NO_AUTHORIZATION);
    }

    if (type.toLowerCase() !== 'bearer' || value.length === 0) {
      throw new Error(ERROR_MESSAGE_INVALID_HEADER);
    }

    req.user = decode(value, key);

    next();
  };
}

/**
 * Shortcut for `decodeAuth` setting `required` to `true`.
 */

function authRequired(args) {
  return decodeAuth({ ...args, required: true });
}

const ERROR_STATUS_CODES = {
  [ERROR_MESSAGE_NO_AUTHORIZATION]: 401,
  [ERROR_MESSAGE_INVALID_HEADER]: 400,
  [ERROR_MESSAGE_INVALID_TOKEN]: 400,
  [ERROR_MESSAGE_EXPIRED_TOKEN]: 401,
};

module.exports = {
  encode,
  decode,
  decodeAuth,
  authRequired,
  required: authRequired,
  ERROR_STATUS_CODES,
  ERROR_MESSAGE_INVALID_HEADER,
  ERROR_MESSAGE_INVALID_TOKEN,
  ERROR_MESSAGE_EXPIRED_TOKEN,
};
