import { context } from 'esbuild';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const PORT = 3456;

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
};

// esbuild: watch & rebuild src/main.js → dist/bundle.dev.js
const ctx = await context({
  entryPoints: [resolve(root, 'src/main.js')],
  bundle: true,
  format: 'iife',
  outfile: resolve(root, 'dist/bundle.dev.js'),
  target: ['es2020'],
  charset: 'utf8',
  sourcemap: 'inline',
});

await ctx.watch();
console.log('👀 Watching src/ for changes...');

// Simple static server for dev/index.html and dist/
const server = createServer((req, res) => {
  let filePath;
  const url = req.url.split('?')[0];

  if (url === '/' || url === '/index.html') {
    filePath = resolve(root, 'dev/index.html');
  } else if (url.startsWith('/dist/')) {
    filePath = resolve(root, url.slice(1));
  } else {
    filePath = resolve(root, 'dev', url.slice(1));
  }

  if (!existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = extname(filePath);
  const mime = MIME[ext] || 'text/plain';
  const content = readFileSync(filePath);
  res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
  res.end(content);
});

server.listen(PORT, () => {
  console.log(`\n🚀 Dev server running at http://localhost:${PORT}`);
  console.log(`   Open the page, then click the "Load Bookmarklet" button to test.\n`);
  console.log(`   The bundle auto-rebuilds when you edit src/ files.`);
  console.log(`   Refresh the page to pick up changes.\n`);
});

process.on('SIGINT', async () => {
  await ctx.dispose();
  server.close();
  process.exit(0);
});
