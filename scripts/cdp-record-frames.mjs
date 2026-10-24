import fs from 'fs';
import path from 'path';

const framesDir = path.resolve('video-frames');
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

// Clean old frames
const oldFiles = fs.readdirSync(framesDir);
for (const f of oldFiles) {
  if (f.endsWith('.jpg') || f.endsWith('.png')) {
    fs.unlinkSync(path.join(framesDir, f));
  }
}

async function getPageWsUrl() {
  const res = await fetch('http://127.0.0.1:9222/json/list');
  const list = await res.json();
  const page = list.find(p => p.type === 'page' && p.url.includes('localhost:4173'));
  if (!page) {
    throw new Error('Portfolio page not found in Chrome DevTools target list');
  }
  return page.webSocketDebuggerUrl;
}

async function main() {
  const wsUrl = await getPageWsUrl();
  console.log('Connecting to Chrome CDP via WebSocket:', wsUrl);

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  await new Promise(r => ws.onopen = r);
  console.log('Connected to CDP.');

  // Set high quality 1080p viewport (1920x1080)
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
    mobile: false
  });

  // Enable Page domain
  await send('Page.enable');
  await send('DOM.enable');

  let frameCount = 0;
  async function captureFrame() {
    frameCount++;
    const res = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buffer = Buffer.from(res.data, 'base64');
    const filename = `frame_${String(frameCount).padStart(5, '0')}.jpg`;
    fs.writeFileSync(path.join(framesDir, filename), buffer);
  }

  async function evalJs(expr) {
    return await send('Runtime.evaluate', { expression: expr, awaitPromise: true });
  }

  console.log('Starting 30-second smooth interactive walkthrough capture (~300 key visual frames)...');

  // Ensure scroll is at top
  await evalJs(`window.scrollTo(0, 0);`);
  
  // 1. Hero Section settling & viewing (Frames 1-40, ~4 seconds)
  console.log('[Phase 1/6] Hero Section & Brand Wordmark...');
  for (let i = 0; i < 40; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 90));
  }

  // 2. Open HUD / Command Palette (Frames 41-75, ~3.5 seconds)
  console.log('[Phase 2/6] Triggering System HUD Command Palette...');
  await evalJs(`document.getElementById('hudTrigger')?.click();`);
  for (let i = 0; i < 35; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 90));
  }

  // Close HUD
  await evalJs(`
    const closeBtn = document.querySelector('.hud__close') || document.querySelector('[aria-label="Close HUD"]');
    if (closeBtn) closeBtn.click();
    else {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27 }));
    }
  `);
  for (let i = 0; i < 15; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 90));
  }

  // 3. Smooth scroll down to Flagship Systems (Frames 91-160, ~7 seconds)
  console.log('[Phase 3/6] Smooth scroll to Flagship Systems...');
  const systemsTargetY = await evalJs(`
    (() => {
      const el = document.getElementById('systems');
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY - 80) : 900;
    })()
  `);
  const targetY1 = systemsTargetY.result.value || 900;

  for (let i = 0; i <= 35; i++) {
    const progress = i / 35;
    // easeInOutCubic
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    await evalJs(`window.scrollTo(0, ${Math.round(ease * targetY1)});`);
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }

  // Hover & click interactive tab in Aegis
  console.log('Interacting with Aegis Disaster AI multi-agent card...');
  await evalJs(`
    (() => {
      const cards = document.querySelectorAll('.flagship-card, .system-card, .tab-btn');
      if (cards.length > 0) cards[0].classList.add('is-active');
    })()
  `);
  for (let i = 0; i < 30; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }

  // 4. Smooth scroll to Benchmarks (Frames 161-220, ~6 seconds)
  console.log('[Phase 4/6] Scrolling to Benchmarks & Metrics Matrix...');
  const benchmarksTargetY = await evalJs(`
    (() => {
      const el = document.getElementById('benchmarks');
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY - 80) : 1900;
    })()
  `);
  const targetY2 = benchmarksTargetY.result.value || 1900;
  const startY2 = targetY1;

  for (let i = 0; i <= 30; i++) {
    const progress = i / 30;
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    await evalJs(`window.scrollTo(0, ${Math.round(startY2 + (targetY2 - startY2) * ease)});`);
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }
  for (let i = 0; i < 25; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }

  // 5. Smooth scroll to Architecture Lab (Frames 221-270, ~5 seconds)
  console.log('[Phase 5/6] Scrolling to Architecture Lab...');
  const labTargetY = await evalJs(`
    (() => {
      const el = document.getElementById('lab');
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY - 80) : 2800;
    })()
  `);
  const targetY3 = labTargetY.result.value || 2800;
  const startY3 = targetY2;

  for (let i = 0; i <= 30; i++) {
    const progress = i / 30;
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    await evalJs(`window.scrollTo(0, ${Math.round(startY3 + (targetY3 - startY3) * ease)});`);
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }
  for (let i = 0; i < 20; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }

  // 6. Smooth scroll to Dispatch / Contact (Frames 271-315, ~4.5 seconds)
  console.log('[Phase 6/6] Scrolling to Dispatch & Get in Touch...');
  const dispatchTargetY = await evalJs(`
    (() => {
      const el = document.getElementById('dispatch');
      return el ? Math.round(el.getBoundingClientRect().top + window.scrollY - 80) : 3800;
    })()
  `);
  const targetY4 = dispatchTargetY.result.value || 3800;
  const startY4 = targetY3;

  for (let i = 0; i <= 25; i++) {
    const progress = i / 25;
    const ease = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    await evalJs(`window.scrollTo(0, ${Math.round(startY4 + (targetY4 - startY4) * ease)});`);
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }
  for (let i = 0; i < 20; i++) {
    await captureFrame();
    await new Promise(r => setTimeout(r, 80));
  }

  ws.close();
  console.log(`Successfully captured ${frameCount} high-res 1080p frames.`);
}

main().catch(err => {
  console.error('Capture failed:', err);
  process.exit(1);
});
