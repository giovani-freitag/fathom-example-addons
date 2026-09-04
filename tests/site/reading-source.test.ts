import { describe, expect, it } from 'vitest';
import { aboutOf, teachesIn } from '../../src/site/reading-source.ts';

describe('what an addon says it is', () => {
    it('takes a leading line comment as written', () => {
        expect(aboutOf('// Pressure — how one-sided the trading was.\nimport x;'))
            .toBe('Pressure — how one-sided the trading was.');
    });

    it('falls back to the first sentence of the first doc block', () => {
        // An addon that documents its class rather than its file was left blank
        // on the page, which is the one addon a reader most needs a line about.
        const source = [
            "import { Plot } from 'fathom';",
            '',
            '/**',
            ' * The mean of a coarser rung. Drawn over any other.',
            ' *',
            ' * More prose here.',
            ' */',
            'export default class A {}',
        ].join('\n');

        expect(aboutOf(source)).toBe('The mean of a coarser rung.');
    });

    it('joins a sentence the doc block wrapped across lines', () => {
        const source = '/**\n * A mean of a coarser rung,\n * drawn over this one.\n */';

        expect(aboutOf(source)).toBe('A mean of a coarser rung, drawn over this one.');
    });

    it('prefers the line comment when a file has both', () => {
        expect(aboutOf('// The short one.\n/**\n * The long one.\n */')).toBe('The short one.');
    });

    it('stops before a tag rather than reading it as prose', () => {
        expect(aboutOf('/**\n * What it does.\n *\n * @param bars - The window.\n */'))
            .toBe('What it does.');
    });

    it('takes the block the default export carries, not the first in the file', () => {
        // An addon that documents a constant before its class was described on
        // the page by that constant — the reader was told what a lookup table
        // held, under the addon's name.
        const source = [
            '/**',
            ' * The rungs a venue publishes candles on.',
            ' */',
            'const RUNGS = {};',
            '',
            '/**',
            ' * The mean of a coarser rung, drawn over any other.',
            ' */',
            'export default class A {}',
        ].join('\n');

        expect(aboutOf(source)).toBe('The mean of a coarser rung, drawn over any other.');
    });

    it('falls back to the first block when the export carries none', () => {
        const source = '/**\n * What this file is.\n */\nconst X = 1;\n\nexport default class A {}';

        expect(aboutOf(source)).toBe('What this file is.');
    });

    it('says nothing about a file that opens with neither', () => {
        expect(aboutOf("import { Plot } from 'fathom';\nexport default class A {}")).toBe('');
    });
});

describe('what an addon shows how to do', () => {
    it('names a technique its source actually uses', () => {
        expect(teachesIn(['return Plot.over(bars).histogram(v).inItsOwnBand();']))
            .toEqual(['a histogram', 'its own band']);
    });

    it('says nothing about a technique the source does not use', () => {
        // A chip for something absent sends a reader looking through the file
        // for a thing that is not in it, which is worse than no chip at all.
        expect(teachesIn(['return Plot.over(bars).line(v).overThePrice();']))
            .not.toContain('a histogram');
    });

    it('names a knob built through the helper, not only one written out', () => {
        // The older addons here declare their knobs with `Params.toggle` and
        // friends, and a signal that only knew the written-out `kind:` form
        // said those addons had no knobs at all.
        expect(teachesIn(["const S = Params.toggle('isSmoothed');"])).toContain('a switch');
    });

    it('names the shading by the method that actually draws it', () => {
        // The signal was written against a method name the builder does not
        // have, so the one addon that shades said nothing about it.
        expect(teachesIn(['plan.shading(HIGH, LOW);'])).toContain('shading between');
    });

    it('reads every file, not only the entry', () => {
        expect(teachesIn(['export default class A {}', 'const x = bar.buyVolume;']))
            .toContain('the taker split');
    });

    it('counts the files when there is more than one', () => {
        expect(teachesIn(['a', 'b'])[0]).toBe('across 2 files');
    });

    it('says nothing about the count for a single file', () => {
        expect(teachesIn(['a']).join(' ')).not.toContain('files');
    });

    it('has nothing to say about a file that shows none of them', () => {
        expect(teachesIn(['const x = 1;'])).toEqual([]);
    });
});
