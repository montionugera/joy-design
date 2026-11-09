#!/usr/bin/env node
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { fork } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = path.resolve(__dirname, '../packages/brand/scripts/build-manifest.mjs');

const child = fork(script, process.argv.slice(2));
child.on('exit', (code) => {
  process.exit(code ?? 0);
});
