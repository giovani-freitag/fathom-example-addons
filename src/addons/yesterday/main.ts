// Yesterday — where the previous session opened, closed and turned.
//
// A worked example of a reading that needs a coarser rung than the one it is
// drawn on. Declare the session and the chart fetches it, aligns it to the
// drawn bars, and holds each bar to the session that had actually closed by the
// time that bar opened. No index reaches a day a drawn bar could not have seen.

import { inWords, Params, Plot, readChoice, readSessions } from 'fathom';
import type { Indicator, IndicatorInput, IndicatorSettings, PlanDraft, SourceRequest } from 'fathom';

const DAY_MS = 24 * 60 * 60 * 1000;

// A choice parameter takes plain values. What the settings panel shows is the
// value itself, so keep it readable — and keep it stable: it is what gets
// stored, and a value that changed with the language would lose the setting.
const RUNG = Params.choice('rung', ['Day', 'Week'])
    .called(inWords({ en: 'Session', 'pt-BR': 'Sessão' }))
    .startingAt('Day');

/** How wide the chosen session is, in milliseconds. */
function widthOf(rung: string): number {
    return rung === 'Week' ? 7 * DAY_MS : DAY_MS;
}

export default class Yesterday implements Indicator {
    readonly label = inWords({ en: 'Last session', 'pt-BR': 'Sessão anterior' });

    readonly about = inWords({
        en: 'Where the session before this one opened, closed and turned',
        'pt-BR': 'Onde a sessão anterior abriu, fechou e virou',
    });

    readonly parameters = [RUNG];

    /**
     * The session this reads, under a name of its own choosing.
     *
     * `reachingBack: 1` means one settled session before the window opens —
     * enough for the very first drawn bar to have a previous day rather than a
     * gap. Reaching for a name that was never declared throws and says which
     * names were, rather than handing back something empty.
     */
    resolveSources(settings: IndicatorSettings): SourceRequest {
        return {
            sessions: {
                previous: { intervalMs: widthOf(readChoice(settings, RUNG)), reachingBack: 1 },
            },
        };
    }

    compute(input: IndicatorInput): PlanDraft {
        const previous = readSessions(input, 'previous');
        const bars = input.bars.bars;

        // One value per drawn bar, taken from the session that bar could see.
        // NaN where nothing had settled yet, which breaks the line at the left
        // edge rather than drawing a flat run back to the first known value.
        const at = (index: number, of: 'openPrice' | 'closePrice' | 'highPrice' | 'lowPrice'): number =>
            previous.perBar[index]?.[of] ?? Number.NaN;

        return Plot.over(input.bars)
            .lines({
                Open: bars.map((_bar, index) => at(index, 'openPrice')),
                Close: bars.map((_bar, index) => at(index, 'closePrice')),
                High: bars.map((_bar, index) => at(index, 'highPrice')),
                Low: bars.map((_bar, index) => at(index, 'lowPrice')),
            })
            // Each line labelled where it ends. Four levels say "some above and
            // some below" unless the reader can see which is which.
            .namingEachLine()
            // Shades between two of the series just added, by the order they
            // were added in: 2 is High and 3 is Low, so this fills the range.
            .shading(2, 3, 'amber')
            // Says the reading has nothing to draw yet rather than drawing
            // blank and letting the reader wonder. The legend shows it.
            .converged(previous.hasAny)
            .overThePrice();
    }
}
