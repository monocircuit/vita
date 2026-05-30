// /home/bnau/workspace/vita/scripts/verify-build.mjs
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { platform } from 'node:os';

const ROOT = process.cwd();
const RELEASE = join(ROOT, 'release');

const errors = [];

function assertExists(relPath) {
  const full = join(RELEASE, relPath);
  if (!existsSync(full)) {
    errors.push(`Missing: ${relPath}`);
    return false;
  }
  return true;
}

function assertSizeBetween(relPath, minMB, maxMB) {
  const full = join(RELEASE, relPath);
  if (!existsSync(full)) return;
  const sizeMB = statSync(full).size / (1024 * 1024);
  if (sizeMB < minMB || sizeMB > maxMB) {
    errors.push(`${relPath} size ${sizeMB.toFixed(1)} MB outside [${minMB}, ${maxMB}]`);
  }
}

if (!existsSync(RELEASE)) {
  console.error(`FAIL: release/ directory missing at ${RELEASE}`);
  process.exit(1);
}

const plat = platform();

if (plat === 'linux') {
  // electron-builder uses package.json `name` (lowercase) for the Linux executable,
  // not productName like on macOS/Windows.
  assertExists('linux-unpacked/vita');
  assertExists('linux-unpacked/resources/app.asar');
  assertSizeBetween('linux-unpacked/resources/app.asar', 50, 300);
}

if (plat === 'darwin') {
  assertExists('mac-arm64/Vita.app/Contents/MacOS/Vita');
  assertExists('mac-arm64/Vita.app/Contents/Resources/app.asar');
  assertSizeBetween('mac-arm64/Vita.app/Contents/Resources/app.asar', 50, 300);
}

if (plat === 'win32') {
  assertExists('win-unpacked/Vita.exe');
  assertExists('win-unpacked/resources/app.asar');
  assertSizeBetween('win-unpacked/resources/app.asar', 50, 300);
}

if (errors.length > 0) {
  console.error('Build verification FAILED:');
  for (const e of errors) console.error('  - ' + e);
  process.exit(1);
}

console.log(`Build verification PASSED on ${plat}`);
