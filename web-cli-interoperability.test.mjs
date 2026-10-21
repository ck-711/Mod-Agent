import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('.', import.meta.url));
const cli = fileURLToPath(new URL('./bin/mod-agent.mjs', import.meta.url));
const serverFile = fileURLToPath(new URL('./server.mjs', import.meta.url));

async function freePort() {
  const listener = createNetServer();
  await new Promise((resolve) => listener.listen(0, '127.0.0.1', resolve));
  const port = listener.address().port;
  await new Promise((resolve) => listener.close(resolve));
  return port;
}

async function startServer(port, modsDir, logPath, modelUrl) {
  const child = spawn(process.execPath, [serverFile], {
    cwd: root,
    env: {
      ...process.env, HOST: '127.0.0.1', PORT: String(port), GAME_MODS_DIR: modsDir, GAME_PLAYER_LOG: logPath,
      BETA_ACCESS_CODE: 'test-code', LLM_PROVIDER: 'openai-compatible', LLM_BASE_URL: modelUrl,
      LLM_API_KEY: 'test-key', LLM_MODEL: 'test-model'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await new Promise((resolve, reject) => {
    let output = '';
    const timeout = setTimeout(() => reject(new Error(`Server startup timed out: ${output}`)), 5000);
    child.stdout.on('data', (chunk) => {
      output += chunk;
      if (output.includes('mod agent listening')) { clearTimeout(timeout); resolve(); }
    });
    child.once('error', (error) => { clearTimeout(timeout); reject(error); });
    child.once('exit', (code) => { clearTimeout(timeout); reject(new Error(`Server exited with ${code}: ${output}`)); });
  });
  return child;
}

test('CLI files can be validated and installed by web API, then verified by both interfaces', async () => {
  const scratch = await mkdtemp(join(tmpdir(), 'dots-web-cli-'));
  let server;
  const model = createHttpServer((_request, response) => {
    response.writeHead(200, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify({
      title: 'Web Generated Test', summary: 'Level one damage adjusted.',
      levels: [{ level: 1, overrideDamage: true, damage: 29, overrideCooldown: false, cooldownSeconds: 0 }]
    }) } }] }));
  });
  try {
    const packagePath = join(scratch, 'web-cli.dsmod');
    const modsDir = join(scratch, 'Mods');
    const logPath = join(scratch, 'Player.log');
    const created = spawnSync(process.execPath, [cli, 'create', '--weapon', 'SawBlade', '--title', 'Web CLI Test', '--id', 'web-cli-test', '--set', '1:damage=28,cooldown=2.4', '--out', packagePath], { encoding: 'utf8' });
    assert.equal(created.status, 0, created.stderr);
    const packageText = await readFile(packagePath, 'utf8');
    await new Promise((resolve) => model.listen(0, '127.0.0.1', resolve));
    const modelUrl = `http://127.0.0.1:${model.address().port}`;
    const port = await freePort();
    server = await startServer(port, modsDir, logPath, modelUrl);
    const base = `http://127.0.0.1:${port}`;
    const post = async (action, headers = {}) => {
      const response = await fetch(`${base}/api/mods/${action}`, {
        method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify({ packageText })
      });
      return { status: response.status, data: await response.json() };
    };

    const status = await (await fetch(`${base}/api/local/status`)).json();
    assert.equal(status.available, true);
    assert.equal(status.modsDir, modsDir);
    const validated = await post('validate');
    assert.equal(validated.status, 200);
    assert.equal(validated.data.package.id, 'web-cli-test');
    assert.equal((await post('install', { origin: 'https://invalid.example' })).status, 403);
    const installed = await post('install');
    assert.equal(installed.status, 200);
    assert.equal(await readFile(installed.data.path, 'utf8'), packageText);
    assert.equal((await post('install')).status, 409, 'install must not overwrite existing files');
    const beforeGame = await post('verify');
    assert.equal(beforeGame.status, 400);
    await writeFile(logPath, "[Player Mods] Loaded 'Web CLI Test' (web-cli-test). Later filenames override earlier values for the same weapon level.\n[Player Mods] Applied data-only changes to 1 weapon prefab(s). Install packages in: test\n");
    const verified = await post('verify');
    assert.equal(verified.status, 200);
    assert.equal(verified.data.patchedPrefabs, 1);
    const cliVerified = spawnSync(process.execPath, [cli, 'verify', packagePath, '--mods-dir', modsDir, '--log', logPath], { encoding: 'utf8' });
    assert.equal(cliVerified.status, 0, cliVerified.stderr);

    const generatedResponse = await fetch(`${base}/api/mods/generate`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accessCode: 'test-code', weaponType: 'SawBlade', brief: 'Set level one damage to 29 and leave every other value unchanged.' })
    });
    assert.equal(generatedResponse.status, 200);
    const generated = await generatedResponse.json();
    const generatedText = `${JSON.stringify(generated.package, null, 2)}\n`;
    const webFile = join(scratch, `${generated.package.id}.dsmod`);
    await writeFile(webFile, generatedText);
    assert.equal(spawnSync(process.execPath, [cli, 'validate', webFile], { encoding: 'utf8' }).status, 0);
    assert.equal(spawnSync(process.execPath, [cli, 'install', webFile, '--mods-dir', modsDir], { encoding: 'utf8' }).status, 0);
    await writeFile(logPath, `[Player Mods] Loaded 'Web Generated Test' (${generated.package.id}). Later filenames override earlier values for the same weapon level.\n[Player Mods] Applied data-only changes to 1 weapon prefab(s). Install packages in: test\n`);
    const webVerified = await fetch(`${base}/api/mods/verify`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ packageText: generatedText })
    });
    assert.equal(webVerified.status, 200);
  } finally {
    server?.kill();
    await new Promise((resolve) => model.close(resolve));
    await rm(scratch, { recursive: true, force: true });
  }
});
