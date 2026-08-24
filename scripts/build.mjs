import { build } from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('lib', { recursive: true });

const crepeCssBuild = await build({
  stdin: {
    contents: [
      "@import '@milkdown/crepe/theme/common/prosemirror.css';",
      "@import '@milkdown/crepe/theme/common/reset.css';",
      "@import '@milkdown/crepe/theme/common/cursor.css';",
      "@import '@milkdown/crepe/theme/common/list-item.css';",
      "@import '@milkdown/crepe/theme/common/link-tooltip.css';",
      "@import '@milkdown/crepe/theme/common/toolbar.css';",
      "@import '@milkdown/crepe/theme/common/placeholder.css';",
      "@import '@milkdown/crepe/theme/common/code-mirror.css';",
      "@import '@milkdown/crepe/theme/common/table.css';",
    ].join('\n'),
    loader: 'css',
    resolveDir: process.cwd(),
  },
  outfile: 'crepe.css',
  bundle: true,
  minify: true,
  write: false,
});
const crepeCss = crepeCssBuild.outputFiles.find((file) => file.path.endsWith('.css'))?.text;
if (!crepeCss) throw new Error('Could not bundle Milkdown Crepe styles.');

await build({
  entryPoints: ['src/client.js'],
  outfile: 'lib/client.js',
  bundle: true,
  minify: true,
  platform: 'browser',
  format: 'cjs',
  target: ['chrome120'],
  external: ['react'],
  define: {
    __CREPE_CSS__: JSON.stringify(crepeCss),
  },
  legalComments: 'eof',
  banner: {
    js: 'window.__ModuleLoader__.load({id:"dsh-notes-markdown",factory:(require)=>{var module={exports:{}};var exports=module.exports;',
  },
  footer: {
    js: 'return module.exports;}});',
  },
});

await copyFile('src/index.js', 'lib/index.js');
await copyFile('src/storage.js', 'lib/storage.js');
