import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const entry = path.join(root, 'src', 'client', 'index.jsx');
const buildDir = path.join(root, 'build');
const outfile = path.join(buildDir, 'app.iife.js');
const target = path.join(root, 'client.js');

const platform = `${process.platform}-${process.arch}`;
const binary = path.join(root, 'tools', 'node_modules', '@esbuild', platform, process.platform === 'win32' ? 'esbuild.exe' : 'bin/esbuild');

await fs.mkdir(buildDir, { recursive: true });

const result = spawnSync(
  binary,
  [
    entry,
    '--bundle',
    '--format=iife',
    '--platform=browser',
    '--target=es2020',
    '--jsx=transform',
    '--jsx-factory=h',
    '--jsx-fragment=Fragment',
    '--charset=utf8',
    '--legal-comments=none',
    '--log-level=warning',
    `--outfile=${outfile}`,
  ],
  { stdio: 'inherit' },
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);

const code = await fs.readFile(outfile, 'utf8');
const indented = code
  .split('\n')
  .map((line) => (line ? `    ${line}` : line))
  .join('\n');

const wrapped = `window.__ModuleLoader__.load({
  id: 'dsh-musee',
  factory(require) {
    globalThis.__MUSEE_REACT__ = require('react');
${indented}
    return globalThis.__MUSEE_PLUGIN__;
  },
});
`;

await fs.writeFile(target, wrapped, 'utf8');
console.log(`client.js written (${(Buffer.byteLength(wrapped) / 1024).toFixed(1)} KiB)`);
