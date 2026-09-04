import { inWords, Plot, readChoice, readSetting, readSessions } from 'fathom';
import type {
    ChoiceParameter,
    Indicator,
    IndicatorInput,
    IndicatorSettings,
    NumericParameter,
    PlanDraft,
    PriceBar,
    SourceRequest,
} from 'fathom';
import { exponentialMean, heldPerBar } from './maths/mean.js';
import { HIGH, shadedUnder, SHADINGS } from './maths/shading.js';

/**
 * The rungs a venue publishes candles on, by what the control calls them.
 *
 * A rung finer than the one being drawn is allowed and useless: its mean would
 * be the drawn bars' own, arrived at the long way round. The list is what the
 * venue publishes, and choosing sensibly from it is the reader's.
 *
 * No monthly: this is keyed by a width in milliseconds, and a month has no
 * fixed one. A calendar month needs a rung anchored to the calendar rather
 * than to a width, which the surface does not offer.
 */
const RUNGS: Readonly<Record<string, number>> = {
    '1m': 60_000,
    '5m': 300_000,
    '15m': 900_000,
    '30m': 1_800_000,
    '1h': 3_600_000,
    '2h': 7_200_000,
    '4h': 14_400_000,
    '1d': 86_400_000,
    '1w': 604_800_000,
};

const RUNG: ChoiceParameter = {
    name: 'rung',
    label: 'Timeframe',
    kind: 'choice',
    defaultValue: '1h',
    choices: Object.keys(RUNGS),
};

const PERIOD: NumericParameter = {
    name: 'period',
    label: 'Period',
    kind: 'integer',
    defaultValue: 50,
    minimum: 2,
    maximum: 200,
};

/*
 * Which pair of lines the shading fills, if any.
 *
 * Plain values, because a choice stores the value itself and one that changed
 * with the language would lose the reader's setting. `high-low` fills the whole
 * spread and `high-close` only its upper half — which of the two reads as "the
 * zone" depends on what the reader is looking for, so both are offered rather
 * than one of them guessed at.
 */
const SHADE: ChoiceParameter = {
    name: 'shade',
    label: 'Shading',
    kind: 'choice',
    defaultValue: SHADINGS[0],
    choices: SHADINGS,
};

/** The name the rung is declared and read back under. */
const HELD = 'coarser';


/**
 * How much of the rung to fetch, as a multiple of the period.
 *
 * Eight, so a fifty-period mean is handed four hundred closes and has long
 * settled before the first drawn bar. The reach costs one request per rung
 * whatever the figure, and the host caps it, so there is nothing to save by
 * asking for less.
 */
const REACH_MULTIPLE = 8;

/**
 * The mean of a coarser rung's close, high and low, drawn over any rung.
 *
 * The whole of it is the two lines in `resolveSources`: the rung is declared,
 * the host fetches it, and `compute` is handed every session that had settled
 * plus where each drawn bar sits among them. Nothing is remembered between
 * calls, nothing is fetched here, and the figure a bar shows cannot change
 * after that bar closed — a mean built from closed sessions and held to the
 * newest one each bar knew about is a mean that cannot repaint.
 *
 * Add a copy per timeframe: each keeps its own rung and period.
 */
export default class CoarserMean implements Indicator {
    readonly label = inWords({ en: 'Coarser mean', 'pt-BR': 'Média de outro tempo' });
    readonly parameters = [RUNG, PERIOD, SHADE];

    resolveSources(settings: IndicatorSettings): SourceRequest {
        const period = readSetting(settings, PERIOD);

        return {
            sessions: {
                [HELD]: {
                    intervalMs: RUNGS[readChoice(settings, RUNG)] ?? RUNGS['1h']!,
                    reachingBack: period * REACH_MULTIPLE,
                },
            },
        };
    }

    compute(input: IndicatorInput): PlanDraft {
        const period = readSetting(input.settings, PERIOD);
        const held = readSessions(input, HELD);
        const meanOf = (figure: (bar: PriceBar) => number): number[] => (
            heldPerBar(held.indexPerBar, exponentialMean(held.closed.map(figure), period))
        );

        const plan = Plot.over(input.bars)
            .line(meanOf((bar) => bar.highPrice), 'High')
            .line(meanOf((bar) => bar.closePrice), 'Close')
            .line(meanOf((bar) => bar.lowPrice), 'Low');

        // Left to take the upper line's tone rather than given one: a reader
        // with a copy per timeframe tells them apart by colour, and a shading
        // in some other colour would break the one thing holding a set together.
        const under = shadedUnder(readChoice(input.settings, SHADE));
        if (under !== null) {
            plan.shading(HIGH, under);
        }

        return plan
            .summarisedAs(`${String(period)}, ${readChoice(input.settings, RUNG)}`)
            // A mean weighted across more closes than it was given has not
            // settled on anything. Said rather than drawn plain: a line that
            // will move as the fetch reaches further is not a level, and a
            // reader taking one off it would be reading a number nobody has.
            .converged(held.closed.length >= period)
            .overThePrice();
    }
}

