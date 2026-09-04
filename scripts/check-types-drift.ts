import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSurface } from './fathom-surface.ts';

/**
 * Fails where the vendored surface is not the one Fathom actually offers.
 *
 * The copy in `types/` is what `tsc` checks the readings against, so a reading
 * here is only trustworthy while that copy is current. Fetched rather than
 * depended on: Fathom is an application, and installing it for one declaration
 * file drags its whole runtime — a hundred packages — behind it.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const held = readFileSync(join(ROOT, 'types', 'fathom.d.ts'), 'utf8');

if (await readSurface() !== held) {
    console.error(
        'types/fathom.d.ts is not the surface Fathom offers.\n'
        + 'Run `npm run types:refresh` and check what changed before committing it.',
    );
    process.exit(1);
}

console.log('The vendored surface is the one Fathom offers.');
