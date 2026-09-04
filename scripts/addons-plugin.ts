import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHighlighter } from 'shiki';
import type { Plugin } from 'vite';
import { aboutOf, teachesIn } from '../src/site/reading-source.ts';
import type { ShownAddon } from '../src/site/shown-addon.ts';

/**
 * Every addon, highlighted, as one module the page imports.
 *
 * Built here rather than fetched or highlighted in the browser. The source is
 * what this page is for, so it has to be readable — and highlighting it at
 * build time means the reader is sent the finished markup instead of a
 * highlighter and a pile of grey text to run it over.
 */

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ADDONS = join(ROOT, 'src', 'addons');

/** The file Fathom takes an addon out of, and the one shown first. */
const ENTRY_FILE = 'main.ts';

const VIRTUAL_ID = 'virtual:addons';

/** Every `.ts` under a folder, keyed by its path within it, entry first. */
function filesUnder(folder: string): readonly (readonly [string, string])[] {
    const found: [string, string][] = [];

    const walk = (at: string): void => {
        for (const entry of readdirSync(at)) {
            const path = join(at, entry);
            if (statSync(path).isDirectory()) {
                walk(path);
            } else if (/\.tsx?$/.test(entry) && !entry.endsWith('.d.ts')) {
                found.push([relative(folder, path).replaceAll('\\', '/'), readFileSync(path, 'utf8')]);
            }
        }
    };

    walk(folder);
    return found.sort(([one], [other]) => (
        Number(other === ENTRY_FILE) - Number(one === ENTRY_FILE) || one.localeCompare(other)
    ));
}

/**
 * The addons as the page needs them.
 *
 * @returns One entry per folder under `src/addons/`, alphabetical.
 */
async function gather(): Promise<readonly ShownAddon[]> {
    // The chart's own palette, so code read here and code read in the guide are
    // plainly the same software.
    const highlighter = await createHighlighter({ themes: ['github-dark-default'], langs: ['typescript'] });
    const names = readdirSync(ADDONS).filter((name) => statSync(join(ADDONS, name)).isDirectory()).sort();

    return names.map((name) => {
        const held = filesUnder(join(ADDONS, name));
        const entry = held.find(([path]) => path === ENTRY_FILE)?.[1] ?? '';

        return {
            name,
            about: aboutOf(entry),
            teaches: teachesIn(held.map(([, source]) => source)),
            files: held.map(([path, source]) => ({
                path,
                html: highlighter.codeToHtml(source.trimEnd(), {
                    lang: 'typescript',
                    theme: 'github-dark-default',
                }),
                lineCount: source.trimEnd().split('\n').length,
            })),
        };
    });
}

/**
 * Serves the addons to the page as a module, and rebuilds when one changes.
 *
 * @returns The plugin, for the Vite configuration to hold.
 */
export function addonsPlugin(): Plugin {
    return {
        name: 'fathom-addons',
        resolveId: (id) => (id === VIRTUAL_ID ? `\0${VIRTUAL_ID}` : null),
        load: async (id) => (
            id === `\0${VIRTUAL_ID}`
                ? `export const ADDONS = ${JSON.stringify(await gather())};`
                : null
        ),
        // Without this an edit to an addon leaves the page showing the copy
        // gathered when the server started, which is the one thing a page whose
        // whole subject is the source must not do.
        configureServer: (server) => {
            server.watcher.add(ADDONS);
            server.watcher.on('change', (at) => {
                if (at.startsWith(ADDONS)) {
                    const held = server.moduleGraph.getModuleById(`\0${VIRTUAL_ID}`);
                    if (held !== undefined) {
                        server.moduleGraph.invalidateModule(held);
                        server.ws.send({ type: 'full-reload' });
                    }
                }
            });
        },
    };
}
