import { buildSync } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

mkdirSync(resolve(root, 'dist'), { recursive: true });

// Step 1: Bundle + minify into a single IIFE
buildSync({
  entryPoints: [resolve(root, 'src/main.js')],
  bundle: true,
  minify: true,
  format: 'iife',
  outfile: resolve(root, 'dist/bundle.js'),
  target: ['es2020'],
  charset: 'utf8',
});

// Step 2: Read the bundle and wrap as bookmarklet
const bundle = readFileSync(resolve(root, 'dist/bundle.js'), 'utf8').trim();
const bookmarklet = `javascript:void(${encodeURIComponent(`(function(){${bundle}})()`)})`;

writeFileSync(resolve(root, 'dist/bookmarklet.txt'), bookmarklet, 'utf8');

// Step 3: Also create a non-minified bundle for debugging
buildSync({
  entryPoints: [resolve(root, 'src/main.js')],
  bundle: true,
  minify: false,
  format: 'iife',
  outfile: resolve(root, 'dist/bundle.dev.js'),
  target: ['es2020'],
  charset: 'utf8',
});

const size = Buffer.byteLength(bookmarklet, 'utf8');
console.log(`✓ Bookmarklet built successfully`);
console.log(`  dist/bundle.js      — minified bundle`);
console.log(`  dist/bundle.dev.js  — readable bundle (for debugging)`);
console.log(`  dist/bookmarklet.txt — bookmarklet URL (${(size / 1024).toFixed(1)} KB)`);

if (size > 65536) {
  console.warn(`\n⚠ Bookmarklet is ${(size / 1024).toFixed(1)} KB — some browsers limit bookmarklets to ~65 KB.`);
  console.warn(`  Consider using a loader pattern: the bookmarklet injects a <script> tag pointing to a hosted file.`);
}
