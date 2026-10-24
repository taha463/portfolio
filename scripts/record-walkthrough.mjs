import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function record() {
  const videoDir = path.resolve('video-recordings');
  if (!fs.existsSync(videoDir)) {
    fs.mkdirSync(videoDir, { recursive: true });
  }

  console.log('Launching browser for 30s interaction screen recording...');
  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1920, height: 1080 }
    }
  });

  const page = await context.newPage();
  
  console.log('Navigating to http://localhost:4173 ...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // 1. Hero entrance and headline settling (0-3.5s)
  await page.waitForTimeout(3500);

  // 2. Open System HUD Command Palette (3.5-6.5s)
  console.log('Opening HUD Command Palette...');
  await page.keyboard.press('Control+KeyK');
  await page.waitForTimeout(2200);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(800);

  // 3. Smooth scroll down to Flagship Systems (6.5-12.5s)
  console.log('Scrolling to Systems...');
  await page.evaluate(async () => {
    const el = document.querySelector('#systems');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(2500);

  // Click Aegis card tab to show interactive state
  console.log('Clicking Aegis system tab...');
  const aegisBtn = page.locator('text=Aegis V13 (Disaster AI)').first();
  if (await aegisBtn.isVisible()) {
    await aegisBtn.click();
  }
  await page.waitForTimeout(2500);

  // 4. Smooth scroll to Systems Benchmark Matrix (12.5-18.5s)
  console.log('Scrolling to Benchmarks...');
  await page.evaluate(async () => {
    const el = document.querySelector('#benchmarks');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(3500);

  // 5. Scroll to Architecture Lab / Alpha-Desk (18.5-24.5s)
  console.log('Scrolling to Architecture Lab...');
  await page.evaluate(async () => {
    const el = document.querySelector('#lab');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(3500);

  // 6. Scroll to Contact / Dispatch (24.5-30s)
  console.log('Scrolling to Dispatch...');
  await page.evaluate(async () => {
    const el = document.querySelector('#dispatch');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  await page.waitForTimeout(3000);

  console.log('Closing context to flush video file...');
  await page.close();
  await context.close();
  await browser.close();

  const files = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    console.log('Successfully recorded video:', files[files.length - 1]);
  }
}

record().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
