/**
 * Where each series sits in the plan, and what the shading fills.
 *
 * One file because they are one fact: the indices only mean anything against
 * the order the lines are added in, and the shading is asked for by index.
 */

/** The order `compute` adds the three lines in. */
export const HIGH = 0;
export const CLOSE = 1;
export const LOW = 2;

/** What a reader may fill, the first being no fill at all. */
export const SHADINGS = ['none', 'high-low', 'high-close'] as const;

/**
 * Which series the shading reaches down to, or null where it is off.
 *
 * `high-low` fills the whole spread and `high-close` only its upper half.
 * Which of the two reads as "the zone" depends on what the reader is looking
 * for, so both are offered rather than one of them guessed at.
 *
 * @param chosen - What the reader picked.
 * @returns The lower series' index, or null for no shading.
 */
export function shadedUnder(chosen: string): number | null {
    if (chosen === 'high-low') {
        return LOW;
    }

    return chosen === 'high-close' ? CLOSE : null;
}
