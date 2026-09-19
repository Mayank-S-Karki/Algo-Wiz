/**
 * Core contract shared by every algorithm, renderer, and UI panel.
 *
 * An algorithm is a pure function that records its whole run up front as an array of
 * {@link Step}s. The player then moves an index over that array, so play, pause, step
 * forward, step back, scrub, and speed changes work identically for every algorithm.
 */

/** Algorithm family; decides sidebar grouping. */
export type Family =
  | 'sorting'
  | 'searching'
  | 'linkedlist'
  | 'graph'
  | 'tree'
  | 'dp'
  | 'strings'
  | 'classics';

/** Semantic highlight kinds. Views map each kind to a color, a shape, and a legend entry. */
export type MarkKind =
  | 'compare'
  | 'swap'
  | 'active'
  | 'found'
  | 'sorted'
  | 'pivot'
  | 'range'
  | 'insert'
  | 'delete'
  | 'notfound'
  | 'pointer';

/** A highlight on one index (array position or list node). */
export interface Mark {
  /** What is happening at this index. */
  kind: MarkKind;
  /** Array position or node index the mark applies to. */
  index: number;
  /** Optional short label drawn near the element, e.g. "lo", "mid", "hi". */
  label?: string;
}

/** One frame of an algorithm run. `S` is the family-specific state snapshot. */
export interface Step<S> {
  /** Full snapshot needed to draw this frame. */
  state: S;
  /** Highlights for this frame. */
  marks: Mark[];
  /** Active pseudocode line index, or null when no line applies. */
  line: number | null;
  /** One plain-English sentence describing what just happened. */
  explain: string;
  /** Running counters (comparisons, swaps, ...). Values never decrease across steps. */
  stats: Record<string, number>;
}

/** Which renderer draws this algorithm's state. */
export type ViewKind = 'bars' | 'cells' | 'grid' | 'graph' | 'tree' | 'list' | 'text' | 'hanoi';

/** Asymptotic complexity summary. */
export interface Complexity {
  best: string;
  average: string;
  worst: string;
  space: string;
}

/** Theory text shown in the Theory panel. Every field is optional. */
export interface Theory {
  /** Loop invariant or key property. */
  invariant?: string;
  /** Correctness proof as ordered statements. */
  proof?: string[];
  /** Extra notes: stability, best/worst case, applications. */
  notes?: string[];
}

/** Describes the input controls the UI must offer for an algorithm. */
export interface InputSpec {
  /** `array`: numbers only. `array+target`: numbers plus a search target. `list`: linked-list input. */
  kind: 'array' | 'array+target' | 'list';
  /** Largest allowed input size; keeps step arrays small enough for memory. */
  maxSize: number;
  /** Size used by the "random" generator by default. */
  defaultSize: number;
  /** When true the shell sorts the array before running (binary search and friends). */
  needsSorted?: boolean;
  /** Extra numeric fields the input panel must show (linked lists: `value` and/or `index`). */
  fields?: Array<'value' | 'index'>;
}

/** Definition of one algorithm; exactly one is exported per algorithm file. */
export interface AlgorithmDef<I = unknown, S = unknown> {
  /** Stable slug used in URLs, e.g. "bubble-sort". */
  id: string;
  /** Human-readable name. */
  name: string;
  /** Family used for sidebar grouping. */
  family: Family;
  /** Optional sub-group inside the family, e.g. "Singly linked list". */
  group?: string;
  /** One-sentence description. */
  summary: string;
  /** Asymptotic complexity. */
  complexity: Complexity;
  /** Pseudocode lines; `Step.line` indexes into this array. */
  pseudocode: string[];
  /** Theory content. */
  theory: Theory;
  /** Input controls the UI must offer. */
  input: InputSpec;
  /** Runs the algorithm and records every step. Must be pure and deterministic. */
  run: (input: I) => Step<S>[];
  /** Renderer that draws `Step.state`. */
  view: ViewKind;
}

/** State drawn by {@link ViewKind} `bars` for sorting algorithms. */
export interface ArrayState {
  array: number[];
}

/** State drawn by `bars` for searching algorithms. `result` is set only on the final step. */
export interface SearchState {
  array: number[];
  target: number;
  /** Index of the match, -1 when absent, or null while the search is still running. */
  result: number | null;
}

/** Input to every search algorithm. */
export interface SearchInput {
  array: number[];
  target: number;
}

/** Linked-list kinds. */
export type ListKind = 'singly' | 'doubly' | 'circular';

/** Linked-list operations supported in Phase 1. */
export type ListOp =
  | 'traverse'
  | 'insert_head'
  | 'insert_tail'
  | 'insert_pos'
  | 'delete_head'
  | 'delete_tail'
  | 'delete_pos'
  | 'search'
  | 'reverse'
  | 'middle';

/** State drawn by the `list` view. */
export interface ListState {
  /** Node values in list order. */
  nodes: number[];
  /** Which pointer style to draw. */
  kind: ListKind;
}

/** Input to every linked-list algorithm. */
export interface ListInput {
  list: number[];
  /** Value used by insert and search. */
  value: number;
  /** Position used by positional insert and delete. */
  index: number;
}
