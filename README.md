<h1 align="center">Fathom readings</h1>

<p align="center">
  <strong>Indicators you write in the page, not plugins you install.</strong><br>
  A <em>reading</em> is a TypeScript file that draws on
  <a href="https://github.com/giovani-freitag/fathom">Fathom</a>'s chart. It
  compiles as you type, redraws on every bar, and never leaves your browser.
  These are worked examples of the real thing.
</p>

<p align="center">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178c6">
  ·
  <img alt="License" src="https://img.shields.io/badge/license-MIT-2bd4a8">
  ·
  <img alt="Vite" src="https://img.shields.io/badge/Vite-rolldown-a259ff">
  ·
  <img alt="Checked" src="https://github.com/giovani-freitag/fathom-readings/actions/workflows/check.yml/badge.svg">
</p>

<p align="center">
  <strong>Open one in Fathom — press <em>Write a reading</em>, then the cloud button, and paste:</strong><br>
  <code>gh/giovani-freitag/fathom-readings/readings/pressure</code>
</p>

<p align="center">
  <a href="https://giovani-freitag.github.io/fathom-readings/"><strong>Or browse them all →</strong></a><br>
  <sub>Every file, as it is committed.</sub>
</p>

<p align="center">
  <img src="docs/screenshot.png" alt="A reading drawing on the Fathom chart, its source in the editor beside it" width="100%">
</p>

Fathom shows you every file and where it came from before it fetches any of it.
What arrives is a draft, marked unsaved — nothing is filed until you file it.

## 📖 The readings

### 🌡️ [`pressure`](readings/pressure) — buying against selling, bar by bar

Normalised delta: `(buy − sell) ÷ (buy + sell)`, so a quiet hour and a busy one
are comparable. Split rising and falling about zero, in its own band under the
chart — the green and red strip in the shot above.

**Shows you:** a reading across two files · a numeric knob and a switch · warm-up
bars declared and fetched · `NaN` to break a line honestly · its own band.

### 🕰️ [`yesterday`](readings/yesterday) — where the last session opened, closed and turned

Four levels from the previous day or week, drawn over the price with the range
shaded between them.

**Shows you:** a coarser session declared and read back · the alignment that
makes repainting impossible · a choice parameter · shading between two series ·
saying you have nothing to draw yet.

## 🚀 Open one

Three ways in, easiest first:

| | |
|---|---|
| **From here** | Paste `gh/giovani-freitag/fathom-readings/readings/pressure` into the cloud button. An address copied out of GitHub works too. |
| **From a file** | Grab a `.fathom.json` from a [release](https://github.com/giovani-freitag/fathom-readings/releases) and use the open button. |
| **By hand** | Open [`main.ts`](readings/pressure/main.ts), copy it, paste it in. Every reading here is one folder and no build step. |

Every one is heavily commented. They are meant to be read, taken apart, and
turned into something of your own.

## 🔍 How they are checked

The point of this repository is that nothing in it is a snippet that used to
work.

```bash
npm install
npm run check    # typecheck, lint, test
```

`npm run typecheck` runs `tsc` over the readings against **Fathom's real type
surface** — the same declarations its in-page editor compiles against, generated
straight out of its source. A reading here does not merely look right; it
compiles against the thing that will run it. CI runs this on every push.

`npm run test` covers the arithmetic that has a right answer. `npm run lint`
holds the readings to the same bar as the rest — this is code somebody reads to
learn from.

## 🛠️ Working on these

```bash
npm run dev      # browse the readings, source and all
npm run build    # bundles into dist/bundles, the browse page into dist
```

Node 22 or newer. `build:bundles` runs TypeScript directly, with no build step
of its own.

**What is built, and what is not.** The readings are not compiled here. A
reading is TypeScript that Fathom's own in-page compiler reads, so shipping
JavaScript would produce something the editor could not show and nobody could
learn from. The build produces `dist/bundles/*.fathom.json` — every file of a
reading under one envelope, so one can be handed over as a single file — and the
page that browses them, bundled by Vite 8, which bundles with Rolldown.

## ✏️ Writing your own

Start from
[**Writing a reading**](https://github.com/giovani-freitag/fathom/blob/main/docs/writing-a-reading.md)
— from the smallest reading that works to the parts you reach for last.

The whole of it in four lines:

- A reading starts at `main.ts`, and its default export is the reading.
- It imports from `'fathom'` and from its own files, and from nothing else.
  **There is no npm inside a reading.**
- `compute` is arithmetic and nothing else — no fetching, no timers, nothing
  remembered between calls. It runs again on every bar, pan and zoom.
- Anything the chart must fetch for you is declared in `resolveSources`.

The smallest one that draws:

```ts
import { Plot } from 'fathom';
import type { Indicator, IndicatorInput, PlanDraft } from 'fathom';

export default class Midpoint implements Indicator {
    readonly label = 'Midpoint';
    readonly parameters = [];

    compute(input: IndicatorInput): PlanDraft {
        const middle = input.bars.bars.map((bar) => (bar.highPrice + bar.lowPrice) / 2);

        return Plot.over(input.bars).line(middle, 'Midpoint').overThePrice();
    }
}
```

Pull requests welcome, as long as `npm run check` passes and the reading teaches
something these do not.

## 📄 Licence

MIT. Take these apart.
