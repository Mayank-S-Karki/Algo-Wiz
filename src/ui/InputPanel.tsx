/** Input controls: presets, size, custom values, and the extra fields an algorithm needs. */
import { Shuffle } from '@phosphor-icons/react';
import type { AlgorithmDef } from '../core/step';
import type { InputPreset } from '../core/random';

/** Preset buttons in display order. */
const PRESETS: Array<{ id: InputPreset; label: string }> = [
  { id: 'random', label: 'Random' },
  { id: 'sorted', label: 'Sorted' },
  { id: 'reversed', label: 'Reversed' },
  { id: 'nearly', label: 'Nearly sorted' },
  { id: 'unique', label: 'Few unique' },
];

/** Props for {@link InputPanel}. */
interface InputPanelProps {
  def: AlgorithmDef<any, any>;
  text: string;
  preset: InputPreset | 'custom';
  size: number;
  target: string;
  value: string;
  index: string;
  /** Validation message, or null when the input is valid. */
  error: string | null;
  onText: (t: string) => void;
  onPreset: (p: InputPreset) => void;
  onSize: (n: number) => void;
  onTarget: (t: string) => void;
  onValue: (v: string) => void;
  onIndex: (i: string) => void;
}

/**
 * Renders the input form for an algorithm. Labels sit above fields and errors below them.
 * @param props - current field values and change handlers
 */
export function InputPanel(p: InputPanelProps) {
  const { input } = p.def;
  const isList = input.kind === 'list';
  return (
    <section className="inputs" aria-label="Input">
      <div className="field grow">
        <label htmlFor="data-input">{isList ? 'List values' : 'Numbers'}</label>
        <input id="data-input" className="text-input mono" value={p.text} onChange={(e) => p.onText(e.target.value)} spellCheck={false} aria-invalid={p.error !== null} aria-describedby={p.error ? 'input-error' : undefined} />
        {p.error ? (
          <p id="input-error" className="field-error" role="alert">{p.error}</p>
        ) : (
          <p className="field-help">
            Separate with commas. Up to {input.maxSize} numbers.
            {input.needsSorted ? ' The array is sorted for you before the search.' : ''}
          </p>
        )}
      </div>
      {input.kind === 'array+target' && (
        <div className="field narrow">
          <label htmlFor="target-input">Target</label>
          <input id="target-input" className="text-input mono" inputMode="numeric" value={p.target} onChange={(e) => p.onTarget(e.target.value)} />
        </div>
      )}
      {input.fields?.includes('value') && (
        <div className="field narrow">
          <label htmlFor="value-input">Value</label>
          <input id="value-input" className="text-input mono" inputMode="numeric" value={p.value} onChange={(e) => p.onValue(e.target.value)} />
        </div>
      )}
      {input.fields?.includes('index') && (
        <div className="field narrow">
          <label htmlFor="index-input">Position</label>
          <input id="index-input" className="text-input mono" inputMode="numeric" value={p.index} onChange={(e) => p.onIndex(e.target.value)} />
        </div>
      )}
      <div className="field narrow">
        <label htmlFor="size-input">Size: {p.size}</label>
        <input id="size-input" type="range" min={isList ? 0 : 3} max={input.maxSize} value={p.size} onChange={(e) => p.onSize(Number(e.target.value))} />
      </div>
      <div className="presets" role="group" aria-label="Generate data">
        {(isList ? PRESETS.slice(0, 1) : PRESETS).map((pr) => (
          <button key={pr.id} className="chip-btn" data-on={p.preset === pr.id} onClick={() => p.onPreset(pr.id)}>
            {pr.id === 'random' && <Shuffle size={15} weight="bold" />}
            {pr.label}
          </button>
        ))}
      </div>
    </section>
  );
}
