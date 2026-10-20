import test from 'node:test';
import assert from 'node:assert/strict';
import { createPackage, validatePackageText } from './package-contract.mjs';

test('creates a v1 package accepted by the shared validator', () => {
  const packageData = createPackage({
    id: 'saw-level-one',
    title: 'Saw level one',
    weaponType: 'SawBlade',
    levels: [{ level: 1, overrideDamage: true, damage: 28, overrideCooldown: true, cooldownSeconds: 2.4 }]
  });
  assert.equal(packageData.weapons[0].levels[0].damage, 28);
  assert.deepEqual(validatePackageText(JSON.stringify(packageData)), packageData);
});

test('rejects invalid game identity, duplicate levels and Black Hole damage', () => {
  const source = createPackage({
    id: 'saw-level-one', title: 'Saw level one', weaponType: 'SawBlade',
    levels: [{ level: 1, overrideDamage: true, damage: 28 }]
  });
  assert.throws(() => validatePackageText(JSON.stringify({ ...source, gameId: 'other' })), /different game/);
  assert.throws(() => validatePackageText(JSON.stringify({ ...source, executable: 'payload' })), /unsupported field/);
  assert.throws(() => validatePackageText(JSON.stringify({
    ...source, weapons: [{ weaponType: 'SawBlade', levels: [{ ...source.weapons[0].levels[0], overrideDamage: 'true' }] }]
  })), /must be booleans/);
  assert.throws(() => validatePackageText(JSON.stringify({
    ...source, weapons: [{ weaponType: 'SawBlade', levels: [source.weapons[0].levels[0], source.weapons[0].levels[0]] }]
  })), /repeated weapon level/);
  assert.throws(() => createPackage({
    id: 'black-hole-damage', title: 'Invalid', weaponType: 'BlackHole',
    levels: [{ level: 1, overrideDamage: true, damage: 1 }]
  }), /does not support/);
});

test('rejects an oversized package file', () => {
  assert.throws(() => validatePackageText(' '.repeat(65537)), /1–64 KiB/);
});
