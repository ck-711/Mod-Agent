const weapon = document.querySelector('#weapon');
const brief = document.querySelector('#brief');
const counter = document.querySelector('#counter');
const generateButton = document.querySelector('#generate');
const notice = document.querySelector('#notice');
const result = document.querySelector('#result');
const dialog = document.querySelector('#beta-dialog');
const accessInput = document.querySelector('#access-code');
const dialogError = document.querySelector('#dialog-error');

const translations = {
  'zh-CN': {
    pageTitle: '战场调校 — DOTS Survivors 模组', brandHome: '战场调校首页', scopeAria: '支持范围', workbenchAria: '模组生成器', previewAria: '模组预览', closedBeta: '封闭测试', windowsBuild: 'Windows 版',
    eyebrow: 'DOTS SURVIVORS · 模组工坊', heroFirst: '调校武器', heroSecond: '改变下一局。',
    introCopy: '描述武器的伤害和攻击间隔，生成器会制作可放入游戏的平衡模组。', scopeShort: '伤害与冷却时间', gameReady: '下载后放入游戏',
    benchLabel: '平衡调校', benchTitle: '设置改动', editorIntro: '选一把武器，用自己的话描述想改什么。', dataOnly: '纯数据模组', weaponLabel: '武器',
    commonWeaponHint: '8 个升级等级 · 可调整伤害和冷却时间', blackHoleHint: '8 个升级等级 · 可调整冷却时间；此武器不使用基础伤害',
    briefLabel: '描述你想要的平衡改动', composerLabel: '你的需求', briefPlaceholder: '例如：只把圆锯第 1 级伤害从 20 提高到 28，冷却从 3 秒缩短到 2.4 秒；其他等级不变。',
    bounds: '伤害：0–10,000 · 冷却：0.1–600 秒', generate: '生成模组', generating: '正在调整数值…',
    tryExample: '试试这样描述', damageExample: '加强前期伤害', cooldownExample: '缩短冷却时间',
    privacyNote: '你的需求会发送给本次测试配置的模型服务。本服务不保存需求历史。',
    outputLabel: '生成结果', outputBadge: '.DSMOD 预览', previewTitle: '改动会显示在这里', previewCopy: '生成后，先核对武器等级和数值，再下载模组包。',
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
    clipboardUnavailable: '无法使用剪贴板，请下载模组文件。'
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
    outputLabel: 'GENERATED MOD', outputBadge: '.DSMOD PREVIEW', previewTitle: 'Your changes appear here', previewCopy: 'After generating, review the weapon levels and values before downloading.',
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
    clipboardUnavailable: 'Clipboard access is unavailable here. Download the mod package instead.'
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
  'fetch failed': '无法连接模型服务，请稍后重试或联系测试管理员。'
};

let locale = 'zh-CN';
try { if (localStorage.getItem('field-tuning-locale') === 'en') locale = 'en'; } catch { /* Private browser storage may be unavailable. */ }
let generatedPackage = null;
let generatedSummary = '';
let noticeState = null;
let dialogErrorKey = null;

function t(key) { return translations[locale][key]; }

function localizeError(message) {
  if (locale === 'en') return message || t('generateFailed');
  if (serverErrors[message]) return serverErrors[message];
  if (/^Model service returned HTTP \d+\.$/.test(message)) return `模型服务返回错误（${message.match(/\d+/)[0]}），请稍后重试。`;
  if (/^Model provider “.*” is not enabled on this beta\.$/.test(message)) return '当前模型服务未启用，请联系测试管理员。';
  return message ? `生成失败：${message}` : t('generateFailed');
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
    renderResult(generatedPackage, generatedSummary);
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
  document.querySelector('#result-summary').textContent = summary || t('summaryFallback');
  const levels = document.querySelector('#result-levels');
  levels.replaceChildren();
  let changeCount = 0;
  for (const weaponData of packageData.weapons) {
    for (const level of weaponData.levels) {
      changeCount++;
      const row = document.createElement('div');
      row.className = 'level-row';
      const label = document.createElement('b');
      label.textContent = `${t('level')} ${level.level}`;
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
  if (!generatedPackage) return;
  const blob = new Blob([`${JSON.stringify(generatedPackage, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${generatedPackage.id}.dsmod`;
  anchor.click();
  URL.revokeObjectURL(url);
});

document.querySelector('#copy').addEventListener('click', async (event) => {
  if (!generatedPackage) return;
  try {
    await navigator.clipboard.writeText(JSON.stringify(generatedPackage, null, 2));
    event.currentTarget.textContent = t('copied');
    setTimeout(() => { event.currentTarget.textContent = t('copyJson'); }, 1600);
  } catch {
    showNotice('clipboardUnavailable');
  }
});

applyLocale(locale);
