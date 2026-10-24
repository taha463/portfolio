import fs from 'node:fs';
import path from 'node:path';

function checkAssets() {
  const baseDir = path.resolve('portfolio-site');
  const htmlFile = path.join(baseDir, 'index.html');
  const content = fs.readFileSync(htmlFile, 'utf8');

  // Match src and href attributes
  const regex = /(?:src|href)=["']([^"']+)["']/g;
  let match;
  const missing = [];
  const found = [];

  while ((match = regex.exec(content)) !== null) {
    const rawUrl = match[1];
    if (
      rawUrl.startsWith('http://') ||
      rawUrl.startsWith('https://') ||
      rawUrl.startsWith('#') ||
      rawUrl.startsWith('data:') ||
      rawUrl.startsWith('mailto:') ||
      rawUrl.startsWith('tel:') ||
      rawUrl.startsWith('javascript:')
    ) {
      continue;
    }

    const cleanUrl = rawUrl.split('?')[0].split('#')[0];
    const assetPath = path.resolve(baseDir, cleanUrl);

    if (fs.existsSync(assetPath)) {
      found.push(cleanUrl);
    } else {
      missing.push(rawUrl);
    }
  }

  console.log(`Found ${found.length} valid relative assets.`);
  if (missing.length > 0) {
    console.error(`Missing ${missing.length} relative assets:`, missing);
    process.exit(1);
  } else {
    console.log('All referenced static assets exist!');
  }
}

checkAssets();
