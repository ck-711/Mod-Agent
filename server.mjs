import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createPackage, validatePackageText } from './package-contract.mjs';
import { weapons } from './weapon-catalog.mjs';
import { defaultModsDir, installPackageText, verifyPackageText } from './local-mod-workflow.mjs';

try {
  const localEnvironment = await readFile(new URL('./.env', import.meta.url), 'utf8');
  for (const line of localEnvironment.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!match || process.env[match[1]] !== undefined) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
  }
} catch { /* Local environment variables are also supported. */ }

const root = resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const host = process.env.HOST || '127.0.0.1';
const port = Number.parseInt(process.env.PORT || '4173', 10);
const accessCode = process.env.BETA_ACCESS_CODE || '';
const provider = process.env.LLM_PROVIDER || 'openai-compatible';
const baseUrl = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const model = process.env.LLM_MODEL || '';
function readPositiveLimit(name, fallback) {
  const value = Number.parseInt(process.env[name] || String(fallback), 10);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}
const windowLimit = readPositiveLimit('MAX_GENERATIONS_PER_WINDOW', 4);
const dailyLimit = readPositiveLimit('MAX_GENERATIONS_PER_DAY', 20);
const windowMs = 60 * 60 * 1000;
const maxBodyBytes = 8 * 1024;
const rates = new Map();
let dailyCount = 0;
let dailyKey = new Date().toISOString().slice(0, 10);

const send = (response, status, data, headers = {}) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers });
  response.end(JSON.stringify(data));
};

async function readJson(request, limit = maxBodyBytes) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > limit) throw new Error('Request is too large.');
  }
  try { return JSON.parse(body); } catch { throw new Error('Request must be valid JSON.'); }
}

function isLocalRequest(request) {
  if (!['127.0.0.1', 'localhost', '::1'].includes(host.toLowerCase())) return false;
  if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket.remoteAddress)) return false;
  let target;
  try { target = new URL(`http://${request.headers.host}`); } catch { return false; }
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(target.hostname) || target.port !== String(port)) return false;
  return !request.headers.origin || request.headers.origin === target.origin;
}

function localPaths() {
  return {
    modsDir: process.env.GAME_MODS_DIR || defaultModsDir(),
    ...(process.env.GAME_PLAYER_LOG ? { logPath: process.env.GAME_PLAYER_LOG } : {})
  };
}

async function handleLocalAction(request, response, action) {
  if (!isLocalRequest(request)) return send(response, 403, { error: 'Local mod operations require the loopback server.' });
  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    return send(response, 415, { error: 'Content type must be application/json.' });
  }
  let body;
  try { body = await readJson(request, 128 * 1024); }
  catch (error) { return send(response, 400, { error: error.message }); }
  if (typeof body?.packageText !== 'string') return send(response, 400, { error: 'Package text is required.' });
  try {
    const packageData = validatePackageText(body.packageText);
    if (action === 'validate') return send(response, 200, { package: packageData });
    const paths = localPaths();
    if (action === 'install') {
      const installed = await installPackageText(body.packageText, paths);
      return send(response, 200, { ...installed });
    }
    const verified = await verifyPackageText(body.packageText, paths);
    return send(response, 200, { ...verified });
  } catch (error) {
    return send(response, error.message.startsWith('This package is already installed') ? 409 : 400, { error: error.message });
  }
}

function consumeQuota(ip) {
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dailyKey) { dailyKey = today; dailyCount = 0; rates.clear(); }
  const now = Date.now();
  const recent = (rates.get(ip) || []).filter((stamp) => now - stamp < windowMs);
  if (recent.length >= windowLimit) return 'This test account has reached its hourly generation limit.';
  if (dailyCount >= dailyLimit) return 'The beta has reached today’s generation limit. Try again tomorrow.';
  recent.push(now);
  rates.set(ip, recent);
  dailyCount++;
  return null;
}

function slugify(value) {
  const slug = value.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return slug || 'weapon-balance';
}

async function generateWithOpenAICompatibleApi({ weaponType, brief }, { disableThinking = false } = {}) {
  if (!process.env.LLM_API_KEY || !model) throw new Error('The model service is not configured yet. Ask the beta host to set its model key and model name.');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const weapon = weapons[weaponType];
    const levels = weapon.damage.map((damage, index) => ({ level: index + 1, damage, cooldownSeconds: weapon.cooldown[index] }));
    const requestBody = {
      model,
      temperature: 0.25,
      max_tokens: 850,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You create safe, data-only balance mods for DOTS Survivors. Return one JSON object with keys title, summary, and levels. levels is an array of {level, overrideDamage, damage, overrideCooldown, cooldownSeconds}. Include only levels with at least one changed field; omit all unchanged levels. The only supported changes are base damage (integer 0-10000) and weapon cooldown (number 0.1-600 seconds) for the selected weapon ${weaponType} (${weapon.name}). ${weapon.supportsDamage === false ? 'This weapon does not use BaseHitPoints; never set overrideDamage to true.' : 'This weapon uses BaseHitPoints and can have its damage changed.'} Use one-based levels from 1 to ${levels.length}. Original values by level are ${JSON.stringify(levels)}. Set an override flag true only when changing that field; set the other flag false and its unused numeric value to 0. Never include code, assets, URLs, markdown, other weapon types, or other fields. When a request asks for something unsupported, make the closest balance-only interpretation. Keep title under 80 characters and summary under 240 characters.`
        },
        { role: 'user', content: brief }
      ]
    };
    if (disableThinking) requestBody.thinking = { type: 'disabled' };
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: { authorization: `Bearer ${process.env.LLM_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(requestBody)
    });
    if (!response.ok) throw new Error(`Model service returned HTTP ${response.status}.`);
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new Error('Model service returned no generated content.');
    try { return JSON.parse(content); } catch { throw new Error('Model service returned malformed JSON. Try describing a smaller change.'); }
  } finally {
    clearTimeout(timer);
  }
}

const providers = new Map([
  ['openai-compatible', generateWithOpenAICompatibleApi],
  ['deepseek', (args) => generateWithOpenAICompatibleApi(args, { disableThinking: true })]
]);

async function handleGenerate(request, response) {
  let body;
  try { body = await readJson(request); } catch (error) { return send(response, 400, { error: error.message }); }
  if (!accessCode) return send(response, 503, { error: 'The closed beta is not configured yet.' });
  if (typeof body.accessCode !== 'string' || body.accessCode.length > 160 || body.accessCode !== accessCode) {
    return send(response, 401, { error: 'That beta code is not valid.' });
  }
  if (!Object.hasOwn(weapons, body.weaponType)) return send(response, 400, { error: 'Choose a supported weapon.' });
  if (typeof body.brief !== 'string' || body.brief.trim().length < 12 || body.brief.length > 1200) {
    return send(response, 400, { error: 'Describe the change in 12-1200 characters.' });
  }
  const quotaError = consumeQuota(request.socket.remoteAddress || 'unknown');
  if (quotaError) return send(response, 429, { error: quotaError });
  const generate = providers.get(provider);
  if (!generate) return send(response, 503, { error: `Model provider “${provider}” is not enabled on this beta.` });

  try {
    const result = await generate({ weaponType: body.weaponType, brief: body.brief.trim() });
    if (typeof result.title !== 'string' || !result.title.trim() || result.title.length > 80) throw new Error('The model returned an invalid mod title.');
    const packageData = createPackage({
      id: `${slugify(result.title)}-${randomBytes(3).toString('hex')}`,
      title: result.title.trim(),
      weaponType: body.weaponType,
      levels: result.levels
    });
    send(response, 200, { package: packageData, summary: String(result.summary || '').slice(0, 240) });
  } catch (error) {
    const message = error.name === 'AbortError' ? 'The model took too long. Try again with a shorter brief.' : error.message;
    send(response, 502, { error: message });
  }
}

async function serveStatic(request, response) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { return send(response, 400, { error: 'Invalid URL.' }); }
  const path = pathname === '/' ? 'index.html' : pathname.slice(1);
  const file = resolve(root, path);
  if (file !== root && !file.startsWith(`${root}${sep}`)) return send(response, 403, { error: 'Forbidden.' });
  try {
    const fileInfo = await stat(file);
    if (!fileInfo.isFile()) return send(response, 404, { error: 'Not found.' });
    const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml' };
    response.writeHead(200, {
      'content-type': types[extname(file)] || 'application/octet-stream',
      'x-content-type-options': 'nosniff',
      'content-security-policy': "default-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'",
      'referrer-policy': 'no-referrer'
    });
    response.end(await readFile(file));
  } catch {
    send(response, 404, { error: 'Not found.' });
  }
}

createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/mods/generate') return handleGenerate(request, response);
  if (request.method === 'GET' && request.url === '/api/local/status') {
    if (!isLocalRequest(request)) return send(response, 200, { available: false });
    try { return send(response, 200, { available: true, ...localPaths() }); }
    catch { return send(response, 200, { available: false }); }
  }
  if (request.method === 'POST' && request.url === '/api/mods/validate') return handleLocalAction(request, response, 'validate');
  if (request.method === 'POST' && request.url === '/api/mods/install') return handleLocalAction(request, response, 'install');
  if (request.method === 'POST' && request.url === '/api/mods/verify') return handleLocalAction(request, response, 'verify');
  if (request.method !== 'GET' && request.method !== 'HEAD') return send(response, 405, { error: 'Method not allowed.' });
  await serveStatic(request, response);
}).listen(port, host, () => {
  console.log(`DOTS Survivors mod agent listening at http://${host}:${port}`);
  if (!accessCode) console.warn('Set BETA_ACCESS_CODE before enabling mod generation.');
  if (!process.env.LLM_API_KEY || !model) console.warn('Set LLM_API_KEY and LLM_MODEL before enabling mod generation.');
});
