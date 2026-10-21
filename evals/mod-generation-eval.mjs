// Score captured generator responses against human-reviewed weapon/level targets.
// This script makes no model calls and does not install packages into the game.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { validatePackageText } from '../package-contract.mjs';

function changedFields(packageData) {
  const fields = [];
  for (const weapon of packageData.weapons) {
    for (const level of weapon.levels) {
      if (level.overrideDamage) fields.push([weapon.weaponType, level.level, 'damage', level.damage]);
      if (level.overrideCooldown) fields.push([weapon.weaponType, level.level, 'cooldownSeconds', level.cooldownSeconds]);
    }
  }
  return fields.sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
}

function scoreCase(caseData) {
  const result = { id: caseData.id, format_valid: false, exact_match: false, error: null };
  try {
    const predicted = validatePackageText(JSON.stringify(caseData.prediction));
    result.format_valid = true;
    result.expected_fields = changedFields(caseData.expected);
    result.predicted_fields = changedFields(predicted);
    result.exact_match = JSON.stringify(result.expected_fields) === JSON.stringify(result.predicted_fields);
  } catch (error) {
    result.error = error.message;
  }
  return result;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 4 || args[0] !== '--input' || args[2] !== '--output') {
    throw new Error('Usage: node evals/mod-generation-eval.mjs --input cases.jsonl --output report.json');
  }
  const input = resolve(args[1]);
  const output = resolve(args[3]);
  const source = await readFile(input, 'utf8');
  const cases = source.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
  if (!cases.length) throw new Error('Evaluation input is empty.');
  const ids = new Set();
  for (const entry of cases) {
    if (typeof entry.id !== 'string' || !entry.id.trim() || ids.has(entry.id)) {
      throw new Error('Each case needs a unique, nonempty id.');
    }
    ids.add(entry.id);
    if (!entry.expected || !Array.isArray(entry.expected.weapons)) {
      throw new Error(`${entry.id}: expected must contain human-reviewed weapons and levels.`);
    }
    try {
      validatePackageText(JSON.stringify(entry.expected));
    } catch (error) {
      throw new Error(`${entry.id}: invalid expected package: ${error.message}`);
    }
  }
  const rows = cases.map(scoreCase);
  const report = {
    dataset_sha256: createHash('sha256').update(source).digest('hex'),
    cases: rows.length,
    metrics: {
      format_valid_rate: rows.filter(row => row.format_valid).length / rows.length,
      exact_field_match_rate: rows.filter(row => row.exact_match).length / rows.length
    },
    rows
  };
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(report.metrics, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
