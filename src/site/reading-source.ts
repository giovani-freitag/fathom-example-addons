/**
 * What a page can say about an addon without being told.
 *
 * Read off the source rather than written beside it: a note kept by hand goes
 * stale the first time somebody edits the addon and not the note, and a page
 * that describes what an addon no longer does is worse than one that says
 * nothing. Everything here is a fact about the code as it stands.
 */

/** One thing an addon shows how to do, as the source proves it does. */
export interface Signal {
    readonly says: string;
    /** What in the source has to be there for it to be true. */
    readonly proves: RegExp;
}

/**
 * The techniques a page names, and what each one is read off.
 *
 * Kept narrow on purpose. A signal that fires on something ambiguous claims the
 * addon teaches something a reader will then go looking for and not find, and a
 * missing chip only costs them a line of prose.
 */
const SIGNALS: readonly Signal[] = [
    { says: 'a coarser rung', proves: /\bsessions\s*:/ },
    { says: 'reaches back', proves: /\breachingBack\b/ },
    { says: 'warm-up declared', proves: /\bwarmupBars\b/ },
    { says: 'a choice', proves: /kind:\s*'choice'|\bParams\.choice\(/ },
    { says: 'a number knob', proves: /kind:\s*'(?:integer|decimal)'|\bParams\.(?:integer|decimal)\(/ },
    { says: 'a switch', proves: /kind:\s*'toggle'|\bParams\.toggle\(/ },
    { says: 'a histogram', proves: /\.histogram\(/ },
    { says: 'its own band', proves: /\.inItsOwnBand\(/ },
    { says: 'over the price', proves: /\.overThePrice\(/ },
    { says: 'shading between', proves: /\.shading\(|\bbands\s*:/ },
    { says: 'says when it has not settled', proves: /\.converged\(/ },
    { says: 'NaN where there is no answer', proves: /Number\.NaN|\bNaN\b/ },
    { says: 'two languages', proves: /\binWords\(/ },
    { says: 'the taker split', proves: /\bbuyVolume\b/ },
];

/** The opening prose of a doc block, as one line, stopping before any tag. */
const DOC_BLOCK = /\/\*\*\s*\n\s*\*\s+([^\n]+(?:\n\s*\*\s+(?!@)[^\n]+)*)/;

/**
 * The same, but only the block the default export itself carries.
 *
 * The tail forbids a `*&#47;` of its own, so the block has to be the one that
 * closes immediately before the export rather than any earlier one with the
 * export somewhere after it.
 */
const DOC_ON_EXPORT = new RegExp(
    `${DOC_BLOCK.source}(?:(?!\\*\\/)[\\s\\S])*\\*\\/\\s*export default`,
);

/**
 * What an addon is, in its own opening words.
 *
 * A leading line comment first, because that is the shortest thing an author
 * can write and the two oldest addons here use it. Then the block the default
 * export carries — the first block in the file belongs to whatever is declared
 * first, and an addon that documents a constant before its class was being
 * described on the page by that constant.
 *
 * @param source - The entry file, as written.
 * @returns The sentence, or empty where the file opens with none of them.
 */
export function aboutOf(source: string): string {
    const asLine = /^\/\/ (.+)$/m.exec(source);
    if (asLine !== null) {
        return asLine[1]!.trim();
    }

    const found = DOC_ON_EXPORT.exec(source) ?? DOC_BLOCK.exec(source);
    if (found === null) {
        return '';
    }

    const run = found[1]!.replaceAll(/\n\s*\*\s+/g, ' ').trim();
    return /^(.+?\.)(?:\s|$)/.exec(run)?.[1] ?? run;
}

/**
 * The techniques an addon's own source shows.
 *
 * @param files - Every file of the addon, in any order.
 * @returns What it demonstrates, in the order the signals are declared.
 */
export function teachesIn(files: readonly string[]): readonly string[] {
    const whole = files.join('\n');
    const found = SIGNALS.filter((signal) => signal.proves.test(whole)).map((signal) => signal.says);

    return files.length > 1 ? [`across ${String(files.length)} files`, ...found] : found;
}
