import { readFileSync } from 'node:fs';

const tag = process.argv[2];
if (!tag) {
  console.error('Usage: node scripts/verify-version.mjs <tag>');
  process.exit(2);
}

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
const expected = `v${pkg.version}`;

if (tag !== expected) {
  console.error(`FAIL: tag "${tag}" does not match package.json version "${expected}"`);
  console.error('       Use `pnpm version <new>` instead of manual tagging.');
  process.exit(1);
}

console.log(`PASS: tag matches package.json (${tag})`);
