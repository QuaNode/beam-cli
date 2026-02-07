const esbuild = require('esbuild');
const { copy } = require('cpx');

async function build() {
  const currentNodeVersion = process.versions.node.split('.')[0];
  const target = `node${currentNodeVersion}`;
  console.log(`Building for target: ${target}`);

  try {
    // Bundle CLI - utilize compiled JS to preserve decorator metadata
    // Copy package.json to dist so that require('../../../package.json') works
    const fs = require('fs');
    fs.copyFileSync('package.json', 'dist/package.json');
    console.log('package.json copied to dist');

    const isDev = process.argv.includes('--dev');
    console.log(`Building for ${isDev ? 'development' : 'production'}`);

    await esbuild.build({
      entryPoints: ['dist/src/cli/main.js'],
      bundle: true,
      platform: 'node',
      target: target,
      sourcemap: isDev,
      outfile: 'dist/beam.js',
      external: [
        'beamjs',
        'functional-chain-behaviour',
        'js-behaviours',
        'class-transformer',
        'class-validator',
        '@nestjs/microservices',
        '@nestjs/platform-express',
        '@nestjs/websockets/socket-module',
        '@nestjs/microservices/microservices-module',
      ],
    });

    console.log('CLI bundled to dist/beam.js');

    // Copy backend files
    copy('src/backend/**/*', 'dist/src/backend', (err) => {
      if (err) console.error('Error copying backend:', err);
      else console.log('Backend copied to dist/src/backend');
    });

  } catch (e) {
    console.error('Build failed:', e);
    process.exit(1);
  }
}

build();
