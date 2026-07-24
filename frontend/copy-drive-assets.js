#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const frontendDir = __dirname; // this script lives in frontend/
const repoRoot = path.join(frontendDir, '..');
const srcDir = path.join(repoRoot, 'Wiki', '_assets', 'drive');
const dstDir = path.join(frontendDir, 'public', 'assets');

function copyFiles() {
  if (!fs.existsSync(srcDir)) {
    console.warn(`Source directory not found: ${srcDir}. Nothing to copy.`);
    return;
  }

  fs.mkdirSync(dstDir, { recursive: true });
  const entries = fs.readdirSync(srcDir);
  if (!entries.length) {
    console.log(`No files found in ${srcDir}`);
    return;
  }

  for (const name of entries) {
    const src = path.join(srcDir, name);
    const dst = path.join(dstDir, name);
    const stat = fs.statSync(src);
    if (stat.isFile()) {
      fs.copyFileSync(src, dst);
      console.log(`Copied ${name}`);
    }
  }
}

try {
  copyFiles();
  process.exit(0);
} catch (err) {
  console.error('Error copying drive assets:', err);
  process.exit(1);
}
