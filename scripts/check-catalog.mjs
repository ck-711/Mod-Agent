#!/usr/bin/env node
import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { weapons } from '../weapon-catalog.mjs';

const unityRoot = process.argv[2];
if (!unityRoot) {
  console.error('Usage: node scripts/check-catalog.mjs <Unity project root>');
  process.exitCode = 2;
} else {
  try {
    const root = resolve(unityRoot);
    const enumSource = await readFile(join(root, 'Assets/DOTSSurvivors/Scripts/PlayerAttacks/WeaponType.cs'), 'utf8');
    const byNumber = new Map([...enumSource.matchAll(/^\s*([A-Za-z][A-Za-z0-9]*)\s*=\s*(\d+),/gm)]
      .map((match) => [Number(match[2]), match[1]]));
    const directory = join(root, 'Assets/Resources/ScriptableObjects/UpgradeProperties/WeaponUpgradeProperties');
    const found = new Set();
    for (const file of (await readdir(directory)).filter((name) => name.endsWith('.asset'))) {
      const source = await readFile(join(directory, file), 'utf8');
      const weaponNumber = Number(/^  WeaponType: (\d+)$/m.exec(source)?.[1]);
      const type = byNumber.get(weaponNumber);
      if (!type || !Object.hasOwn(weapons, type) || found.has(type)) throw new Error(`Unexpected or repeated weapon in ${file}.`);
      found.add(type);
      const levels = source.split(/^    WeaponLevelData:\s*$/m).slice(1).map((section) => {
        const damage = /^      BaseHitPoints: ([\d.-]+)$/m.exec(section)?.[1];
        const cooldown = /^      Cooldown: ([\d.-]+)$/m.exec(section)?.[1];
        if (damage === undefined || cooldown === undefined) throw new Error(`Missing level value in ${file}.`);
        return { damage: Number(damage), cooldown: Number(cooldown) };
      });
      const expected = weapons[type];
      if (levels.length !== expected.damage.length || levels.length !== expected.cooldown.length) throw new Error(`${type}: level count differs from Unity asset.`);
      for (let index = 0; index < levels.length; index++) {
        if (levels[index].damage !== expected.damage[index] || levels[index].cooldown !== expected.cooldown[index]) {
          throw new Error(`${type} level ${index + 1}: catalog differs from Unity asset.`);
        }
      }
    }
    if (found.size !== Object.keys(weapons).length) throw new Error(`Found ${found.size} Unity weapons; catalog has ${Object.keys(weapons).length}.`);
    console.log(`Catalog matches ${found.size} Unity weapon upgrade assets.`);
  } catch (error) {
    console.error(`Catalog check failed: ${error.message}`);
    process.exitCode = 1;
  }
}
