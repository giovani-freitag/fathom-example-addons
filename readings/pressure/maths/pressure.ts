import type { PriceBar } from 'fathom';

/**
 * How one-sided the trading in a bar was, from -1 to 1.
 *
 * Normalised on purpose. Raw delta — buys minus sells — is a volume figure, so
 * a quiet hour and a busy one are not comparable and the reading says more
 * about how much traded than about which way it leaned. Dividing by the total
 * asks only the question the name asks.
 *
 * @param bar - The bar to weigh.
 * @returns 1 where every trade lifted the offer, -1 where every trade hit the
 *     bid, 0 for an even bar or one where nothing traded at all.
 */
export function leanOf(bar: PriceBar): number {
    const traded = bar.buyVolume + bar.sellVolume;

    // A bar the book was recorded through with nobody trading is a quiet bar,
    // not a missing one — so it leans neither way rather than being NaN.
    return traded === 0 ? 0 : (bar.buyVolume - bar.sellVolume) / traded;
}

/**
 * The mean of the last `periodBars` values at each index.
 *
 * @param values - One per bar, oldest first.
 * @param periodBars - How many to average over.
 * @returns One per bar. NaN until there are enough bars to answer honestly.
 */
export function rollingMean(values: readonly number[], periodBars: number): number[] {
    return values.map((_value, index) => {
        // NaN rather than a mean of however many bars happen to exist: a line
        // that starts with a three-bar average where twenty were asked for is
        // a different reading, drawn as though it were this one.
        if (index < periodBars - 1) {
            return Number.NaN;
        }

        let total = 0;
        for (let step = 0; step < periodBars; step += 1) {
            total += values[index - step]!;
        }
        return total / periodBars;
    });
}
