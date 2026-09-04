import { describe, expect, it } from 'vitest';
import { exponentialMean, heldPerBar } from '../../src/addons/coarser-mean/maths/mean.ts';
import { shadedUnder } from '../../src/addons/coarser-mean/maths/shading.ts';

describe('the exponential mean over a run', () => {
    it('starts on the first figure, so a short run still says something', () => {
        expect(exponentialMean([10, 10, 10], 2)).toEqual([10, 10, 10]);
    });

    it('weights the recent more heavily than the old', () => {
        const [, second] = exponentialMean([0, 10], 3);

        expect(second).toBeCloseTo(5, 10);
    });

    it('moves less on a long period than on a short one', () => {
        const slow = exponentialMean([0, 100], 100).at(-1)!;
        const quick = exponentialMean([0, 100], 4).at(-1)!;

        expect(slow).toBeLessThan(quick);
    });

    it('gives one mean per figure, in the order they came', () => {
        expect(exponentialMean([1, 2, 3, 4, 5], 3)).toHaveLength(5);
    });

    it('has nothing to say about an empty run', () => {
        expect(exponentialMean([], 50)).toEqual([]);
    });
});

describe('holding a coarser figure at each drawn bar', () => {
    it('repeats the figure until the next session closes', () => {
        // The forward fill, and the reason it is a step: the coarser mean did
        // not move between closes, so a bar drawn part way through the session
        // shows what the last close settled on and nothing newer.
        expect(heldPerBar(new Int32Array([0, 0, 0, 1, 1]), [10, 20])).toEqual([10, 10, 10, 20, 20]);
    });

    it('is NaN before the first session had closed', () => {
        // Not the first mean: a line drawn back to the left edge claims the
        // mean was known there, and it was not.
        expect(heldPerBar(new Int32Array([-1, -1, 0]), [10])).toEqual([Number.NaN, Number.NaN, 10]);
    });

    it('is NaN where the run is shorter than the index reaches', () => {
        expect(heldPerBar(new Int32Array([0, 5]), [10])).toEqual([10, Number.NaN]);
    });

    it('gives one figure per drawn bar', () => {
        expect(heldPerBar(new Int32Array(7).fill(0), [1])).toHaveLength(7);
    });
});

describe('which pair of lines the shading fills', () => {
    it('reaches the low line for the whole spread', () => {
        expect(shadedUnder('high-low')).toBe(2);
    });

    it('reaches only the close line for the upper half', () => {
        // The two are different readings of "the zone", and picking one for the
        // reader was a guess about what they were looking at.
        expect(shadedUnder('high-close')).toBe(1);
    });

    it('fills nothing when it is off', () => {
        expect(shadedUnder('none')).toBeNull();
    });

    it('fills nothing for a value no control could produce', () => {
        // A setting outlives the control that wrote it, so a value from an
        // older version has to land somewhere safe rather than shade a series
        // the plan does not have.
        expect(shadedUnder('everything')).toBeNull();
    });
});
