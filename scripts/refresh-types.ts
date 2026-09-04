import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Takes the surface Fathom offers and puts it where `tsc` reads it. */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const AT = 'https://raw.githubusercontent.com/giovani-freitag/fathom'
    + '/feat/addon-editor/packages/types/fathom.d.ts';

const answer = await fetch(AT);
if (!answer.ok) {
    throw new Error(`Could not read Fathom's surface (${answer.status}).`);
}

writeFileSync(join(ROOT, 'types', 'fathom.d.ts'), await answer.text());
console.log('types/fathom.d.ts is now the surface Fathom offers.');
