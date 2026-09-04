import { describe, expect, it } from 'vitest';
import { leanOf, rollingMean } from '../../src/addons/pressure/maths/pressure.ts';
import type { PriceBar } from 'fathom';

/** A bar with only the two figures the lean is made of. */
function barWith(buyVolume: number, sellVolume: number): PriceBar {
    return { buyVolume, sellVolume } as PriceBar;
}

describe('how one-sided a bar was', () => {
    it('is 1 where every trade lifted the offer', () => {
        expect(leanOf(barWith(10, 0))).toBe(1);
    });

    it('is -1 where every trade hit the bid', () => {
        expect(leanOf(barWith(0, 10))).toBe(-1);
    });

    it('is 0 for an even bar', () => {
        expect(leanOf(barWith(5, 5))).toBe(0);
    });

    it('is 0 where nothing traded, rather than NaN', () => {
        // A bucket the book was recorded through with nobody trading is a quiet
        // bucket, not a missing one — and NaN would break the line at it.
        expect(leanOf(barWith(0, 0))).toBe(0);
    });

    it('is the same for a quiet bar and a busy one that leaned the same way', () => {
        // The whole reason it is normalised: raw delta says more about how much
        // traded than about which way it leaned.
        expect(leanOf(barWith(3, 1))).toBe(leanOf(barWith(300, 100)));
    });
});

describe('the mean of the last few', () => {
    it('averages exactly the window it was asked for', () => {
        expect(rollingMean([1, 2, 3, 4], 2)).toEqual([Number.NaN, 1.5, 2.5, 3.5]);
    });

    it('answers NaN until there are enough bars, rather than averaging fewer', () => {
        // A line that starts with a three-bar average where twenty were asked
        // for is a different reading, drawn as though it were this one.
        expect(rollingMean([1, 2, 3], 3).slice(0, 2)).toEqual([Number.NaN, Number.NaN]);
    });

    it('holds one value per bar, which is what the chart requires', () => {
        expect(rollingMean([1, 2, 3, 4, 5], 3)).toHaveLength(5);
    });
});
