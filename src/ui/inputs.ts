/** Parsing and validation of the input form into the exact shape each algorithm expects. */
import type { InputSpec, ListInput, MarkKind, SearchInput, Step } from '../core/step';
import { parseNumbers } from '../core/random';

/** Result of validating the form. */
export type Built = { ok: true; input: unknown; values: number[] } | { ok: false; error: string };

/** Raw form values, all strings as typed by the user. */
export interface RawForm {
  text: string;
  target: string;
  value: string;
  index: string;
}

/**
 * Parses one integer field.
 * @param raw - text typed by the user
 * @param label - field name used in the error message
 * @returns the number, or an error message
 */
function parseField(raw: string, label: string): { ok: true; n: number } | { ok: false; error: string } {
  const t = raw.trim();
  if (t === '' || !Number.isInteger(Number(t))) return { ok: false, error: `${label} must be a whole number.` };
  return { ok: true, n: Number(t) };
}

/**
 * Validates the form and builds the algorithm input.
 * @param spec - the algorithm's input spec
 * @param form - raw field values
 * @returns the input and parsed values, or the first validation error
 */
export function buildInput(spec: InputSpec, form: RawForm): Built {
  let values: number[] = [];
  if (spec.kind === 'list' && form.text.trim() === '') {
    values = [];
  } else {
    const parsed = parseNumbers(form.text);
    if (!parsed.ok) return parsed;
    values = parsed.values;
  }
  if (values.length > spec.maxSize) return { ok: false, error: `This algorithm accepts at most ${spec.maxSize} numbers (you entered ${values.length}).` };

  if (spec.kind === 'array') return { ok: true, input: values, values };

  if (spec.kind === 'array+target') {
    const t = parseField(form.target, 'Target');
    if (!t.ok) return t;
    const array = spec.needsSorted ? [...values].sort((a, b) => a - b) : values;
    return { ok: true, input: { array, target: t.n } satisfies SearchInput, values };
  }

  const v = spec.fields?.includes('value') ? parseField(form.value, 'Value') : { ok: true as const, n: 0 };
  if (!v.ok) return v;
  const i = spec.fields?.includes('index') ? parseField(form.index, 'Position') : { ok: true as const, n: 0 };
  if (!i.ok) return i;
  return { ok: true, input: { list: values, value: v.n, index: i.n } satisfies ListInput, values };
}

/**
 * Lists the mark kinds that appear anywhere in a run, in a stable display order.
 * @param steps - the recorded run
 * @returns kinds for the legend
 */
export function kindsUsed(steps: Step<unknown>[]): MarkKind[] {
  const order: MarkKind[] = ['compare', 'swap', 'pivot', 'active', 'pointer', 'range', 'insert', 'delete', 'sorted', 'found', 'notfound'];
  const seen = new Set<MarkKind>();
  for (const s of steps) for (const m of s.marks) seen.add(m.kind);
  return order.filter((k) => seen.has(k));
}
