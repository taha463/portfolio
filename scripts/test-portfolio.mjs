import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

console.log('--- Running Quality & Health Test Suite for Portfolio Site ---');

// Test 1: HTML Structural Integrity
const htmlPath = path.resolve('portfolio-site/index.html');
if (!fs.existsSync(htmlPath)) {
  console.error('FAIL: index.html is missing');
  process.exit(1);
}
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const criticalChecks = [
  { name: 'Viewport Meta Tag', regex: /<meta\s+name=["']viewport["']/i },
  { name: 'Character Set UTF-8', regex: /<meta\s+charset=["']utf-8["']/i },
  { name: 'Meta Description', regex: /<meta\s+name=["']description["']/i },
  { name: 'Page Title', regex: /<title>[^<]+<\/title>/i },
  { name: 'Stylesheet Link', regex: /<link\s+rel=["']stylesheet["']\s+href=["']style\.css["']/i },
  { name: 'Main Script Link', regex: /<script\s+[^>]*src=["']main\.js["'][^>]*>/i },
  { name: 'Skip Link for Accessibility', regex: /<a\s+class=["']skip["']\s+href=["']#main["']/i },
  { name: 'Main Content Landmark', regex: /<main\s+id=["']main["']/i },
];

let failedChecks = 0;
for (const check of criticalChecks) {
  if (check.regex.test(htmlContent)) {
    console.log(`PASS: [HTML] ${check.name}`);
  } else {
    console.error(`FAIL: [HTML] ${check.name} missing or malformed`);
    failedChecks++;
  }
}

// Test 2: CSS Integrity & Custom Properties
const cssPath = path.resolve('portfolio-site/style.css');
if (!fs.existsSync(cssPath)) {
  console.error('FAIL: style.css is missing');
  process.exit(1);
}
const cssContent = fs.readFileSync(cssPath, 'utf8');

const cssChecks = [
  { name: 'Design Tokens Defined (:root)', regex: /:root\s*\{[^}]*--color-/i },
  { name: 'Prefers-Reduced-Motion Media Query', regex: /@media\s*\(\s*prefers-reduced-motion/i },
  { name: 'Skip-link Accessibility Styles', regex: /\.skip\s*\{/i }
];

for (const check of cssChecks) {
  if (check.regex.test(cssContent)) {
    console.log(`PASS: [CSS] ${check.name}`);
  } else {
    console.error(`FAIL: [CSS] ${check.name} missing`);
    failedChecks++;
  }
}

// Test 3: JavaScript Syntax Check
const jsPath = path.resolve('portfolio-site/main.js');
if (!fs.existsSync(jsPath)) {
  console.error('FAIL: main.js is missing');
  process.exit(1);
}
const jsContent = fs.readFileSync(jsPath, 'utf8');
try {
  new vm.Script(jsContent);
  console.log('PASS: [JS] Syntax and parsing check passed cleanly');
} catch (err) {
  console.error('FAIL: [JS] Syntax error in main.js:', err.message);
  failedChecks++;
}

// Test 4: Verify No Broken Internal Anchors
const anchorRegex = /href=["']#([^"']+)["']/g;
let aMatch;
const internalAnchors = new Set();
while ((aMatch = anchorRegex.exec(htmlContent)) !== null) {
  const targetId = aMatch[1];
  if (targetId && targetId !== 'top') {
    internalAnchors.add(targetId);
  }
}

for (const id of internalAnchors) {
  const idRegex = new RegExp(`id=["']${id}["']`, 'i');
  if (idRegex.test(htmlContent)) {
    console.log(`PASS: [Anchor] Target #${id} exists in DOM`);
  } else {
    console.error(`FAIL: [Anchor] Target #${id} referenced but not found with id="${id}"`);
    failedChecks++;
  }
}

if (failedChecks > 0) {
  console.error(`\nTest suite finished with ${failedChecks} failures.`);
  process.exit(1);
}

console.log('\nAll portfolio test suites PASSED successfully!');
