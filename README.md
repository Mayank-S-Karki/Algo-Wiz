# ALGO-WIZ v2

An interactive algorithm visualizer. Every algorithm is recorded step by step, so you can play, pause,
step back and forward, scrub, and change speed, while a plain-English sentence and highlighted
pseudocode explain each move.

Built by Mayank Karki, Nitin Kandpal, and Swarit Kumar. MIT license.

## What is in Phase 1

| Family | Algorithms |
|---|---|
| Sorting (16) | Bubble, selection, insertion, merge, quick, heap, shell, counting, radix, bucket, cocktail shaker, comb, gnome, cycle, tim (simplified), bogo |
| Searching (8) | Linear, binary, jump, exponential, interpolation, ternary, Fibonacci, sentinel |
| Linked lists (30) | Singly, doubly, and circular lists, each with traverse, search, insert (head, tail, position), delete (head, tail, position), reverse, and find middle |

Graphs and pathfinding, trees and heaps, dynamic programming and strings, and backtracking and classics
are planned for later phases (see `docs/superpowers/specs/`).

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest: algorithms, contract, and UI tests
npm run typecheck  # strict TypeScript
npm run build      # static site in dist/
```

## Shortcuts

| Key | Action |
|---|---|
| Space | Play or pause |
| Left / Right | Step back or forward |
| Home / End | Jump to start or end |
| `[` and `]` | Halve or double the speed |
| T | Switch light and dark theme |
| / | Focus the algorithm search |

The URL hash stores the algorithm, your data, and the current step, so any state can be shared.

## How it works

Each algorithm is a pure function `run(input) -> Step[]`. A `Step` holds a full state snapshot, highlight
marks, the active pseudocode line, a one-sentence explanation, and running counters. Because the whole run
is recorded first, the player only moves an index, which makes stepping backward and scrubbing free.

```
src/core/         Step contract, registry, tracers, player math, URL state
src/algorithms/   One file per algorithm, grouped by family
src/views/        Renderers (bars, linked list) and the legend
src/ui/           App shell: sidebar, inputs, player dock, panels, landing page
tests/            Algorithm correctness, registry contract, and UI tests
```

## Add an algorithm

1. Create a file in the family folder that exports a definition, for example with `defineSort({...})`.
   Record steps with `Tracer` (arrays) or `SearchTracer` (searches).
2. Add it to that family's `index.ts` array.
3. Run `npm test`. The registry contract test checks that every step has an explanation, a valid
   pseudocode line, and non-decreasing stats.

## Deploy

It is a static site. On Render, `render.yaml` at the repository root creates a static site from
`algo-wiz-v2/`. On Vercel, set the root directory to `algo-wiz-v2` (`vercel.json` supplies the rest).
