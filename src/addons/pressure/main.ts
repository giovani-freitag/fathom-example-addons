// Pressure — how one-sided the trading in each bar was.
//
// A worked example of a reading written across more than one file. The
// arithmetic lives in ./maths/pressure.ts; this file says what the chart draws
// and what the reader can turn.

import { inWords, Params, Plot, readSetting, readToggle } from 'fathom';
import type { Indicator, IndicatorInput, IndicatorSettings, PlanDraft, SourceRequest } from 'fathom';
import { leanOf, rollingMean } from './maths/pressure.js';

// Every parameter is built once, outside the class. The object it produces is
// what the chart shows in the layer's settings and what `readSetting` reads
// back — the same object both times, which is how the two stay in step.
const PERIOD = Params.integer('periodBars')
    .called(inWords({ en: 'Bars averaged', 'pt-BR': 'Barras na média' }))
    .between(1, 200)
    .startingAt(14);

// A toggle is a parameter like any other; `startingAt(false)` starts it off.
const SMOOTHED = Params.toggle('isSmoothed')
    .called(inWords({ en: 'Smooth it', 'pt-BR': 'Suavizar' }))
    .startingAt(true);

export default class Pressure implements Indicator {
    // What the chart calls this, in the legend and in the layer list. `inWords`
    // answers in whichever language the page is set to, falling back to English.
    readonly label = inWords({ en: 'Pressure', 'pt-BR': 'Pressão' });

    // One line, shown under the name where a reader picks a layer to add.
    readonly about = inWords({
        en: 'Buying against selling, bar by bar',
        'pt-BR': 'Compra contra venda, barra a barra',
    });

    readonly parameters = [PERIOD, SMOOTHED];

    /**
     * Everything besides the drawn bars this reads, for the chart to fetch.
     *
     * A mean over fourteen bars needs thirteen bars of history before the first
     * drawn one, or the left edge of the chart is blank where it need not be.
     * Ask for them here and the chart fetches them; they arrive as part of
     * `input.bars` and the drawn window starts where it always did.
     */
    resolveSources(settings: IndicatorSettings): SourceRequest {
        return { warmupBars: readSetting(settings, PERIOD) };
    }

    /**
     * Turns the bars into what the chart should draw.
     *
     * Called again on every new bar, every pan and every zoom — so it stays
     * arithmetic and nothing else. No fetching, no timers, no globals.
     */
    compute(input: IndicatorInput): PlanDraft {
        const bars = input.bars.bars;
        const periodBars = readSetting(input.settings, PERIOD);
        const isSmoothed = readToggle(input.settings, SMOOTHED);

        const lean = bars.map(leanOf);
        const value = isSmoothed ? rollingMean(lean, periodBars) : lean;

        // Uncomment to watch what actually arrives. It prints to the Console
        // below the editor, not to the browser's own — and because this runs on
        // every redraw, a line printed here arrives constantly. The panel
        // collapses a repeat into a count.
        // console.log('bars', bars.length, 'first', bars[0]);

        return Plot.over(input.bars)
            .histogram(value, this.label)
            // Bars above the line in one colour and below it in another. The
            // baseline defaults to zero, which is what a normalised lean is
            // measured against.
            .risingAndFalling()
            // Its own band under the chart, scaled to what the values actually
            // reach. `.between(-1, 1)` would pin it instead; `.overThePrice()`
            // would draw it on the price itself, which this is not in.
            .aboutZero();
    }
}
