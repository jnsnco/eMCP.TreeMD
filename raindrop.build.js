export default {
  esbuild: {
    platform: 'node',
    target: 'node20',
    format: 'esm',
    bundle: true,
    packages: 'external',
    mainFields: ['main', 'module'],
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
  }
}