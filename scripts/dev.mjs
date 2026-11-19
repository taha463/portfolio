import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const siteDir = path.resolve('portfolio-site');
const port = Number(process.env.PORT) || 3000;

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
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];
  const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
  const fullPath = path.resolve(siteDir, rel);

  if (!fullPath.startsWith(siteDir) || !fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(fullPath).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Portfolio dev server running at http://localhost:${port}`);
});
