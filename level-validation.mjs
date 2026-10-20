export function validateLevels(value, maxLevel, supportsDamage) {
  if (!Array.isArray(value) || value.length < 1 || value.length > maxLevel) throw new Error('The model returned an invalid number of level changes.');
  const seen = new Set();
  const changes = [];
  for (const entry of value) {
    if (!entry || !Number.isInteger(entry.level) || entry.level < 1 || entry.level > maxLevel || seen.has(entry.level)) {
      throw new Error('The model returned an invalid or repeated weapon level.');
    }
    seen.add(entry.level);
    const overrideDamage = entry.overrideDamage === true;
    const overrideCooldown = entry.overrideCooldown === true;
    if (!overrideDamage && !overrideCooldown) continue;
    if (overrideDamage && !supportsDamage) throw new Error('This weapon does not support a base damage change.');
    if (overrideDamage && (!Number.isInteger(entry.damage) || entry.damage < 0 || entry.damage > 10000)) {
      throw new Error('The model returned damage outside the allowed range.');
    }
    if (overrideCooldown && (!Number.isFinite(entry.cooldownSeconds) || entry.cooldownSeconds < 0.1 || entry.cooldownSeconds > 600)) {
      throw new Error('The model returned cooldown outside the allowed range.');
    }
    changes.push({
      level: entry.level,
      overrideDamage,
      damage: overrideDamage ? entry.damage : 0,
      overrideCooldown,
      cooldownSeconds: overrideCooldown ? entry.cooldownSeconds : 0
    });
  }
  if (changes.length === 0) throw new Error('The model returned no supported changes.');
  return changes.sort((a, b) => a.level - b.level);
}
