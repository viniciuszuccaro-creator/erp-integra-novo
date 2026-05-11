#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const BLOCKED_EXTS = ['.md.jsx', '.md.js', '.json.jsx', '.json.js', '.config.jsx', '.config.js'];
let foundBadFiles = [];

const validate = (dir) => {
  try {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
      const fullPath = path.join(dir, entry.name);
      const relative = path.relative(process.cwd(), fullPath);
      if (entry.isDirectory() && !['node_modules', '.git', 'dist'].includes(entry.name)) {
        validate(fullPath);
      } else if (entry.isFile() && BLOCKED_EXTS.some(ext => fullPath.endsWith(ext))) {
        foundBadFiles.push(relative);
      }
    });
  } catch (e) {}
};

console.log('🔍 Validating build...');
validate(path.resolve(__dirname, '../src'));

if (foundBadFiles.length > 0) {
  console.error('❌ BUILD FAILED: Artefatos detectados:\n');
  foundBadFiles.forEach(f => console.error(`   ${f}`));
  process.exit(1);
} else {
  console.log('✅ Build validation passed');
}