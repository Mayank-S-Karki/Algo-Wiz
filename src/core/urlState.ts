/** Encodes and decodes shareable app state in the URL hash. */

/** State stored in the hash. */
export interface UrlState {
  /** Algorithm id, or null for the landing page. */
  id: string | null;
  /** Custom input text, when the user typed their own data. */
  q?: string;
  /** Search target. */
  t?: number;
  /** Step index. */
  s?: number;
  /** Linked-list value field. */
  v?: number;
  /** Linked-list index field. */
  i?: number;
  /** Generic form fields that differ from their defaults. */
  f?: Record<string, string>;
}

/**
 * Serializes state to a hash such as `#/a/bubble-sort?q=5,3,8&s=4`.
 * @param state - state to encode
 * @returns the hash string, starting with `#/`
 */
export function encodeHash(state: UrlState): string {
  if (!state.id) return '#/';
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.t !== undefined) params.set('t', String(state.t));
  if (state.v !== undefined) params.set('v', String(state.v));
  if (state.i !== undefined) params.set('i', String(state.i));
  if (state.f && Object.keys(state.f).length) params.set('f', JSON.stringify(state.f));
  if (state.s) params.set('s', String(state.s));
  const qs = params.toString();
  return `#/a/${encodeURIComponent(state.id)}${qs ? `?${qs}` : ''}`;
}

/**
 * Parses a hash produced by {@link encodeHash}. Unknown or malformed hashes decode to the landing page.
 * @param hash - `location.hash` value
 * @returns the decoded state
 */
export function decodeHash(hash: string): UrlState {
  const m = /^#\/a\/([^?]+)(?:\?(.*))?$/.exec(hash);
  if (!m) return { id: null };
  const params = new URLSearchParams(m[2] ?? '');
  const state: UrlState = { id: decodeURIComponent(m[1]) };
  const q = params.get('q');
  if (q) state.q = q;
  const t = params.get('t');
  if (t !== null && Number.isInteger(Number(t))) state.t = Number(t);
  const s = params.get('s');
  if (s !== null && Number.isInteger(Number(s)) && Number(s) >= 0) state.s = Number(s);
  const f = params.get('f');
  if (f) {
    try {
      const parsed = JSON.parse(f) as unknown;
      if (parsed && typeof parsed === 'object') state.f = Object.fromEntries(Object.entries(parsed as Record<string, unknown>).map(([k, v]) => [k, String(v)]));
    } catch {
      /* a damaged link falls back to defaults */
    }
  }
  for (const key of ['v', 'i'] as const) {
    const raw = params.get(key);
    if (raw !== null && raw !== '' && Number.isInteger(Number(raw))) state[key] = Number(raw);
  }
  return state;
}
