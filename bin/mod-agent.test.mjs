import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const cli = fileURLToPath(new URL('./mod-agent.mjs', import.meta.url));
function run(args) {
  return spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' });
}

test('CLI creates, validates, installs and checks the Unity log without touching the real game folder', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dots-mod-cli-'));
  try {
    const packagePath = join(root, 'test-saw.dsmod');
    const modsDir = join(root, 'Mods');
    const created = run(['create', '--weapon', 'SawBlade', '--title', 'Test Saw', '--id', 'test-saw', '--set', '1:damage=28,cooldown=2.4', '--out', packagePath]);
    assert.equal(created.status, 0, created.stderr);
    const packageData = JSON.parse(await readFile(packagePath, 'utf8'));
    assert.equal(packageData.schemaVersion, 1);
    assert.equal(packageData.weapons[0].levels[0].damage, 28);
    assert.equal(run(['validate', packagePath]).status, 0);
    assert.equal(run(['install', packagePath, '--mods-dir', modsDir]).status, 0);
    assert.notEqual(run(['install', packagePath, '--mods-dir', modsDir]).status, 0, 'install must not overwrite a package');
    const logPath = join(root, 'Player.log');
    await writeFile(logPath, "[Player Mods] Loaded 'Test Saw' (test-saw). Later filenames override earlier values for the same weapon level.\n[Player Mods] Applied data-only changes to 1 weapon prefab(s). Install packages in: test\n");
    const verified = run(['verify', packagePath, '--mods-dir', modsDir, '--log', logPath]);
    assert.equal(verified.status, 0, verified.stderr);
    assert.match(verified.stdout, /In-game numeric values were not measured/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('CLI rejects unsupported damage changes before writing a file', async () => {
  const root = await mkdtemp(join(tmpdir(), 'dots-mod-invalid-'));
  try {
    const output = join(root, 'invalid.dsmod');
    const result = run(['create', '--weapon', 'BlackHole', '--title', 'Invalid', '--set', '1:damage=2', '--out', output]);
    assert.notEqual(result.status, 0);
    await assert.rejects(readFile(output));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
