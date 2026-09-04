# Fathom readings

Worked examples of indicators written for [Fathom](https://github.com/giovani-freitag/fathom)
— readings a reader writes in the page itself, against the `fathom` surface the
editor compiles them with.

Each folder under `readings/` is one whole reading, ready to open.

| | |
|---|---|
| [`readings/pressure`](readings/pressure) | Buying against selling, bar by bar. Two files, a numeric parameter, a toggle, its own band under the chart. |
| [`readings/yesterday`](readings/yesterday) | Where the previous session opened, closed and turned. A coarser rung declared and read back, shading between two lines, drawn over the price. |

## Opening one

In Fathom, press **Write a reading**, then the cloud button (**Bring one in**),
and give it the folder:

```text
gh/giovani-freitag/fathom-readings/readings/pressure
gh/giovani-freitag/fathom-readings/readings/yesterday
```

It shows you every file and where it came from before any of it is fetched.
What arrives is a draft — nothing is saved until you save it.

You can also copy the address of a folder out of GitHub and paste that.

## Writing your own

Start from the guide:
[Writing an indicator](https://github.com/giovani-freitag/fathom/blob/main/docs/indicator-cookbook.md).

The short of it:

- A reading starts at `main.ts`, and its default export is the reading.
- It imports from `'fathom'` and from its own files, and from nothing else.
  There is no npm here.
- `compute` is arithmetic and nothing else — no fetching, no timers, no
  globals. It runs again on every bar, pan and zoom.
- Anything the chart has to fetch for you is declared in `resolveSources`.

## Licence

MIT. Take these apart.
