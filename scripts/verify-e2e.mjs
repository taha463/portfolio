import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';

const siteDir = path.resolve('portfolio-site');
const outDir = process.env.E2E_SCREENSHOT_DIR
  ? path.resolve(process.env.E2E_SCREENSHOT_DIR)
  : path.join(os.tmpdir(), 'portfolio-e2e-shots');
fs.mkdirSync(outDir, { recursive: true });

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.json': 'application/json',
  '.webp': 'image/webp',
};

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0];
      const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
      const fullPath = path.resolve(siteDir, rel);
      if (!fullPath.startsWith(siteDir) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(fullPath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(fullPath).pipe(res);
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, url: `http://127.0.0.1:${addr.port}/` });
    });
  });
}

function findChrome() {
  const candidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const bin of candidates) {
    if (fs.existsSync(bin)) {
      return bin;
    }
  }
  throw new Error('No local Chromium/Chrome/Edge binary found');
}

async function waitForDevTools(port) {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      if (res.ok) {
        const list = await res.json();
        const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
        if (page) {
          return page.webSocketDebuggerUrl;
        }
      }
    } catch {
      await new Promise((r) => setTimeout(r, 150));
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error('Timed out waiting for Chrome DevTools');
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.ws.addEventListener('open', resolve);
      this.ws.addEventListener('error', reject);
      this.ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(String(ev.data));
        if (msg.id && this.pending.has(msg.id)) {
          const { res, rej } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            rej(new Error(msg.error.message));
          } else {
            res(msg.result);
          }
        } else if (msg.method) {
          this.events.push(msg);
        }
      });
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evalJs(expression) {
    const r = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (r.exceptionDetails) {
      throw new Error(`Page JS error: ${r.exceptionDetails.text}`);
    }
    return r.result ? r.result.value : undefined;
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  const { server, url } = await startServer();
  const port = 9333 + Math.floor(Math.random() * 400);
  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-e2e-'));
  const chromeBin = findChrome();
  const chrome = spawn(
    chromeBin,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${userDataDir}`,
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  try {
    const wsUrl = await waitForDevTools(port);
    const cdp = new CDPClient(wsUrl);
    await cdp.connect();
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await cdp.send('Page.navigate', { url });
    await new Promise((r) => setTimeout(r, 1500));

    const errors = cdp.events.filter(
      (e) => e.method === 'Runtime.exceptionThrown' || (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
    );
    assert.equal(errors.length, 0, `Expected 0 console/runtime errors, got ${errors.length}`);
    console.log('PASS: [E2E] Zero runtime/console errors on load');

    await cdp.evalJs(`(async () => {
      for (const id of ['systems', 'work', 'prints', 'contact', 'hello']) {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'instant' });
        await new Promise(r => setTimeout(r, 250));
      }
      await new Promise(r => setTimeout(r, 400));
    })()`);

    const initial = await cdp.evalJs(`(() => {
      const bodyStyle = getComputedStyle(document.body);
      const imgs = Array.from(document.querySelectorAll('img'))
        .filter(img => !img.closest('[hidden]'))
        .map(img => ({
          src: img.getAttribute('src'),
          complete: img.complete,
          w: img.naturalWidth
        }));
      const pathD = document.getElementById('linePath')?.getAttribute('d') || '';
      const socialCount = document.querySelectorAll('#a-links a').length;
      return {
        bg: bodyStyle.backgroundColor,
        color: bodyStyle.color,
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth: window.innerWidth,
        imgs,
        pathD,
        socialCount
      };
    })()`);

    assert.equal(initial.bg, 'rgb(255, 246, 234)', `Expected cream paper bg, got ${initial.bg}`);
    assert.equal(initial.color, 'rgb(0, 51, 230)', `Expected cobalt ink color, got ${initial.color}`);
    assert.equal(initial.socialCount, 3, `Expected 3 social links, got ${initial.socialCount}`);
    assert.ok(initial.scrollWidth <= initial.innerWidth, `Desktop overflow: ${initial.scrollWidth} > ${initial.innerWidth}`);
    assert.ok(initial.pathD.startsWith('M '), 'Continuous SVG ink path missing');
    for (const img of initial.imgs) {
      assert.ok(img.complete && img.w > 0, `Broken image: ${img.src}`);
    }
    console.log(`PASS: [E2E] Light palette, ${initial.imgs.length} real images loaded, 3 social links, continuous ink path active, zero overflow`);

    const heroShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'v2-desktop-hero.png'), Buffer.from(heroShot.data, 'base64'));

    const interactions = await cdp.evalJs(`(async () => {
      document.getElementById('themeToggle').click();
      await new Promise(r => setTimeout(r, 460));
      const darkTheme = document.documentElement.dataset.theme;
      const darkBg = getComputedStyle(document.body).backgroundColor;
      const darkInk = getComputedStyle(document.body).color;

      document.querySelector('#ghTabs button[data-repo="socratic-tutor"]').click();
      const ghName = document.getElementById('ghRepoName').textContent;

      document.querySelector('#benchFilters button[data-log="mistral"]').click();
      const mistralRows = Array.from(document.querySelectorAll('#benchTable tbody tr')).filter(r => !r.hidden).length;
      document.querySelector('#benchFilters button[data-log="all"]').click();

      document.querySelector('#pile .print').click();
      const lbOpen = !document.getElementById('lightbox').hidden;
      const lbCap = document.getElementById('lightboxCaption').textContent;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      const lbNext = document.getElementById('lightboxCaption').textContent;
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      const lbClosed = document.getElementById('lightbox').hidden;

      return { darkTheme, darkBg, darkInk, ghName, mistralRows, lbOpen, lbCap, lbNext, lbClosed };
    })()`);

    assert.equal(interactions.darkTheme, 'dark');
    assert.equal(interactions.darkBg, 'rgb(15, 19, 28)');
    assert.equal(interactions.darkInk, 'rgb(238, 242, 255)');
    assert.equal(interactions.ghName, 'taha463/socratic-tutor');
    assert.equal(interactions.mistralRows, 2);
    assert.equal(interactions.lbOpen, true);
    assert.ok(interactions.lbCap.includes('Aegis'));
    assert.ok(interactions.lbNext.includes('Socratic'));
    assert.equal(interactions.lbClosed, true);
    console.log('PASS: [E2E] Cool dark mode (#0f131c / #eef2ff), live GitHub tabs, benchmark filter, and lightbox verified');

    await cdp.evalJs(`document.getElementById('systems').scrollIntoView({ behavior: 'instant' });`);
    await new Promise((r) => setTimeout(r, 500));
    const darkSimShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'v2-desktop-dark-gh.png'), Buffer.from(darkSimShot.data, 'base64'));

    await cdp.evalJs(`(async () => { document.getElementById('themeToggle').click(); await new Promise(r => setTimeout(r, 450)); window.scrollTo(0, document.documentElement.scrollHeight); })()`);
    await new Promise((r) => setTimeout(r, 1100));
    const contactShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'v2-desktop-contact-knot.png'), Buffer.from(contactShot.data, 'base64'));

    await cdp.evalJs(`document.getElementById('prints').scrollIntoView({ behavior: 'instant' });`);
    await new Promise((r) => setTimeout(r, 450));
    const printsShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'v2-desktop-prints.png'), Buffer.from(printsShot.data, 'base64'));

    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await cdp.evalJs(`window.scrollTo(0, 0);`);
    await new Promise((r) => setTimeout(r, 500));
    const mobileCheck = await cdp.evalJs(`({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth })`);
    assert.ok(mobileCheck.scrollWidth <= mobileCheck.innerWidth, `Mobile overflow: ${mobileCheck.scrollWidth} > ${mobileCheck.innerWidth}`);
    const mobileShot = await cdp.send('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(outDir, 'v2-mobile-hero.png'), Buffer.from(mobileShot.data, 'base64'));
    console.log(`PASS: [E2E] Mobile 390x844 zero overflow (${mobileCheck.scrollWidth} <= ${mobileCheck.innerWidth})`);

    cdp.close();
  } finally {
    chrome.kill();
    server.close();
    await new Promise((r) => setTimeout(r, 350));
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
    } catch {
      void 0;
    }
  }
}

run().catch((err) => {
  console.error('E2E FAILED:', err);
  process.exit(1);
});
