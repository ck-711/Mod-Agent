import { Buffer } from 'node:buffer';
import { weapons } from './weapon-catalog.mjs';
import { validateLevels } from './level-validation.mjs';

export const MAX_PACKAGE_BYTES = 64 * 1024;
const ID_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;

function fail(message) {
  throw new Error(message);
}

function exactFields(value, fields, label) {
  for (const key of Object.keys(value)) {
    if (!fields.includes(key)) fail(`${label} contains unsupported field: ${key}.`);
  }
}

export function validatePackage(packageData) {
  if (!packageData || typeof packageData !== 'object' || Array.isArray(packageData)) fail('Package must be a JSON object.');
  exactFields(packageData, ['gameId', 'schemaVersion', 'id', 'title', 'weapons'], 'Package');
  if (packageData.gameId !== 'dots-survivors') fail('Package is for a different game.');
  if (packageData.schemaVersion !== 1) fail('Unsupported package schema version.');
  if (typeof packageData.id !== 'string' || packageData.id.length < 1 || packageData.id.length > 64 || !ID_PATTERN.test(packageData.id)) {
    fail('Package id must use 1–64 lowercase letters, numbers, dots, underscores or hyphens.');
  }
  if (typeof packageData.title !== 'string' || !packageData.title.trim() || packageData.title.length > 80) {
    fail('Package title must use 1–80 characters.');
  }
  if (!Array.isArray(packageData.weapons) || packageData.weapons.length < 1 || packageData.weapons.length > 20) {
    fail('Package must contain 1–20 weapons.');
  }
  const seen = new Set();
  for (const entry of packageData.weapons) {
    if (!entry || typeof entry.weaponType !== 'string' || !Object.hasOwn(weapons, entry.weaponType)) {
      fail(`Unknown weapon type: ${entry?.weaponType ?? '<missing>'}.`);
    }
    exactFields(entry, ['weaponType', 'levels'], 'Weapon');
    const weapon = weapons[entry.weaponType];
    if (!Array.isArray(entry.levels)) fail('Weapon levels must be an array.');
    for (const level of entry.levels) {
      if (!level || typeof level !== 'object' || Array.isArray(level)) fail('Weapon level must be an object.');
      exactFields(level, ['level', 'overrideDamage', 'damage', 'overrideCooldown', 'cooldownSeconds'], 'Weapon level');
      if (typeof level.overrideDamage !== 'boolean' || typeof level.overrideCooldown !== 'boolean') fail('Weapon level override flags must be booleans.');
    }
    const levels = validateLevels(entry.levels, weapon.damage.length, weapon.supportsDamage !== false);
    for (const level of levels) {
      const key = `${entry.weaponType}:${level.level}`;
      if (seen.has(key)) fail(`Repeated weapon level: ${key}.`);
      seen.add(key);
    }
    if (levels.length !== entry.levels.length) fail('Package contains an empty level change.');
  }
  if (Buffer.byteLength(JSON.stringify(packageData), 'utf8') > MAX_PACKAGE_BYTES) fail('Package exceeds 64 KiB.');
  return packageData;
}

export function validatePackageText(text) {
  if (Buffer.byteLength(text, 'utf8') < 1 || Buffer.byteLength(text, 'utf8') > MAX_PACKAGE_BYTES) fail('Package must be 1–64 KiB.');
  let value;
  try { value = JSON.parse(text); } catch { fail('Package is not valid JSON.'); }
  return validatePackage(value);
}

export function createPackage({ id, title, weaponType, levels }) {
  if (!Object.hasOwn(weapons, weaponType)) fail(`Unknown weapon type: ${weaponType}.`);
  const weapon = weapons[weaponType];
  const packageData = {
    gameId: 'dots-survivors',
    schemaVersion: 1,
    id,
    title,
    weapons: [{ weaponType, levels: validateLevels(levels, weapon.damage.length, weapon.supportsDamage !== false) }]
  };
  return validatePackage(packageData);
}
