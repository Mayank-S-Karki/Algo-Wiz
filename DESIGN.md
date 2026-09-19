# Design

The visual system, recorded from the shipped app.

## World
Graph-paper studio. The stage is a sheet of graph paper on which every algorithm is drawn; the chrome around it is calm so the data carries the color.

## Color
OKLCH tokens in `src/styles/tokens.css`, two themes (cool paper light, deep ink dark; the first visit follows the system setting).
- **Chrome** is tinted by the algorithm's family through one hue variable (`--h`): sorting 262, searching 236, linked lists 340, graphs 300, trees 145, DP 58, strings 15, classics 190, race 25. Elements with class `hued` and an inline `--h` recompute the family tokens for themselves (sidebar groups, landing tiles, palette rows).
- **Data** uses fixed mark colors that carry meaning and never change with the family: compare (amber), move (coral), found (green), sorted, pivot (violet), insert (teal), remove (red), frontier, visited, path.
- Tints are mixed with `color-mix(in oklab, ...)` so hues do not drift.

## Type
Bricolage Grotesque (display: headlines, node labels, big numbers), Geist (interface), Geist Mono (data, code, indexes). All self-hosted through Fontsource.

## Shape and depth
Controls 10px radius, panels 18px, chips and buttons pill. Shadows have an offset and a soft blur. No glow.

## Motion
One authored moment: the landing hero settles in. Everything else is functional feedback (bar heights, mark colors, the explanation sentence swapping). All motion stops under `prefers-reduced-motion`.

## Components
Player dock (sticky), tabbed panels (Explain, Code, Theory, Stats with growth chart, History), input form generated from each algorithm's field list, command palette, race grid, landing tiles that run the real engine.
