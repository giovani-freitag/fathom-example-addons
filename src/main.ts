/**
 * The page that browses the readings.
 *
 * Their source is gathered at build time rather than fetched, so the page is
 * one file with nothing to wait for and cannot drift from what is committed.
 */

/** Where the repository lives, which is what Fathom is given to open. */
const REPOSITORY = 'gh/giovani-freitag/fathom-readings';

const SOURCES: Record<string, string> = import.meta.glob('../readings/**/*.ts', {
    query: '?raw',
    import: 'default',
    eager: true,
});

interface Reading {
    readonly name: string;
    /** Its files, keyed by the path the reading imports them under. */
    readonly files: readonly (readonly [string, string])[];
    /** The first sentence of the entry's opening comment. */
    readonly about: string;
}

/**
 * The readings, gathered out of what the bundler inlined.
 *
 * @returns One entry per folder under `readings/`, entry file first.
 */
function readingsFound(): readonly Reading[] {
    const byName = new Map<string, [string, string][]>();

    for (const [at, source] of Object.entries(SOURCES)) {
        const found = /^\.\.\/readings\/([^/]+)\/(.+)$/.exec(at);
        if (found === null) {
            continue;
        }
        const held = byName.get(found[1]!) ?? [];
        held.push([found[2]!, source]);
        byName.set(found[1]!, held);
    }

    return [...byName]
        .map(([name, files]) => ({
            name,
            files: files.sort(([one], [other]) => Number(other === 'main.ts') - Number(one === 'main.ts')),
            about: aboutOf(files.find(([path]) => path === 'main.ts')?.[1] ?? ''),
        }))
        .sort((one, other) => one.name.localeCompare(other.name));
}

/** The headline out of a reading's opening comment, where it has one. */
function aboutOf(source: string): string {
    return /^\/\/ (.+)$/m.exec(source)?.[1] ?? '';
}

function render(): void {
    const into = document.querySelector('#readings');
    if (into === null) {
        return;
    }

    for (const reading of readingsFound()) {
        into.append(cardFor(reading));
    }

    const footer = document.createElement('footer');
    footer.textContent = 'MIT. Take these apart.';
    document.querySelector('#page')?.append(footer);
}

function cardFor(reading: Reading): HTMLElement {
    const card = document.createElement('article');
    const spec = `${REPOSITORY}/readings/${reading.name}`;

    const head = document.createElement('header');
    const title = document.createElement('h2');
    title.textContent = reading.name;
    const about = document.createElement('p');
    about.textContent = reading.about;
    head.append(title, about);

    card.append(head, specRow(spec));
    for (const [path, source] of reading.files) {
        card.append(fileBlock(path, source, path === 'main.ts'));
    }
    return card;
}

/** The line a reader copies into Fathom's own way in. */
function specRow(spec: string): HTMLElement {
    const row = document.createElement('div');
    row.className = 'spec';

    const shown = document.createElement('code');
    shown.textContent = spec;

    const copy = document.createElement('button');
    copy.type = 'button';
    copy.textContent = 'Copy';
    copy.addEventListener('click', () => {
        void navigator.clipboard.writeText(spec).then(
            () => { said(copy, 'Copied'); },
            () => { said(copy, 'Copy it by hand'); },
        );
    });

    row.append(shown, copy);
    return row;
}

/** Says what happened on the button itself, then puts it back. */
function said(button: HTMLButtonElement, text: string): void {
    const was = button.textContent;
    button.textContent = text;
    setTimeout(() => { button.textContent = was; }, 1_500);
}

function fileBlock(path: string, source: string, isOpen: boolean): HTMLElement {
    const block = document.createElement('details');
    block.open = isOpen;

    const summary = document.createElement('summary');
    summary.textContent = path;

    const shown = document.createElement('pre');
    // Set as text rather than as markup: this is somebody's source, and the one
    // place a page like this gets it wrong is by letting it be read as HTML.
    shown.textContent = source.trimEnd();

    block.append(summary, shown);
    return block;
}

render();
