import { clampIndex, stepDelayMs } from '../../src/core/player';
import { mulberry32, makeArray, parseNumbers } from '../../src/core/random';
import { encodeHash, decodeHash } from '../../src/core/urlState';
import { Tracer, SearchTracer } from '../../src/core/tracer';
import { createRegistry } from '../../src/core/registry';
import type { AlgorithmDef } from '../../src/core/step';

describe('player helpers', () => {
  it('clamps indices', () => {
    expect(clampIndex(-3, 5)).toBe(0);
    expect(clampIndex(9, 5)).toBe(4);
    expect(clampIndex(2, 5)).toBe(2);
    expect(clampIndex(3, 0)).toBe(0);
  });
  it('maps speed to delay and clamps speed', () => {
    expect(stepDelayMs(1)).toBe(800);
    expect(stepDelayMs(8)).toBe(100);
    expect(stepDelayMs(100)).toBe(100);
    expect(stepDelayMs(0)).toBe(3200);
  });
});

describe('random helpers', () => {
  it('is deterministic per seed', () => {
    const a = mulberry32(7);
    const b = mulberry32(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it('builds presets', () => {
    const s = makeArray('sorted', 10, 1);
    expect(s).toEqual([...s].sort((x, y) => x - y));
    const r = makeArray('reversed', 10, 1);
    expect(r).toEqual([...r].sort((x, y) => y - x));
    expect(new Set(makeArray('unique', 30, 1)).size).toBeLessThanOrEqual(4);
    expect(makeArray('random', 12, 3)).toHaveLength(12);
  });
  it('parses numbers and reports errors', () => {
    expect(parseNumbers('5, 3 ,8')).toEqual({ ok: true, values: [5, 3, 8] });
    expect(parseNumbers('[1 2 3]')).toEqual({ ok: true, values: [1, 2, 3] });
    expect(parseNumbers('')).toMatchObject({ ok: false });
    expect(parseNumbers('1, x')).toEqual({ ok: false, error: '"x" is not a whole number.' });
    expect(parseNumbers('1.5')).toMatchObject({ ok: false });
  });
});

describe('url state', () => {
  it('round-trips', () => {
    const s = { id: 'bubble-sort', q: '5,3,8', t: 3, s: 4 };
    expect(decodeHash(encodeHash(s))).toEqual(s);
  });
  it('landing and garbage decode to null id', () => {
    expect(encodeHash({ id: null })).toBe('#/');
    expect(decodeHash('#/')).toEqual({ id: null });
    expect(decodeHash('#/zzz')).toEqual({ id: null });
  });
  it('ignores bad numeric params', () => {
    expect(decodeHash('#/a/x?t=abc&s=-2')).toEqual({ id: 'x' });
  });
});

describe('Tracer', () => {
  it('counts comparisons, swaps, writes and never mutates input', () => {
    const input = [3, 1, 2];
    const t = new Tracer(input);
    expect(t.compare(0, 1, 1)).toBe(true);
    t.swap(0, 1, 2);
    t.write(2, 9, 3);
    const steps = t.finish();
    expect(input).toEqual([3, 1, 2]);
    const last = steps[steps.length - 1];
    expect(last.stats).toEqual({ comparisons: 1, swaps: 1, writes: 1, memory: 0 });
    expect(last.state.array).toEqual([1, 3, 9]);
    expect(last.marks).toHaveLength(3);
  });
});

describe('SearchTracer', () => {
  it('records probe, found, and not found', () => {
    const t = new SearchTracer([1, 3, 5], 5);
    expect(t.probe(0, 1)).toBe(-1);
    expect(t.probe(2, 1)).toBe(0);
    const steps = t.found(2, 2);
    expect(steps[steps.length - 1].state.result).toBe(2);
    const m = new SearchTracer([1], 9);
    expect(m.notFound(3)[1].state.result).toBe(-1);
  });
});

describe('registry', () => {
  const def = (id: string): AlgorithmDef => ({
    id, name: id, family: 'sorting', summary: '', complexity: { best: '', average: '', worst: '', space: '' },
    pseudocode: [], theory: {}, input: { kind: 'array', maxSize: 5, defaultSize: 3 }, run: () => [], view: 'bars',
  });
  it('looks up and rejects duplicates', () => {
    const r = createRegistry([def('a'), def('b')]);
    expect(r.get('a')?.id).toBe('a');
    expect(r.get('zz')).toBeUndefined();
    expect(r.byFamily('sorting')).toHaveLength(2);
    expect(() => createRegistry([def('a'), def('a')])).toThrow('Duplicate');
  });
});
