import { context } from 'esbuild';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const DEFAULT_PORT = Number.parseInt(process.env.PORT || '7890', 10);
const MAX_PORT_TRIES = 20;
const DEV_INDEX = resolve(root, 'dev/index.html');

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
};

const FALLBACK_INDEX_HTML = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Element Picker Dev</title>
  <style>
    :root { color-scheme: light; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      color: #222;
      background: #f6f7fb;
    }
    .topbar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: #fff;
      border-bottom: 1px solid #ececec;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      border: 0;
      border-radius: 8px;
      padding: 9px 14px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      color: #fff;
      background: #dc2626;
    }
    .msg {
      font-size: 12px;
      color: #666;
    }
    .wrap {
      max-width: 980px;
      margin: 24px auto;
      padding: 0 16px 40px;
    }
    .demo-card {
      background: #fff;
      border: 1px solid #e9e9e9;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    }
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }
    .pill {
      display: inline-block;
      margin-top: 8px;
      font-size: 12px;
      line-height: 1;
      padding: 6px 10px;
      border-radius: 999px;
      background: #111;
      color: #fff;
    }
  </style>
</head>
<body>
  <div class="topbar">
    <button class="btn" id="load-btn">Load Bookmarklet</button>
    <span class="msg">当前为内置开发页（未找到 <code>dev/index.html</code>）</span>
  </div>
  <main class="wrap">
    <section class="demo-card">
      <h2>Element Picker Dev Playground</h2>
      <p>点击上方按钮注入 <code>/dist/bundle.dev.js</code>，然后在页面中选择任意元素测试复制。</p>
      <span class="pill">demo</span>
    </section>
    <section class="demo-grid">
      <article class="demo-card"><h3>Card A</h3><p>文本 A</p></article>
      <article class="demo-card"><h3>Card B</h3><p>文本 B</p></article>
      <article class="demo-card"><h3>Card C</h3><p>文本 C</p></article>
    </section>
  </main>
  <script>
    const btn = document.getElementById('load-btn');
    btn.addEventListener('click', async () => {
      try {
        const old = document.getElementById('bm-dev-script');
        if (old) old.remove();
        const script = document.createElement('script');
        script.id = 'bm-dev-script';
        script.src = '/dist/bundle.dev.js?t=' + Date.now();
        document.body.appendChild(script);
      } catch (err) {
        console.error(err);
        alert('Load failed: ' + (err && err.message ? err.message : String(err)));
      }
    });
  </script>
</body>
</html>
`;

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
    if (existsSync(DEV_INDEX)) {
      filePath = DEV_INDEX;
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(FALLBACK_INDEX_HTML);
      return;
    }
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

const port = await listenWithFallbackPort(server, DEFAULT_PORT, MAX_PORT_TRIES);

console.log(`\n🚀 Dev server running at http://localhost:${port}`);
if (port !== DEFAULT_PORT) {
  console.log(`   Port ${DEFAULT_PORT} was occupied, auto-switched to ${port}.`);
}
if (!existsSync(DEV_INDEX)) {
  console.log(`   dev/index.html not found, serving built-in fallback page.`);
}
console.log(`   Open the page, then click the "Load Bookmarklet" button to test.\n`);
console.log(`   The bundle auto-rebuilds when you edit src/ files.`);
console.log(`   Refresh the page to pick up changes.\n`);

process.on('SIGINT', async () => {
  await ctx.dispose();
  server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await ctx.dispose();
  server.close();
  process.exit(0);
});

async function listenWithFallbackPort(httpServer, startPort, maxTries) {
  for (let offset = 0; offset < maxTries; offset++) {
    const candidate = startPort + offset;
    const result = await attemptListen(httpServer, candidate);
    if (result.ok) return candidate;
    if (!result.retryable) {
      throw result.error;
    }
  }
  throw new Error(`Unable to bind a dev server port from ${startPort} to ${startPort + maxTries - 1}`);
}

function attemptListen(httpServer, candidatePort) {
  return new Promise((resolveListen, rejectListen) => {
    const onError = (error) => {
      cleanup();
      if (error && error.code === 'EADDRINUSE') {
        resolveListen({ ok: false, retryable: true, error });
        return;
      }
      resolveListen({ ok: false, retryable: false, error });
    };

    const onListening = () => {
      cleanup();
      resolveListen({ ok: true });
    };

    function cleanup() {
      httpServer.off('error', onError);
      httpServer.off('listening', onListening);
    }

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
    try {
      httpServer.listen(candidatePort);
    } catch (error) {
      cleanup();
      rejectListen(error);
    }
  });
}
