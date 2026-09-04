/**
 * What the page is handed about each addon.
 *
 * Beside the page rather than in the build script that fills it: this is the
 * shape the page reads, and the script is one of the things that could produce
 * it.
 */

export interface ShownFile {
    readonly path: string;
    /** The source as markup, already coloured. */
    readonly html: string;
    readonly lineCount: number;
}

export interface ShownAddon {
    readonly name: string;
    readonly about: string;
    /** What it shows how to do, read off its own source. */
    readonly teaches: readonly string[];
    /** Entry file first, then the rest by path. */
    readonly files: readonly ShownFile[];
}
