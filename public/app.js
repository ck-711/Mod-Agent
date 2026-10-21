const weapon = document.querySelector('#weapon');
const brief = document.querySelector('#brief');
const counter = document.querySelector('#counter');
const generateButton = document.querySelector('#generate');
const notice = document.querySelector('#notice');
const result = document.querySelector('#result');
const dialog = document.querySelector('#beta-dialog');
const accessInput = document.querySelector('#access-code');
const dialogError = document.querySelector('#dialog-error');
const importButton = document.querySelector('#import-button');
const importFile = document.querySelector('#import-file');
const localSource = document.querySelector('#local-source');
const localStatus = document.querySelector('#local-status');
const localPath = document.querySelector('#local-path');
const localButtons = ['validate-local', 'install-local', 'verify-local'].map((id) => document.getElementById(id));

const translations = {
  'zh-CN': {
    pageTitle: '战场调校 — DOTS Survivors 模组', brandHome: '战场调校首页', scopeAria: '支持范围', workbenchAria: '模组生成器', previewAria: '模组预览', closedBeta: '封闭测试', windowsBuild: 'Windows 版',
    eyebrow: 'DOTS SURVIVORS · 模组工坊', heroFirst: '调校武器', heroSecond: '改变下一局。',
    introCopy: '描述武器的伤害和攻击间隔，生成器会制作可放入游戏的平衡模组。', scopeShort: '伤害与冷却时间', gameReady: '下载或安装到游戏',
    benchLabel: '平衡调校', benchTitle: '设置改动', editorIntro: '选一把武器，用自己的话描述想改什么。', dataOnly: '纯数据模组', weaponLabel: '武器',
    commonWeaponHint: '8 个升级等级 · 可调整伤害和冷却时间', blackHoleHint: '8 个升级等级 · 可调整冷却时间；此武器不使用基础伤害',
    briefLabel: '描述你想要的平衡改动', composerLabel: '你的需求', briefPlaceholder: '例如：只把圆锯第 1 级伤害从 20 提高到 28，冷却从 3 秒缩短到 2.4 秒；其他等级不变。',
    bounds: '伤害：0–10,000 · 冷却：0.1–600 秒', generate: '生成模组', generating: '正在调整数值…',
    tryExample: '试试这样描述', damageExample: '加强前期伤害', cooldownExample: '缩短冷却时间',
    privacyNote: '你的需求会发送给本次测试配置的模型服务。本服务不保存需求历史。',
    outputLabel: '模组预览', outputBadge: '.DSMOD 预览', previewTitle: '改动会显示在这里', previewCopy: '生成或导入后，先核对武器等级和数值。',
    packageReady: '模组已就绪', changedLevels: '改动等级', download: '下载模组', copyJson: '复制模组 JSON', copied: '已复制', installGuide: '如何安装到游戏',
    outputFoot: '仅修改现有武器数值，不包含代码或素材。',
    installLabel: '安装：', installBefore: '在文件资源管理器中按', installMiddle: '，粘贴路径',
    installAfter: '。如文件夹不存在，请先创建；将下载的文件复制进去，然后重启游戏。',
    footerLeft: '战场调校 / 玩家模组生成器', footerRight: '你的战局，你来定规则。',
    close: '关闭', testerAccess: '受邀玩家测试', dialogFirst: '输入你的', dialogSecond: '邀请码。',
    dialogCopy: '工坊目前只面向少量玩家测试。邀请码仅保存在本次浏览器会话中。', inviteCode: '邀请码', continue: '继续',
    briefTooShort: '请至少用 12 个字符描述想要的平衡改动。', invalidCode: '邀请码无效，请重新输入。',
    generateFailed: '模组生成失败，请重试。', generated: '模组已生成。请检查改动等级，然后下载。',
    serverUnavailable: '无法连接本地生成服务。请检查服务是否运行后重试。', enterCode: '请输入测试邀请中的邀请码。',
    summaryFallback: '所选武器的平衡模组。', level: '等级', damage: '伤害', seconds: '秒',
    clipboardUnavailable: '无法使用剪贴板，请下载模组文件。',
    localLabel: '本机联动', localTitle: '校验并安装到游戏', localIntro: '网页生成的模组可直接安装；也可以导入 CLI 创建的 .dsmod 文件。重启游戏后再检查加载日志。',
    importButton: '导入 .dsmod', localSourceLabel: '当前模组：', validateLocal: '校验格式', installLocal: '安装到本机游戏', verifyLocal: '检查游戏加载日志', localPathLabel: '游戏模组目录：',
    localChecking: '正在检查本机服务…', localUnavailable: '本机操作需要从此电脑的本地服务打开网页。', localReady: '选择或生成一个模组后，即可校验、安装和检查日志。',
    localGenerated: '网页生成', localImported: '导入文件', localValidated: '格式校验通过，可供 CLI 和游戏加载器读取。',
    localInstalled: '已安装。重启游戏并开始新一局后，点击“检查游戏加载日志”。', localVerified: '游戏日志确认已加载并修改武器预制体；实际伤害与冷却数值仍需在游戏中检查。',
    localWorking: '正在处理本机模组…', localFailed: '本机操作失败', invalidFile: '请选择 .dsmod 文件。', fileTooLarge: '文件不能超过 64 KiB。', patchedWeapons: '已修改预制体数：'
  },
  en: {
    pageTitle: 'Field Tuning — DOTS Survivors Mods', brandHome: 'Field Tuning home', scopeAria: 'Supported changes', workbenchAria: 'Mod generator', previewAria: 'Mod preview', closedBeta: 'CLOSED BETA', windowsBuild: 'WINDOWS BUILD',
    eyebrow: 'DOTS SURVIVORS · MOD WORKSHOP', heroFirst: 'Retune your', heroSecond: 'next run.',
    introCopy: 'Change how a weapon hits and how often it fires. The agent builds a small balance mod you can drop into the game.',
    scopeShort: 'Damage and cooldown', gameReady: 'Drop into the game', benchLabel: 'BALANCE TUNING', benchTitle: 'Set the change', editorIntro: 'Pick a weapon, then describe the change in your own words.',
    dataOnly: 'DATA-ONLY MOD', weaponLabel: 'WEAPON',
    commonWeaponHint: '8 upgrade levels · damage and cooldown can be tuned', blackHoleHint: '8 upgrade levels · cooldown can be tuned; base damage is not used by this weapon',
    briefLabel: 'DESCRIBE YOUR BALANCE CHANGE', composerLabel: 'YOUR REQUEST', briefPlaceholder: 'For example: Make the Buzz Saw hit harder early, but keep the later levels close to the original. Aim for about 30 damage at level 1 and a 2.5 second cooldown.',
    bounds: 'Damage: 0–10,000 · Cooldown: 0.1–600 seconds', generate: 'Generate mod', generating: 'Tuning values…',
    tryExample: 'TRY AN EXAMPLE', damageExample: 'Boost early damage', cooldownExample: 'Shorten cooldown',
    privacyNote: 'Your request goes to the model provider configured for this beta. This service does not save prompt history.',
    outputLabel: 'MOD PREVIEW', outputBadge: '.DSMOD PREVIEW', previewTitle: 'Your changes appear here', previewCopy: 'After generating or importing, review the weapon levels and values.',
    packageReady: 'PACKAGE READY', changedLevels: 'CHANGED LEVELS', download: 'Download mod', copyJson: 'Copy package JSON', copied: 'Copied', installGuide: 'How to install in game',
    outputFoot: 'Changes existing weapon values only. Contains no code or assets.',
    installLabel: 'Install:', installBefore: 'in File Explorer press', installMiddle: ' and paste',
    installAfter: '. Create the folder if needed, copy the download into it, then restart the game.',
    footerLeft: 'FIELD TUNING / PLAYER MOD AGENT', footerRight: 'YOUR RUN. YOUR RULES.',
    close: 'Close', testerAccess: 'INVITED TESTER ACCESS', dialogFirst: 'Enter your', dialogSecond: 'field code.',
    dialogCopy: 'This workshop is in a small player test. Your invite code stays in this browser session.', inviteCode: 'INVITE CODE', continue: 'Continue',
    briefTooShort: 'Describe the balance change in at least 12 characters.', invalidCode: 'That beta code is not valid.',
    generateFailed: 'The mod could not be generated.', generated: 'Package generated. Check the tuned levels, then download it.',
    serverUnavailable: 'The workshop could not reach its server. Check your connection and try again.', enterCode: 'Enter the invite code from your tester invitation.',
    summaryFallback: 'A balance package for the selected weapon.', level: 'LEVEL', damage: 'DMG', seconds: 'SEC',
    clipboardUnavailable: 'Clipboard access is unavailable here. Download the mod package instead.',
    localLabel: 'LOCAL WORKFLOW', localTitle: 'Validate and install in game', localIntro: 'Install a mod made here, or import a .dsmod created by the CLI. Restart the game before checking its load log.',
    importButton: 'Import .dsmod', localSourceLabel: 'CURRENT MOD:', validateLocal: 'Validate format', installLocal: 'Install in local game', verifyLocal: 'Check game load log', localPathLabel: 'Game Mods folder:',
    localChecking: 'Checking the local service…', localUnavailable: 'Local operations require opening this page from the service on this computer.', localReady: 'Generate or import a mod to validate, install and check its log.',
    localGenerated: 'Generated on web', localImported: 'Imported file', localValidated: 'Format is valid for the CLI and game loader.',
    localInstalled: 'Installed. Restart the game and start a run, then check the load log.', localVerified: 'The game log confirms this package loaded and weapon prefabs were patched. Check actual damage and cooldown in the game.',
    localWorking: 'Processing the local mod…', localFailed: 'Local operation failed', invalidFile: 'Choose a .dsmod file.', fileTooLarge: 'File must be no larger than 64 KiB.', patchedWeapons: 'Patched prefabs:'
  }
};

const weaponNames = {
  BlackHole: ['黑洞', 'Black Hole'], CO2Cloud: ['二氧化碳云', 'CO₂ Cloud'], DroneSwarm: ['无人机群', 'Drone Swarm'],
  Jetpack: ['喷气背包', 'Jetpack'], LaserStrike: ['激光打击', 'Laser Strike'], OxygenHose: ['氧气管', 'Oxygen Hose'],
  PlasmaBlast: ['等离子冲击', 'Plasma Blast'], RadioactiveWaste: ['放射性废料', 'Radioactive Waste'],
  SatelliteToss: ['卫星投掷', 'Satellite Toss'], SawBlade: ['圆锯（Buzz Saw）', 'Buzz Saw'],
  Screwdriver: ['螺丝刀', 'Screwdriver'], Wrench: ['扳手', 'Wrench']
};

const serverErrors = {
  'Request is too large.': '请求内容过长。',
  'Request must be valid JSON.': '请求格式无效。',
  'The closed beta is not configured yet.': '封闭测试尚未配置完成。',
  'That beta code is not valid.': '邀请码无效，请重新输入。',
  'Choose a supported weapon.': '请选择支持的武器。',
  'Describe the change in 12-1200 characters.': '请用 12–1200 个字符描述改动。',
  'This test account has reached its hourly generation limit.': '本小时生成次数已用完，请稍后再试。',
  'The beta has reached today’s generation limit. Try again tomorrow.': '今日生成次数已用完，请明天再试。',
  'The model service is not configured yet. Ask the beta host to set its model key and model name.': '模型服务尚未配置，请联系测试管理员。',
  'Model service returned no generated content.': '模型未返回生成内容，请重试。',
  'Model service returned malformed JSON. Try describing a smaller change.': '模型返回格式无效，请尝试描述更简单的改动。',
  'The model returned an invalid mod title.': '模型生成的模组名称无效，请重试。',
  'The model returned an invalid number of level changes.': '模型生成的等级改动数量无效，请重试。',
  'The model returned an invalid or repeated weapon level.': '模型生成了无效或重复的武器等级，请重试。',
  'This weapon does not support a base damage change.': '这把武器不支持修改基础伤害。',
  'The model returned damage outside the allowed range.': '模型生成的伤害超出允许范围，请重试。',
  'The model returned cooldown outside the allowed range.': '模型生成的冷却时间超出允许范围，请重试。',
  'The model returned no supported changes.': '模型没有生成可用的改动，请换一种描述重试。',
  'The model took too long. Try again with a shorter brief.': '模型响应超时，请缩短需求后重试。',
  'fetch failed': '无法连接模型服务，请稍后重试或联系测试管理员。',
  'Package text is required.': '缺少模组文件内容。',
  'Package must be 1–64 KiB.': '模组文件须为 1–64 KiB。',
  'Package is not valid JSON.': '模组文件不是有效 JSON。',
  'Package must be a JSON object.': '模组文件内容必须是 JSON 对象。',
  'Package is for a different game.': '该模组属于其他游戏。',
  'Unsupported package schema version.': '不支持该模组格式版本。',
  'Package id must use 1–64 lowercase letters, numbers, dots, underscores or hyphens.': '模组 ID 格式无效。',
  'Package title must use 1–80 characters.': '模组标题长度须为 1–80 个字符。',
  'Package must contain 1–20 weapons.': '模组须包含 1–20 把武器。',
  'Package exceeds 64 KiB.': '模组文件超过 64 KiB。',
  'This package is already installed. Existing file was not changed.': '该模组已安装，现有文件未被覆盖。',
  'Installed package was not found. Install it first.': '未找到已安装的模组，请先安装。',
  'Installed package differs from the checked file.': '已安装文件与当前模组不同，请核对文件。',
  'Player.log was not found. Start the game, then try again.': '未找到游戏日志。请启动游戏后再试。',
  'Player.log predates this installation. Restart the game and try again.': '游戏日志早于模组安装时间。请重启游戏并开始新一局后再检查。',
  'Player.log does not confirm this package was loaded.': '游戏日志尚未确认加载此模组。请重启游戏并开始新一局。',
  'Player.log does not confirm a weapon prefab was patched.': '游戏日志没有确认武器预制体被修改。'
};

let locale = 'zh-CN';
try { if (localStorage.getItem('field-tuning-locale') === 'en') locale = 'en'; } catch { /* Private browser storage may be unavailable. */ }
let generatedPackage = null;
let generatedSummary = '';
let packageText = null;
let packageOrigin = null;
let localAvailable = false;
let localBusy = false;
let localState = { key: 'localChecking' };
let noticeState = null;
let dialogErrorKey = null;

function t(key) { return translations[locale][key]; }

function localizeError(message, fallback = 'generateFailed') {
  if (locale === 'en') return message || t(fallback);
  if (serverErrors[message]) return serverErrors[message];
  if (/^Unknown weapon type: /.test(message)) return '模组包含不支持的武器。';
  if (/ contains unsupported field: /.test(message)) return '模组包含不支持的字段。';
  if (/^Model service returned HTTP \d+\.$/.test(message)) return `模型服务返回错误（${message.match(/\d+/)[0]}），请稍后重试。`;
  if (/^Model provider “.*” is not enabled on this beta\.$/.test(message)) return '当前模型服务未启用，请联系测试管理员。';
  return message ? `${t(fallback)}：${message}` : t(fallback);
}

function renderLocalState() {
  localStatus.textContent = localState.error
    ? localizeError(localState.error, 'localFailed')
    : `${t(localState.key)}${localState.details ? ` ${localState.details}` : ''}`;
  localStatus.classList.toggle('success', Boolean(localState.success));
  localStatus.classList.toggle('error', Boolean(localState.error));
  localSource.textContent = generatedPackage
    ? `${t(packageOrigin === 'imported' ? 'localImported' : 'localGenerated')} · ${generatedPackage.id}`
    : '—';
}

function showLocalState(key, { success = false, details = '', error = null } = {}) {
  localState = { key, success, details, error };
  renderLocalState();
}

function updateLocalButtons() {
  importButton.disabled = !localAvailable || localBusy;
  for (const button of localButtons) button.disabled = !localAvailable || !packageText || localBusy;
}

async function localRequest(action, text) {
  const response = await fetch(`/api/mods/${action}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ packageText: text })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || t('localFailed'));
  return data;
}

function updateWeaponHint() {
  document.querySelector('#weapon-hint').textContent = t(weapon.value === 'BlackHole' ? 'blackHoleHint' : 'commonWeaponHint');
  document.querySelector('#selected-weapon').textContent = weapon.selectedOptions[0].textContent;
  document.querySelector('[data-example="damage"]').hidden = weapon.value === 'BlackHole';
}

function renderNotice() {
  if (!noticeState) return;
  notice.textContent = noticeState.serverError ? localizeError(noticeState.serverError) : t(noticeState.key);
  notice.classList.toggle('success', noticeState.success);
  notice.hidden = false;
}

function showNotice(key, success = false, serverError = null) {
  noticeState = { key, success, serverError };
  renderNotice();
}

function applyLocale(nextLocale) {
  locale = nextLocale;
  document.documentElement.lang = locale;
  document.title = t('pageTitle');
  for (const element of document.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
  for (const element of document.querySelectorAll('[data-i18n-aria-label]')) element.setAttribute('aria-label', t(element.dataset.i18nAriaLabel));
  brief.placeholder = t('briefPlaceholder');
  for (const option of weapon.options) option.textContent = weaponNames[option.value][locale === 'zh-CN' ? 0 : 1];
  for (const button of document.querySelectorAll('[data-lang]')) button.setAttribute('aria-pressed', String(button.dataset.lang === locale));
  generateButton.querySelector('span:first-child').textContent = t(generateButton.disabled ? 'generating' : 'generate');
  updateWeaponHint();
  renderNotice();
  if (dialogErrorKey) dialogError.textContent = t(dialogErrorKey);
  renderLocalState();
  if (generatedPackage) renderResult(generatedPackage, generatedSummary);
  try { localStorage.setItem('field-tuning-locale', locale); } catch { /* Language choice still applies to this page. */ }
}

for (const button of document.querySelectorAll('[data-lang]')) button.addEventListener('click', () => applyLocale(button.dataset.lang));
weapon.addEventListener('change', updateWeaponHint);
brief.addEventListener('input', () => { counter.textContent = `${brief.value.length} / 1200`; });
brief.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter' && !event.isComposing) {
    event.preventDefault();
    generateButton.click();
  }
});

for (const example of document.querySelectorAll('[data-example]')) {
  example.addEventListener('click', () => {
    brief.value = locale === 'zh-CN'
      ? example.dataset.example === 'damage'
        ? '将第 1 级基础伤害提高约 25%，其他等级保持原样。'
        : '将第 1 级冷却时间缩短约 20%，其他等级保持原样。'
      : example.dataset.example === 'damage'
        ? 'Increase level 1 base damage by about 25%. Keep every other level unchanged.'
        : 'Reduce level 1 cooldown by about 20%. Keep every other level unchanged.';
    brief.dispatchEvent(new Event('input'));
    brief.focus();
  });
}

function openAccessDialog() {
  if (!dialog.open) dialog.showModal();
  accessInput.focus();
}

generateButton.addEventListener('click', async () => {
  const text = brief.value.trim();
  if (text.length < 12) {
    showNotice('briefTooShort');
    brief.focus();
    return;
  }
  const accessCode = sessionStorage.getItem('field-tuning-access-code');
  if (!accessCode) { openAccessDialog(); return; }

  generateButton.disabled = true;
  generateButton.querySelector('span:first-child').textContent = t('generating');
  notice.hidden = true;
  noticeState = null;
  try {
    const response = await fetch('/api/mods/generate', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ accessCode, weaponType: weapon.value, brief: text })
    });
    const data = await response.json();
    if (!response.ok) {
      if (response.status === 401) {
        sessionStorage.removeItem('field-tuning-access-code');
        showNotice('invalidCode', false, data.error);
        openAccessDialog();
      } else showNotice('generateFailed', false, data.error);
      return;
    }
    generatedPackage = data.package;
    generatedSummary = data.summary;
    packageText = `${JSON.stringify(generatedPackage, null, 2)}\n`;
    packageOrigin = 'generated';
    renderResult(generatedPackage, generatedSummary);
    updateLocalButtons();
    showLocalState('localReady');
    showNotice('generated', true);
  } catch {
    showNotice('serverUnavailable');
  } finally {
    generateButton.disabled = false;
    generateButton.querySelector('span:first-child').textContent = t('generate');
  }
});

document.querySelector('#save-code').addEventListener('click', () => {
  const code = accessInput.value.trim();
  if (!code) {
    dialogErrorKey = 'enterCode';
    dialogError.textContent = t(dialogErrorKey);
    dialogError.hidden = false;
    return;
  }
  sessionStorage.setItem('field-tuning-access-code', code);
  dialogErrorKey = null;
  dialogError.hidden = true;
  dialog.close();
  generateButton.click();
});

accessInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') { event.preventDefault(); document.querySelector('#save-code').click(); }
});

function renderResult(packageData, summary) {
  document.querySelector('#result-empty').hidden = true;
  document.querySelector('#result-title').textContent = packageData.title;
  document.querySelector('#result-summary').textContent = packageOrigin === 'imported'
    ? t('localImported')
    : summary || t('summaryFallback');
  const levels = document.querySelector('#result-levels');
  levels.replaceChildren();
  let changeCount = 0;
  for (const weaponData of packageData.weapons) {
    for (const level of weaponData.levels) {
      changeCount++;
      const row = document.createElement('div');
      row.className = 'level-row';
      const label = document.createElement('b');
      const name = weaponNames[weaponData.weaponType]?.[locale === 'zh-CN' ? 0 : 1] || weaponData.weaponType;
      label.textContent = packageData.weapons.length > 1 ? `${name} · ${t('level')} ${level.level}` : `${t('level')} ${level.level}`;
      const values = [];
      if (level.overrideDamage) values.push(`${level.damage} ${t('damage')}`);
      if (level.overrideCooldown) values.push(`${level.cooldownSeconds} ${t('seconds')}`);
      const changes = document.createElement('span');
      changes.textContent = values.join('  /  ');
      row.append(label, changes);
      levels.append(row);
    }
  }
  document.querySelector('#result-count').textContent = String(changeCount).padStart(2, '0');
  result.hidden = false;
}

document.querySelector('#download').addEventListener('click', () => {
  if (!generatedPackage || !packageText) return;
  const blob = new Blob([packageText], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${generatedPackage.id}.dsmod`;
  anchor.click();
  URL.revokeObjectURL(url);
});

document.querySelector('#copy').addEventListener('click', async (event) => {
  if (!generatedPackage || !packageText) return;
  try {
    await navigator.clipboard.writeText(packageText);
    event.currentTarget.textContent = t('copied');
    setTimeout(() => { event.currentTarget.textContent = t('copyJson'); }, 1600);
  } catch {
    showNotice('clipboardUnavailable');
  }
});

importButton.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files?.[0];
  importFile.value = '';
  if (!file) return;
  if (!file.name.toLowerCase().endsWith('.dsmod')) return showLocalState('localFailed', { error: t('invalidFile') });
  if (file.size < 1 || file.size > 64 * 1024) return showLocalState('localFailed', { error: t('fileTooLarge') });
  localBusy = true;
  updateLocalButtons();
  showLocalState('localWorking');
  try {
    const text = await file.text();
    const data = await localRequest('validate', text);
    generatedPackage = data.package;
    generatedSummary = '';
    packageText = text;
    packageOrigin = 'imported';
    renderResult(generatedPackage, generatedSummary);
    showLocalState('localValidated', { success: true, details: file.name });
  } catch (error) {
    showLocalState('localFailed', { error: error.message || t('serverUnavailable') });
  } finally {
    localBusy = false;
    updateLocalButtons();
  }
});

for (const [button, action] of localButtons.map((item, index) => [item, ['validate', 'install', 'verify'][index]])) {
  button.addEventListener('click', async () => {
    if (!packageText) return;
    localBusy = true;
    updateLocalButtons();
    showLocalState('localWorking');
    try {
      const data = await localRequest(action, packageText);
      if (action === 'validate') showLocalState('localValidated', { success: true });
      else if (action === 'install') showLocalState('localInstalled', { success: true, details: data.path });
      else showLocalState('localVerified', { success: true, details: `${t('patchedWeapons')}${data.patchedPrefabs} · ${data.logPath}` });
    } catch (error) {
      showLocalState('localFailed', { error: error.message || t('serverUnavailable') });
    } finally {
      localBusy = false;
      updateLocalButtons();
    }
  });
}

async function checkLocalService() {
  try {
    const response = await fetch('/api/local/status');
    const data = await response.json();
    localAvailable = response.ok && data.available === true;
    if (localAvailable) localPath.textContent = data.modsDir;
    showLocalState(localAvailable ? 'localReady' : 'localUnavailable');
  } catch {
    showLocalState('localUnavailable');
  }
  updateLocalButtons();
}

applyLocale(locale);
checkLocalService();
