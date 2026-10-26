// build_bundle.js
const fs = require('fs');
const path = require('path');

// Determine root directory regardless of whether this script is run from project root or inside js/
const rootDir = __dirname.endsWith('js') ? path.resolve(__dirname, '..') : __dirname;
const jsDir = path.resolve(rootDir, 'js');

const files = [
  'supabase.js',
  'api.js',
  'auth.js',
  'utilities.js',
  'rooms.js',
  'tenants.js',
  'requests.js',
  'maintenance.js',
  'parcels.js',
  'announcements.js',
  'reports.js',
  'settings.js',
  'dashboard.js',
  'app.js'
];

let bundleContent = '/* Bundled Tanakrit Dormitory Application - Standalone & File:// Compatible */\n';
bundleContent += '(function() {\n"use strict";\n\n';

files.forEach(file => {
  const filePath = path.resolve(jsDir, file);
  if (!fs.existsSync(filePath)) {
    console.warn('Skipping missing file:', filePath);
    return;
  }
  let code = fs.readFileSync(filePath, 'utf8');

  // Strip imports
  code = code.replace(/^\s*import\s+[^;]+;\s*$/gm, '');

  // Strip export keywords
  code = code.replace(/^\s*export\s+const\s+/gm, 'const ');
  code = code.replace(/^\s*export\s+let\s+/gm, 'let ');
  code = code.replace(/^\s*export\s+function\s+/gm, 'function ');
  code = code.replace(/^\s*export\s+async\s+function\s+/gm, 'async function ');
  code = code.replace(/^\s*export\s+class\s+/gm, 'class ');
  code = code.replace(/^\s*export\s*\{[^}]*\};?\s*$/gm, '');
  code = code.replace(/^\s*export\s+default\s+/gm, 'const defaultExport = ');

  bundleContent += `\n/* ========== js/${file} ========== */\n` + code + '\n';
});

bundleContent += '\n})();\n';

const outPath = path.resolve(jsDir, 'bundle.js');
fs.writeFileSync(outPath, bundleContent, 'utf8');
console.log('Successfully bundled to js/bundle.js, size:', bundleContent.length);
