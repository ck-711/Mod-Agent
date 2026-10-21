import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { validatePackageText } from './package-contract.mjs';

export function defaultModsDir() {
  if (process.platform !== 'win32' || !process.env.USERPROFILE) {
    throw new Error('Automatic Mods path requires Windows; pass --mods-dir explicitly.');
  }
  return join(process.env.USERPROFILE, 'AppData', 'LocalLow', 'DefaultCompany', 'Survivor', 'Mods');
}

export async function installPackageText(text, { modsDir = defaultModsDir() } = {}) {
  const packageData = validatePackageText(text);
  const directory = resolve(modsDir);
  const destination = join(directory, `${packageData.id}.dsmod`);
  await mkdir(directory, { recursive: true });
  try { await writeFile(destination, text, { flag: 'wx' }); }
  catch (error) {
    if (error.code === 'EEXIST') throw new Error('This package is already installed. Existing file was not changed.');
    throw error;
  }
  return { id: packageData.id, path: destination };
}

export async function verifyPackageText(text, { modsDir = defaultModsDir(), logPath } = {}) {
  const packageData = validatePackageText(text);
  const directory = resolve(modsDir);
  const installedPath = join(directory, `${packageData.id}.dsmod`);
  let installed;
  try { installed = await readFile(installedPath, 'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') throw new Error('Installed package was not found. Install it first.');
    throw error;
  }
  if (installed !== text) throw new Error('Installed package differs from the checked file.');
  const playerLogPath = resolve(logPath || join(directory, '..', 'Player.log'));
  let log, installedInfo, logInfo;
  try {
    [log, installedInfo, logInfo] = await Promise.all([
      readFile(playerLogPath, 'utf8'), stat(installedPath), stat(playerLogPath)
    ]);
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error('Player.log was not found. Start the game, then try again.');
    throw error;
  }
  if (logInfo.mtimeMs < installedInfo.mtimeMs) throw new Error('Player.log predates this installation. Restart the game and try again.');
  const loaded = log.lastIndexOf(`[Player Mods] Loaded '${packageData.title}' (${packageData.id}).`);
  if (loaded < 0) throw new Error('Player.log does not confirm this package was loaded.');
  const applied = /\[Player Mods\] Applied data-only changes to (\d+) weapon prefab\(s\)/.exec(log.slice(loaded));
  if (!applied || Number(applied[1]) < 1) throw new Error('Player.log does not confirm a weapon prefab was patched.');
  return {
    id: packageData.id,
    installedPath,
    logPath: playerLogPath,
    patchedPrefabs: Number(applied[1])
  };
}
