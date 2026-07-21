const crypto = require('crypto');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);

async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 14) {
    throw new Error('Password must contain at least 14 characters');
  }
  const salt = crypto.randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

async function verifyPassword(password, encoded) {
  const [scheme, saltHex, hashHex] = String(encoded || '').split('$');
  if (scheme !== 'scrypt' || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = await scrypt(password, Buffer.from(saltHex, 'hex'), expected.length);
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

module.exports = { hashPassword, verifyPassword };
