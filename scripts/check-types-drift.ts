import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Fails where the vendored surface is not the one Fathom actually offers.
 *
 * The copy in `types/` is what `tsc` checks the readings against, so a reading
 * here is only trustworthy while that copy is current. Fetched rather than
 * depended on: Fathom is an application, and installing it for one declaration
 * file drags its whole runtime — a hundred packages — behind it.
 *
 * Replace all of this with `npm i -D @giovani-freitag/fathom` once that package
 * is published; the check becomes the package manager's job.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VENDORED = join(ROOT, 'types', 'fathom.d.ts');

/** Where Fathom generates it. The branch until the work is on `main`. */
const AT = 'https://raw.githubusercontent.com/giovani-freitag/fathom'
    + '/feat/addon-editor/packages/types/fathom.d.ts';

const answer = await fetch(AT);
if (!answer.ok) {
    console.error(`Could not read Fathom's surface (${answer.status}). Leaving the copy alone.`);
    process.exit(1);
}

const offered = await answer.text();
const held = readFileSync(VENDORED, 'utf8');

if (offered !== held) {
    console.error(
        'types/fathom.d.ts is not the surface Fathom offers.\n'
        + 'Run `npm run types:refresh` and check what changed before committing it.',
    );
    process.exit(1);
}

console.log('The vendored surface is the one Fathom offers.');
