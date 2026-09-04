/**
 * Where Fathom generates the surface a reading is written against.
 *
 * One constant, because two scripts read it and both have to agree: the check
 * that says the vendored copy is current, and the refresh that makes it so.
 */

/**
 * The ref to read it at.
 *
 * The feature branch until the in-page editor is on `main`; change this one word
 * when it lands. Replace all of it with `npm i -D @giovani-freitag/fathom` once
 * that types-only package is published, and the package manager does this job.
 */
const REF = 'feat/addon-editor';

export const SURFACE_AT =
    `https://raw.githubusercontent.com/giovani-freitag/fathom/${REF}/packages/types/fathom.d.ts`;

/**
 * Fetches it.
 *
 * @returns The declarations Fathom currently offers.
 * @throws Error when it could not be read, rather than leaving a caller to
 *     compare against nothing.
 */
export async function readSurface(): Promise<string> {
    const answer = await fetch(SURFACE_AT);
    if (!answer.ok) {
        throw new Error(`Could not read Fathom's surface (${answer.status}).`);
    }
    return answer.text();
}
