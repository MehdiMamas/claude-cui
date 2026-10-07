#!/usr/bin/env node
const { spawn } = require('node:child_process');
const path = require('node:path');
if (process.argv.includes('--help')) {
  console.log('claude-cui: launch the Claude prompt-button companion. Requires a graphical desktop.');
  process.exit(0);
}
if (process.argv.includes('--version')) {
  console.log(require('../package.json').version);
  process.exit(0);
}
const child = spawn(require('electron'), [path.join(__dirname, '..')], { stdio: 'inherit' });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
