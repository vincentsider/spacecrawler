#!/usr/bin/env node

// Workaround for tsx issues with spaces in paths
const { spawn } = require('child_process');
const path = require('path');

const command = process.argv[2] || 'all';
const indexPath = path.join(__dirname, 'src', 'index.ts');

console.log(`Running crawler command: ${command}`);

const child = spawn('npx', ['tsx', indexPath, command], {
  stdio: 'inherit',
  cwd: __dirname,
  env: { ...process.env },
  shell: true
});

child.on('exit', (code) => {
  process.exit(code);
});