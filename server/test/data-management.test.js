const test = require('node:test');
const assert = require('node:assert/strict');
const { _internals } = require('../src/controllers/data-management.controller');

test('retention date parser rejects invalid calendar dates', () => {
  assert.equal(_internals.parseDate('2026-02-30'), null);
  assert.equal(_internals.parseDate('2026-02-28')?.toISOString().slice(0, 10), '2026-02-28');
});

test('retention boundary is in the past', () => {
  assert.ok(_internals.retentionBoundary(7).valueOf() < Date.now());
  assert.equal(_internals.MAX_BATCH_SIZE, 10000);
});
