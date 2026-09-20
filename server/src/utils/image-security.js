const dns = require('node:dns').promises;
const net = require('node:net');

const reject = (message) => {
  const error = new Error(message);
  error.status = 400;
  throw error;
};

const isPrivateIpv4 = (address) => {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [first, second] = parts;
  return first === 0 || first === 10 || first === 127 || first >= 224
    || (first === 100 && second >= 64 && second <= 127)
    || (first === 169 && second === 254)
    || (first === 172 && second >= 16 && second <= 31)
    || (first === 192 && second === 168);
};

const isPrivateAddress = (address) => {
  const family = net.isIP(address);
  if (family === 4) return isPrivateIpv4(address);
  if (family !== 6) return true;
  const normalized = address.toLowerCase();
  if (normalized === '::' || normalized === '::1' || normalized.startsWith('fe80:') || normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  return mappedIpv4 ? isPrivateIpv4(mappedIpv4[1]) : false;
};

const allowedImage = (buffer) => Buffer.isBuffer(buffer) && (
  (buffer.length >= 3 && buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])))
  || (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
  || (buffer.length >= 6 && ['GIF87a', 'GIF89a'].includes(buffer.subarray(0, 6).toString('ascii')))
  || (buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP')
  || (buffer.length >= 16 && buffer.subarray(4, 8).toString('ascii') === 'ftyp' && /avi[fs]/.test(buffer.subarray(8, 16).toString('ascii')))
);

const assertImageBuffer = (buffer) => {
  if (!allowedImage(buffer)) reject('The uploaded file is not a supported image. Use JPEG, PNG, WebP, GIF, or AVIF.');
};

const assertSafeRemoteImageUrl = async (value) => {
  let url;
  try {
    url = new URL(String(value || '').trim());
  } catch (_) {
    reject('Provide a valid HTTPS image URL.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) {
    reject('Remote image URLs must use HTTPS without credentials or a custom port.');
  }
  const hostname = url.hostname.toLowerCase();
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    reject('Remote image URLs cannot target a local network host.');
  }
  if (net.isIP(hostname)) {
    if (isPrivateAddress(hostname)) reject('Remote image URLs cannot target a private network address.');
    return url.toString();
  }
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  } catch (_) {
    reject('The remote image host could not be resolved.');
  }
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    reject('Remote image URLs cannot target a private network address.');
  }
  return url.toString();
};

module.exports = { assertImageBuffer, assertSafeRemoteImageUrl, isPrivateAddress };
