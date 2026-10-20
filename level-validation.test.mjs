import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLevels } from './level-validation.mjs';

test('omits unchanged levels from a model response', () => {
  const response = [
    { level: 1, overrideDamage: true, damage: 28, overrideCooldown: true, cooldownSeconds: 2.4 },
    ...Array.from({ length: 7 }, (_, index) => ({
      level: index + 2,
      overrideDamage: false,
      damage: 0,
      overrideCooldown: false,
      cooldownSeconds: 0
    }))
  ];
  assert.deepEqual(validateLevels(response, 8, true), [{
    level: 1,
    overrideDamage: true,
    damage: 28,
    overrideCooldown: true,
    cooldownSeconds: 2.4
  }]);
});

test('rejects a response with no changes', () => {
  assert.throws(() => validateLevels([{
    level: 1,
    overrideDamage: false,
    overrideCooldown: false
  }], 8, true), /no supported changes/);
});
