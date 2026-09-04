import { ADDONS } from 'virtual:addons';
import type { ShownAddon, ShownFile } from './shown-addon.ts';

/**
 * The page that browses the addons.
 *
 * Their source is gathered and coloured at build time rather than fetched, so
 * the page is one file with nothing to wait for and cannot drift from what is
 * committed.
 */

/**
 * Where the repository lives, which is what Fathom is given to open.
 *
 * No ref, so Fathom resolves to the newest release. Pinned to the branch
 * instead, jsDelivr serves the listing with a year of `max-age` — it treats a
 * branch as immutable — and readers were being handed whichever commit an edge
 * happened to fetch first. The version index it resolves a bare address through
 * carries five minutes, and what that names is a tag, which really is immutable.
 */
const REPOSITORY = 'gh/giovani-freitag/fathom-example-addons';

/** How long a button says what it did before going back to its own name. */
const SAID_FOR_MS = 1_500;

function render(): void {
    const into = document.querySelector('#addons');
    if (into === null) {
        return;
    }

    for (const addon of ADDONS) {
        into.append(cardFor(addon));
    }
}

function cardFor(addon: ShownAddon): HTMLElement {
    const card = document.createElement('article');
    card.className = 'addon';
    card.id = addon.name;

    const spec = `${REPOSITORY}/src/addons/${addon.name}`;
    card.append(headOf(addon, spec), addressRow(spec), filesOf(addon));
    return card;
}

function headOf(addon: ShownAddon, spec: string): HTMLElement {
    const head = document.createElement('header');

    const title = document.createElement('h2');
    const anchor = document.createElement('a');
    anchor.href = `#${addon.name}`;
    anchor.textContent = addon.name;
    anchor.setAttribute('aria-label', `${addon.name}, at ${spec}`);
    title.append(anchor);

    const about = document.createElement('p');
    about.className = 'about';
    about.textContent = addon.about;

    head.append(title, about, chipsOf(addon.teaches));
    return head;
}

/** What the addon shows how to do, read off its own source. */
function chipsOf(teaches: readonly string[]): HTMLElement {
    const list = document.createElement('ul');
    list.className = 'teaches';
    list.setAttribute('aria-label', 'What it shows');

    for (const says of teaches) {
        const chip = document.createElement('li');
        chip.textContent = says;
        list.append(chip);
    }

    return list;
}

/** The line a reader copies into Fathom's own way in. */
function addressRow(spec: string): HTMLElement {
    const row = document.createElement('div');
    row.className = 'address';

    const shown = document.createElement('code');
    shown.textContent = spec;

    row.append(shown, copyButton(spec, 'Copy address', 'Copy'));
    return row;
}

/**
 * The files, shut until asked for.
 *
 * Open by default they made a page nobody could skim: three addons is four
 * hundred lines of TypeScript before a reader learns what any of them is for.
 */
function filesOf(addon: ShownAddon): HTMLElement {
    const held = document.createElement('div');
    held.className = 'files';

    for (const file of addon.files) {
        held.append(fileBlock(file));
    }

    return held;
}

function fileBlock(file: ShownFile): HTMLElement {
    const block = document.createElement('details');
    block.className = 'file';

    const summary = document.createElement('summary');
    const path = document.createElement('span');
    path.className = 'path';
    path.textContent = file.path;
    const lines = document.createElement('span');
    lines.className = 'lines';
    lines.textContent = `${String(file.lineCount)} lines`;
    summary.append(path, lines);

    const source = document.createElement('div');
    source.className = 'source';
    // Markup rather than text, and only here: this string is the highlighter's
    // own output over source this repository holds, not anything a reader or a
    // request could reach.
    source.innerHTML = file.html;

    block.append(summary, source, copyButton(textIn(source), `Copy ${file.path}`, 'Copy file'));
    return block;
}

/** The source back out of what the highlighter made of it. */
function textIn(source: HTMLElement): string {
    return [...source.querySelectorAll('.line')].map((line) => line.textContent).join('\n');
}

function copyButton(text: string, label: string, said: string): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy';
    button.textContent = said;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', () => {
        void navigator.clipboard.writeText(text).then(
            () => { says(button, 'Copied', said); },
            () => { says(button, 'Copy it by hand', said); },
        );
    });

    return button;
}

/** Says what happened on the button itself, then puts its name back. */
function says(button: HTMLButtonElement, text: string, was: string): void {
    button.textContent = text;
    button.classList.add('said');
    setTimeout(() => {
        button.textContent = was;
        button.classList.remove('said');
    }, SAID_FOR_MS);
}

render();
