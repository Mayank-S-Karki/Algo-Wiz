/**
 * Step recorders. Algorithms call these helpers instead of building `Step` objects by hand,
 * which keeps counters, snapshots, and explanations consistent across the whole catalogue.
 */
import type { ArrayState, Mark, SearchState, Step } from './step';

/** Records the run of an in-place array algorithm (sorting). */
export class Tracer {
  /** Recorded steps, in order. */
  readonly steps: Step<ArrayState>[] = [];
  /** Live working array; algorithms may read it directly and mutate it via the helpers. */
  readonly a: number[];
  private stats = { comparisons: 0, swaps: 0, writes: 0 };

  /**
   * Starts a recording and pushes the initial "start" step.
   * @param input - array to sort; copied, never mutated
   * @param startLine - pseudocode line for the first step
   */
  constructor(input: number[], startLine: number | null = 0) {
    this.a = [...input];
    this.snap([], startLine, `Start with ${this.a.length} element${this.a.length === 1 ? '' : 's'}.`);
  }

  /**
   * Pushes a step with the current array.
   * @param marks - highlights
   * @param line - active pseudocode line
   * @param explain - sentence describing this frame
   */
  snap(marks: Mark[], line: number | null, explain: string): void {
    this.steps.push({ state: { array: [...this.a] }, marks, line, explain, stats: { ...this.stats } });
  }

  /**
   * Records a comparison between two positions.
   * @returns whether a[i] > a[j], for convenience in conditions
   */
  compare(i: number, j: number, line: number | null, extra: Mark[] = []): boolean {
    this.stats.comparisons++;
    this.snap(
      [{ kind: 'compare', index: i }, { kind: 'compare', index: j }, ...extra],
      line,
      `Compare ${this.a[i]} (index ${i}) with ${this.a[j]} (index ${j}).`,
    );
    return this.a[i] > this.a[j];
  }

  /** Swaps two positions and records the swap. */
  swap(i: number, j: number, line: number | null, extra: Mark[] = []): void {
    this.stats.swaps++;
    [this.a[i], this.a[j]] = [this.a[j], this.a[i]];
    this.snap(
      [{ kind: 'swap', index: i }, { kind: 'swap', index: j }, ...extra],
      line,
      `Swap ${this.a[j]} and ${this.a[i]} (indices ${i} and ${j}).`,
    );
  }

  /** Overwrites one position (merge, counting, radix) and records the write. */
  write(i: number, value: number, line: number | null, explain?: string, extra: Mark[] = []): void {
    this.stats.writes++;
    this.a[i] = value;
    this.snap([{ kind: 'swap', index: i }, ...extra], line, explain ?? `Write ${value} to index ${i}.`);
  }

  /**
   * Records a comparison of two values that may no longer sit at their original positions
   * (merge sort compares copies of the halves). Marks show where the values came from.
   * @returns whether x > y
   */
  compareVals(i: number, j: number, x: number, y: number, line: number | null, extra: Mark[] = []): boolean {
    this.stats.comparisons++;
    this.snap([{ kind: 'compare', index: i }, { kind: 'compare', index: j }, ...extra], line, `Compare ${x} with ${y}.`);
    return x > y;
  }

  /**
   * Replaces the whole array in one frame (a radix pass, a bogo shuffle) and counts each changed cell as a write.
   * @param values - new array contents, same length as the current array
   */
  replace(values: number[], line: number | null, explain: string, marks: Mark[] = []): void {
    let changed = 0;
    values.forEach((v, i) => {
      if (this.a[i] !== v) {
        changed++;
        this.a[i] = v;
      }
    });
    this.stats.writes += changed;
    this.snap(marks, line, explain);
  }

  /** Records a free-form step (announcing a pivot, a pass, a phase). */
  note(marks: Mark[], line: number | null, explain: string): void {
    this.snap(marks, line, explain);
  }

  /**
   * Finishes the run: marks every position sorted.
   * @param line - pseudocode line for the final step
   * @returns all recorded steps
   */
  finish(line: number | null = null): Step<ArrayState>[] {
    this.snap(
      this.a.map((_, index) => ({ kind: 'sorted' as const, index })),
      line,
      'Done: the array is sorted.',
    );
    return this.steps;
  }
}

/** Records the run of a search algorithm. */
export class SearchTracer {
  /** Recorded steps, in order. */
  readonly steps: Step<SearchState>[] = [];
  private stats = { comparisons: 0 };

  /**
   * Starts a recording and pushes the initial step.
   * @param array - array being searched (never mutated)
   * @param target - value to find
   */
  constructor(
    private readonly array: number[],
    private readonly target: number,
  ) {
    this.snap([], 0, `Search for ${target} in ${array.length} element${array.length === 1 ? '' : 's'}.`, null);
  }

  /**
   * Pushes a step.
   * @param marks - highlights
   * @param line - active pseudocode line
   * @param explain - sentence describing this frame
   * @param result - final result, or null while running
   */
  snap(marks: Mark[], line: number | null, explain: string, result: number | null = null): void {
    this.steps.push({
      state: { array: this.array, target: this.target, result },
      marks,
      line,
      explain,
      stats: { ...this.stats },
    });
  }

  /**
   * Compares array[index] with the target and records the frame.
   * @returns -1, 0, or 1 as array[index] is less than, equal to, or greater than the target
   */
  probe(index: number, line: number | null, extra: Mark[] = [], label?: string): number {
    this.stats.comparisons++;
    const v = this.array[index];
    const rel = v === this.target ? 'equals' : v < this.target ? 'is less than' : 'is greater than';
    this.snap(
      [...extra, { kind: 'compare', index, label }],
      line,
      `Check index ${index}: ${v} ${rel} target ${this.target}.`,
    );
    return Math.sign(v - this.target);
  }

  /** Finishes with a hit at `index`. */
  found(index: number, line: number | null): Step<SearchState>[] {
    this.snap([{ kind: 'found', index }], line, `Found ${this.target} at index ${index}.`, index);
    return this.steps;
  }

  /** Finishes with a miss. */
  notFound(line: number | null): Step<SearchState>[] {
    this.snap([], line, `${this.target} is not in the array.`, -1);
    return this.steps;
  }
}

/**
 * Builds `range` marks for indices lo..hi (inclusive), used by searches that shrink a window.
 * @param lo - first index of the window
 * @param hi - last index of the window
 * @returns one mark per index in the window
 */
export function rangeMarks(lo: number, hi: number): Mark[] {
  const marks: Mark[] = [];
  for (let i = Math.max(lo, 0); i <= hi; i++) marks.push({ kind: 'range', index: i });
  return marks;
}
