# Fathom readings

Worked example indicators for [Fathom](https://github.com/giovani-freitag/fathom)
— **readings**, written in the page itself against the surface its in-page
editor compiles them with.

Each folder under `readings/` is one whole reading. They are checked against
Fathom's real type surface on every push, so nothing here is a snippet that used
to work.

| Reading | What it shows |
|---|---|
| [`pressure`](readings/pressure) | Buying against selling, bar by bar. Two files, a numeric knob, a switch, its own band under the chart. |
| [`yesterday`](readings/yesterday) | Where the previous session opened, closed and turned. A coarser rung declared and read back, shading between two lines, drawn over the price. |

## Opening one

In Fathom, press **Write a reading**, then the cloud button, and give it a
folder:

```text
gh/giovani-freitag/fathom-readings/readings/pressure
gh/giovani-freitag/fathom-readings/readings/yesterday
```

An address copied out of GitHub works too. Fathom shows you every file and where
it came from before any of it is fetched. What arrives is a draft, marked
unsaved — nothing is filed until you file it.

You can also open a `.fathom.json` from `dist/bundles/` with the editor's open
button, which is the same reading in one file.

## Working on these

```bash
npm install
npm run dev      # browse the readings at localhost
npm run check    # typecheck, lint, test
npm run build    # bundles into dist/bundles, page into dist
```

**Node 22 or newer.** `npm run build:bundles` runs TypeScript directly, with no
build step of its own.

### What is built, and what is not

The readings themselves are **not** compiled here. A reading is TypeScript that
Fathom's own in-page compiler reads, so shipping JavaScript would produce
something the editor could not show and nobody could learn from.

What the build does produce:

- `dist/bundles/*.fathom.json` — every file of a reading under one envelope, so
  one can be handed over as a single file.
- `dist/` — the page that browses them, bundled by Vite 8 (which bundles with
  Rolldown).

### How they are checked

`npm run typecheck` runs `tsc` over the readings against
[`types/fathom.d.ts`](types/fathom.d.ts) — the *actual* surface, generated out
of Fathom's own source. That is what makes a reading here trustworthy: it does
not merely look right, it compiles against the same declarations the editor
uses.

To refresh the types after Fathom's surface changes, with the two repositories
side by side:

```bash
npm run types:refresh
```

`npm run lint` holds the readings to the same bar as the rest — these are code
somebody reads to learn from. `npm run test` covers the arithmetic that is worth
covering: pure functions with a right answer.

## Writing your own

Start from
[Writing a reading](https://github.com/giovani-freitag/fathom/blob/main/docs/writing-a-reading.md),
the guide that goes from the smallest reading that works to the parts you reach
for last.

The short of it:

- A reading starts at `main.ts`, and its default export is the reading.
- It imports from `'fathom'` and from its own files, and from nothing else.
  **There is no npm inside a reading.**
- `compute` is arithmetic and nothing else — no fetching, no timers, no state
  between calls. It runs again on every bar, pan and zoom.
- Anything the chart has to fetch for you is declared in `resolveSources`.

Pull requests welcome, as long as `npm run check` passes and the reading teaches
something the two here do not.

## Licence

MIT. Take these apart.
