// build_bundle.js
const fs = require('fs');
const path = require('path');

const files = [
  'js/supabase.js',
  'js/api.js',
  'js/auth.js',
  'js/utilities.js',
  'js/rooms.js',
  'js/tenants.js',
  'js/requests.js',
  'js/maintenance.js',
  'js/parcels.js',
  'js/announcements.js',
  'js/reports.js',
  'js/settings.js',
  'js/dashboard.js',
  'js/app.js'
];

let bundleContent = '/* Bundled KP Dormitory Application - Standalone & File:// Compatible */\n';
bundleContent += '(function() {\n"use strict";\n\n';

files.forEach(file => {
  const filePath = path.resolve(__dirname, file);
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

  bundleContent += `\n/* ========== ${file} ========== */\n` + code + '\n';
});

bundleContent += '\n})();\n';

fs.writeFileSync(path.resolve(__dirname, 'js/bundle.js'), bundleContent, 'utf8');
console.log('Successfully bundled to js/bundle.js, size:', bundleContent.length);
