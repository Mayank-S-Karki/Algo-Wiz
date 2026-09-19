/** Bar chart renderer for sorting and array-search steps. */
import type { Mark } from '../core/step';
import { marksByIndex } from './markMeta';

/** Props for {@link BarsView}. */
interface BarsViewProps {
  /** Values to draw as bars. */
  array: number[];
  /** Highlights for this step. */
  marks: Mark[];
  /** Search target; bars equal to it get an underline so it is easy to track. */
  target?: number;
}

/**
 * Draws one bar per value. Heights are scaled between the min and max value; when any
 * `range` mark is present, unmarked bars are dimmed so the active window stands out.
 * @param props - array, marks, and optional target
 */
export function BarsView({ array, marks, target }: BarsViewProps) {
  const byIndex = marksByIndex(marks);
  const hasRange = marks.some((m) => m.kind === 'range');
  const min = Math.min(...array, 0);
  const max = Math.max(...array, 1);
  const span = max - min || 1;
  const dense = array.length > 32;
  const showValues = array.length <= 32;

  if (array.length === 0) return <div className="empty">The array is empty. Add some numbers to begin.</div>;

  return (
    <div
      className="bars"
      data-dense={dense}
      role="img"
      aria-label={`Array of ${array.length} numbers: ${array.slice(0, 12).join(', ')}${array.length > 12 ? ', and more' : ''}`}
    >
      {array.map((v, i) => {
        const m = byIndex.get(i);
        const pct = 10 + (90 * (v - min)) / span;
        return (
          <div className="bar-col" key={i}>
            <div className="bar-tags">{m?.labels.map((l) => <span key={l}>{l}</span>)}</div>
            {showValues && <span className="bar-val">{v}</span>}
            <div
              className="bar"
              data-mark={m?.top ?? 'none'}
              data-dim={hasRange && !m}
              data-target={target !== undefined && v === target}
              style={{ height: `${pct}%` }}
            />
            {showValues && <span className="bar-idx">{i}</span>}
          </div>
        );
      })}
    </div>
  );
}
