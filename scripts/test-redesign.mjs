import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const htmlPath = path.resolve('portfolio-site/index.html');
const cssPath = path.resolve('portfolio-site/style.css');
const jsPath = path.resolve('portfolio-site/main.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name} -> ${err.message}`);
    failed++;
  }
}

function stripJsStrings(source) {
  return source
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, '""');
}

function stripCssStrings(source) {
  return source
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, '""');
}

test('No HTML comments in portfolio-site/index.html', () => {
  assert.equal(/<!--[\s\S]*?-->/.test(html), false, 'Found HTML comment in index.html');
});

test('No CSS comments in portfolio-site/style.css', () => {
  const cleaned = stripCssStrings(css);
  assert.equal(/\/\*[\s\S]*?\*\//.test(cleaned), false, 'Found CSS comment in style.css');
});

test('No JS comments in portfolio-site/main.js', () => {
  const cleaned = stripJsStrings(js);
  assert.equal(/\/\*[\s\S]*?\*\//.test(cleaned), false, 'Found block comment in main.js');
  assert.equal(/\/\//.test(cleaned), false, 'Found line comment in main.js');
});

test('Cobalt-on-cream light palette and cool dark palette defined in style.css', () => {
  assert.match(css, /--color-paper:\s*#fff6ea/i);
  assert.match(css, /--color-ink:\s*#0033e6/i);
  assert.match(css, /--color-hover:\s*#c8b5ff/i);
  assert.match(css, /--color-paper:\s*#0f131c/i);
  assert.match(css, /--color-ink:\s*#eef2ff/i);
});

test('Removed forbidden copy and deprecated UI controls from index.html', () => {
  const forbidden = [
    /\bbread\b/i,
    /\bbakery\b/i,
    /Greg Skriloff/i,
    /\bCGPA\b/i,
    /⌘K/,
    /Reset desk/i,
    /Brand board/i,
    /Copy email/i,
    /Surge Gate/i,
    /Dynamic Judge Desk/i,
    /Built with vanilla HTML/i,
    /images\/mizan\.jpg/i,
    /images\/basin_survey\.jpg/i,
    /Brunch/i,
    /Travel-Planner/i,
  ];
  for (const pattern of forbidden) {
    assert.equal(pattern.test(html), false, `Found forbidden pattern ${pattern}`);
  }
});

test('Required sections, real GitHub repos, and 3 social links exist in index.html', () => {
  const required = [
    'id="hello"',
    'id="line"',
    'id="tip"',
    'id="githubLive"',
    'id="work"',
    'id="benchmarks"',
    'id="prints"',
    'id="contact"',
    'id="a-links"',
    'id="a-end"',
    'id="lightbox"',
    'https://github.com/taha463/Mistral-7B-MultiLoRA-Legal',
    'https://github.com/taha463/socratic-tutor',
    'https://github.com/taha463/aegis-frontend',
    'https://x.com/_mtahaa_',
    'https://linkedin.com/in/muhammadtaha02',
    '0.6623',
    '46.67%',
    'KGE 0.89',
    'Lahore',
  ];
  for (const token of required) {
    assert.ok(html.includes(token), `Missing expected content: ${token}`);
  }
});

test('Portfolio core exposes pure deterministic logic for knot, path, time, and repo summaries', () => {
  const sandbox = {
    window: {},
    document: {
      addEventListener() { },
      documentElement: { setAttribute() { }, dataset: {} },
    },
    localStorage: { getItem() { return null; }, setItem() { } },
    matchMedia() { return { matches: false, addEventListener() { } }; },
    console,
    Math,
    Number,
    String,
    Array,
    Object,
    Date,
  };
  sandbox.globalThis = sandbox;
  sandbox.window = sandbox;
  vm.runInNewContext(js, sandbox);

  const core = sandbox.__portfolioCore;
  assert.ok(core, 'window.__portfolioCore is not defined');

  const now = Date.parse('2026-11-19T12:00:00Z');
  assert.equal(core.formatRelativeTime('2026-11-19T08:00:00Z', now), 'Today');
  assert.equal(core.formatRelativeTime('2026-11-18T12:00:00Z', now), '1d ago');
  assert.equal(core.formatRelativeTime('2026-11-09T12:00:00Z', now), '10d ago');
  assert.equal(core.formatRelativeTime(null, now), 'Active');

  const summary = core.getRepoSummary('socratic-tutor', {
    'socratic-tutor': { language: 'TypeScript', pushed_at: '2026-11-17T12:00:00Z', html_url: 'https://github.com/taha463/socratic-tutor' },
  }, now);
  assert.equal(summary.language, 'TypeScript');
  assert.equal(summary.pushedLabel, '2d ago');
  assert.equal(summary.stat1Value, '0.0%');

  const knot = core.buildKnotPoints(500, 1200, 1);
  assert.ok(knot.length >= 15, 'Expected multi-point bow knot geometry');
  assert.equal(knot[0].x, 500);
  assert.equal(knot[0].y, 1200);

  const pathStr = core.computeLinePath(knot);
  assert.ok(pathStr.startsWith('M 500.0 1200.0'), `Unexpected path start: ${pathStr.slice(0, 30)}`);
  assert.ok(pathStr.includes(' Q '), 'Expected smooth quadratic curve segments');
});

test('Unhashed CSS and JS are not marked immutable in netlify.toml and use cache-busting query params', () => {
  const netlify = fs.readFileSync(path.resolve('netlify.toml'), 'utf8');
  assert.equal(/immutable/i.test(netlify), false, 'Found immutable cache header on unhashed assets in netlify.toml');
  assert.match(html, /href=["']style\.css\?v=\d+["']/i);
  assert.match(html, /src=["']main\.js\?v=\d+["']/i);
});

console.log(`\nRedesign suite: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  process.exit(1);
}
