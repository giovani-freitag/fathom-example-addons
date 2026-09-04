import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSurface } from './fathom-surface.ts';

/** Takes the surface Fathom offers and puts it where `tsc` reads it. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

writeFileSync(join(ROOT, 'types', 'fathom.d.ts'), await readSurface());
console.log('types/fathom.d.ts is now the surface Fathom offers.');
