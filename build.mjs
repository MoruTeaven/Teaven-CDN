import { build } from 'esbuild';
import { cpSync, mkdirSync } from 'fs';

mkdirSync('dist', { recursive: true });

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  outfile: 'dist/index.js',
  format: 'esm',
  target: 'es2022',
  conditions: ['workerd', 'worker', 'browser'],
  external: ['__STATIC_CONTENT_MANIFEST'],
  minify: false,
  loader: { '.html': 'text' },
});

cpSync('src/pages', 'dist/pages', { recursive: true });

console.log('Build complete!');
