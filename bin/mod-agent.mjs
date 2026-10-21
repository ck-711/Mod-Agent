#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { resolve, extname } from 'node:path';
import { weapons } from '../weapon-catalog.mjs';
import { createPackage, validatePackageText } from '../package-contract.mjs';
import { installPackageText, verifyPackageText } from '../local-mod-workflow.mjs';

const usage = `DOTS Survivors local mod agent

Commands:
  catalog [--json]
  create --weapon TYPE --title TITLE --set LEVEL:damage=N[,cooldown=N] [--set ...] [--id ID] [--out FILE] [--json]
  validate FILE [--json]
  install FILE [--mods-dir DIR] [--json]
  verify FILE [--mods-dir DIR] [--log FILE] [--json]

Examples:
  node bin/mod-agent.mjs catalog --json
  node bin/mod-agent.mjs create --weapon SawBlade --title "Faster Buzz Saw" --set 1:damage=28,cooldown=2.4
  node bin/mod-agent.mjs validate faster-buzz-saw.dsmod
  node bin/mod-agent.mjs install faster-buzz-saw.dsmod
  node bin/mod-agent.mjs verify faster-buzz-saw.dsmod

Install never overwrites an existing file. Verify checks the installed file and Player.log;
it does not measure weapon values in the running game.`;

function parseFlags(args, allowed, positionalCount = 0) {
  const options = { set: [] };
  const positionals = [];
  for (let index = 0; index < args.length; index++) {
    const token = args[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    if (!allowed.includes(key)) throw new Error(`Unknown option: ${token}`);
    if (key === 'json') { options.json = true; continue; }
    const value = args[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${token}.`);
    if (key === 'set') options.set.push(value);
    else {
      if (options[key] !== undefined) throw new Error(`Repeated option: ${token}`);
      options[key] = value;
    }
  }
  if (positionals.length !== positionalCount) throw new Error(`Expected ${positionalCount} file argument(s).`);
  return { options, positionals };
}

function parseLevelChange(value) {
  const match = /^(\d+):(.+)$/.exec(value);
  if (!match) throw new Error(`Invalid --set value: ${value}`);
  const entry = { level: Number(match[1]), overrideDamage: false, damage: 0, overrideCooldown: false, cooldownSeconds: 0 };
  const keys = new Set();
  for (const assignment of match[2].split(',')) {
    const pair = /^(damage|cooldown)=([0-9]+(?:\.[0-9]+)?)$/.exec(assignment);
    if (!pair || keys.has(pair[1])) throw new Error(`Invalid --set assignment: ${assignment}`);
    keys.add(pair[1]);
    if (pair[1] === 'damage') { entry.overrideDamage = true; entry.damage = Number(pair[2]); }
    else { entry.overrideCooldown = true; entry.cooldownSeconds = Number(pair[2]); }
  }
  return entry;
}

function output(data, json) {
  if (json) console.log(JSON.stringify(data, null, 2));
  else console.log(data.message);
}

async function readPackage(path) {
  if (extname(path).toLowerCase() !== '.dsmod') throw new Error('Package file must end in .dsmod.');
  const text = await readFile(path, 'utf8');
  return { packageData: validatePackageText(text), text };
}

async function catalog(args) {
  const { options } = parseFlags(args, ['json']);
  if (options.json) return output(weapons, true);
  for (const [type, data] of Object.entries(weapons)) {
    console.log(`${type} (${data.name}): ${data.damage.length} levels; damage ${data.supportsDamage === false ? 'unsupported' : data.damage.join('/')}; cooldown ${data.cooldown.join('/')} s`);
  }
}

async function create(args) {
  const { options } = parseFlags(args, ['weapon', 'title', 'set', 'id', 'out', 'json']);
  if (!options.weapon || !options.title || options.set.length === 0) throw new Error('Create requires --weapon, --title and at least one --set.');
  const slug = options.title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'weapon-balance';
  const id = options.id || `${slug}-${randomBytes(3).toString('hex')}`;
  const packageData = createPackage({ id, title: options.title, weaponType: options.weapon, levels: options.set.map(parseLevelChange) });
  const path = resolve(options.out || `${id}.dsmod`);
  if (extname(path).toLowerCase() !== '.dsmod') throw new Error('Output file must end in .dsmod.');
  const text = `${JSON.stringify(packageData, null, 2)}\n`;
  validatePackageText(text);
  await writeFile(path, text, { flag: 'wx' });
  output({ message: `Created and validated ${path}. Game runtime not verified.`, path, package: packageData }, options.json);
}

async function validate(args) {
  const { options, positionals } = parseFlags(args, ['json'], 1);
  const path = resolve(positionals[0]);
  const { packageData } = await readPackage(path);
  output({ message: `Valid v1 package: ${packageData.id}. Game runtime not verified.`, path, id: packageData.id, weapons: packageData.weapons.length }, options.json);
}

async function install(args) {
  const { options, positionals } = parseFlags(args, ['mods-dir', 'json'], 1);
  const { text } = await readPackage(resolve(positionals[0]));
  const installed = await installPackageText(text, options['mods-dir'] ? { modsDir: options['mods-dir'] } : {});
  output({ message: `Installed ${installed.path}. Restart the game, then run verify.`, ...installed }, options.json);
}

async function verify(args) {
  const { options, positionals } = parseFlags(args, ['mods-dir', 'log', 'json'], 1);
  const { text } = await readPackage(resolve(positionals[0]));
  const paths = {};
  if (options['mods-dir']) paths.modsDir = options['mods-dir'];
  if (options.log) paths.logPath = options.log;
  const verified = await verifyPackageText(text, paths);
  output({ message: `Player.log confirms ${verified.id} loaded and ${verified.patchedPrefabs} prefab(s) patched. In-game numeric values were not measured.`, ...verified }, options.json);
}

const [command, ...args] = process.argv.slice(2);
if (!command || command === '--help' || command === 'help') console.log(usage);
else {
  const commands = { catalog, create, validate, install, verify };
  if (!Object.hasOwn(commands, command)) { console.error(`Unknown command: ${command}\n${usage}`); process.exitCode = 2; }
  else {
    try { await commands[command](args); }
    catch (error) { console.error(`mod-agent: ${error.message}`); process.exitCode = 1; }
  }
}
