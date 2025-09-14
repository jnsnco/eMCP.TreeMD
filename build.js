import esbuild from 'esbuild';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function build() {
  try {
    await esbuild.build({
      entryPoints: ['src/treemd-mcp/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outfile: 'dist/treemd-mcp/index.js',
      packages: 'external',  // This tells esbuild to treat all packages as external
      resolveExtensions: ['.ts', '.js', '.json'],
      loader: {
        '.ts': 'ts'
      },
      banner: {
        js: `
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
`
      }
    });
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();