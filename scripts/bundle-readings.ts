import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Gathers each reading into the one file Fathom opens it from.
 *
 * Not a bundle in the usual sense: a reading is TypeScript that Fathom's own
 * in-page compiler reads, so bundling it into JavaScript would produce
 * something the editor could not show and nobody could learn from. What this
 * writes is every file of a reading under one envelope — the `.fathom.json`
 * shape the editor's open button takes — so a reading can be handed over as a
 * single file to somebody who would rather not go through a repository.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const READINGS = join(ROOT, 'readings');
const OUT = join(ROOT, 'dist', 'bundles');

/** The envelope version. Fathom refuses anything else. */
const FATHOM_BUNDLE = 1;

/** The file Fathom takes a reading out of. */
const ENTRY_FILE = 'main.ts';

interface Bundle {
    readonly fathom: number;
    readonly name: string;
    readonly files: Record<string, string>;
}

/**
 * Every `.ts` and `.tsx` file under a folder, keyed by its path within it.
 *
 * @param folder - Where the reading lives.
 * @returns Its files, named the way the reading imports them.
 */
function filesUnder(folder: string): Record<string, string> {
    const found: Record<string, string> = {};

    const walk = (at: string): void => {
        for (const entry of readdirSync(at)) {
            const path = join(at, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
            } else if (/\.tsx?$/.test(entry) && !entry.endsWith('.d.ts')) {
                found[relative(folder, path).replaceAll('\\', '/')] = readFileSync(path, 'utf8');
            }
        }
    };

    walk(folder);
    return found;
}

function bundleOf(name: string): Bundle {
    const files = filesUnder(join(READINGS, name));
    if (files[ENTRY_FILE] === undefined) {
        throw new Error(`readings/${name} has no ${ENTRY_FILE}, so Fathom could not open it.`);
    }
    return { fathom: FATHOM_BUNDLE, name, files };
}

const names = readdirSync(READINGS).filter((name) => statSync(join(READINGS, name)).isDirectory());
mkdirSync(OUT, { recursive: true });

for (const name of names) {
    const bundle = bundleOf(name);
    writeFileSync(join(OUT, `${name}.fathom.json`), `${JSON.stringify(bundle, null, 4)}\n`);
    const count = Object.keys(bundle.files).length;
    console.log(`${name}: ${count} ${count === 1 ? 'file' : 'files'}`);
}

console.log(`Wrote ${names.length} bundles to dist/bundles.`);
