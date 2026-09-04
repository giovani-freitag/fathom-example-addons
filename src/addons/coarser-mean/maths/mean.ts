/**
 * The exponential mean over a run of figures.
 *
 * Seeded on the first figure rather than on an average of the first `period`.
 * Either converges to the same line; seeding on the first means the run can be
 * shorter than the period and still produce something, which is what lets the
 * reading say it has not settled instead of drawing nothing at all.
 *
 * @param over - The figures, oldest first.
 * @param period - How many the mean is weighted across.
 * @returns One mean per figure, same length and order.
 */
export function exponentialMean(over: readonly number[], period: number): number[] {
    const weight = 2 / (period + 1);
    const means: number[] = [];
    let held = Number.NaN;

    for (const value of over) {
        held = Number.isNaN(held) ? value : value * weight + held * (1 - weight);
        means.push(held);
    }

    return means;
}

/**
 * A figure computed over the coarser rung, held at each drawn bar.
 *
 * This is the forward fill: a drawn bar shows what the newest closed session
 * knew, and keeps showing it until the next one closes. A step, not a slope —
 * the coarser mean did not move between closes, and drawing it sloped would
 * claim it did.
 *
 * @param indexPerBar - Where in the run each drawn bar sits, -1 before the first.
 * @param overClosed - The figure, one per closed session.
 * @returns One figure per drawn bar, NaN before anything had settled.
 */
export function heldPerBar(
    indexPerBar: Int32Array,
    overClosed: readonly number[],
): number[] {
    return [...indexPerBar].map((at) => (at < 0 ? Number.NaN : overClosed[at] ?? Number.NaN));
}
