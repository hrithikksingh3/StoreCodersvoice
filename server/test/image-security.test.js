const test = require('node:test');
const assert = require('node:assert/strict');
const { assertImageBuffer, isPrivateAddress } = require('../src/utils/image-security');

test('recognizes allowed raster image signatures', () => {
  assert.doesNotThrow(() => assertImageBuffer(Buffer.from([0xff, 0xd8, 0xff, 0xe0])));
  assert.doesNotThrow(() => assertImageBuffer(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])));
  assert.doesNotThrow(() => assertImageBuffer(Buffer.from('GIF89a', 'ascii')));
  assert.doesNotThrow(() => assertImageBuffer(Buffer.from('RIFFxxxxWEBP', 'ascii')));
});

test('rejects content pretending to be an image', () => {
  assert.throws(() => assertImageBuffer(Buffer.from('<svg onload=alert(1)>', 'utf8')), /not a supported image/);
});

test('identifies local and reserved network addresses', () => {
  for (const address of ['127.0.0.1', '10.0.0.1', '172.16.0.1', '192.168.1.1', '169.254.1.1', '::1', 'fc00::1', 'fe80::1']) {
    assert.equal(isPrivateAddress(address), true, address);
  }
  assert.equal(isPrivateAddress('8.8.8.8'), false);
});
