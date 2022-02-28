const esbuild = require('esbuild');
const { nodeExternalsPlugin } = require('esbuild-node-externals');

const watch = process.argv.includes('--watch');

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  platform: 'node',
  outfile: 'src/main.js',
  target: 'node12',
  watch,
  charset: 'utf8',
  plugins: [nodeExternalsPlugin()],
});
