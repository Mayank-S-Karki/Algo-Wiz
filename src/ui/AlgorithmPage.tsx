/** The main page for one algorithm: inputs, stage, playback dock, and side panels. */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AlgorithmDef, ArrayState, ListState, SearchState, Step } from '../core/step';
import { makeArray, type InputPreset } from '../core/random';
import { encodeHash, type UrlState } from '../core/urlState';
import { BarsView } from '../views/BarsView';
import { ListView } from '../views/ListView';
import { Legend } from '../views/Legend';
import { InputPanel } from './InputPanel';
import { PlayerDock } from './PlayerDock';
import { Panels } from './Panels';
import { buildInput, kindsUsed } from './inputs';
import { ignoreShortcut } from './keys';
import { usePlayer } from './usePlayer';

/** Props for {@link AlgorithmPage}. */
interface AlgorithmPageProps {
  def: AlgorithmDef<any, any>;
  /** State decoded from the URL when the page mounts. */
  initial: UrlState;
}

/**
 * Picks a default search target that is present but not dead center, so binary-style searches
 * take several visible steps instead of hitting on the first probe.
 * @param values - the array being searched
 * @returns a value present in the array, or 0 when empty
 */
function middleValue(values: number[]): number {
  if (values.length === 0) return 0;
  return [...values].sort((a, b) => a - b)[Math.floor(values.length * 0.8)];
}

/**
 * Owns the form state, runs the algorithm, and lays out the visualization.
 * The component is remounted (via `key`) when the algorithm changes, so state always starts fresh.
 * @param props - algorithm and the URL state at mount
 */
export function AlgorithmPage({ def, initial }: AlgorithmPageProps) {
  const spec = def.input;
  const [preset, setPreset] = useState<InputPreset | 'custom'>(initial.q ? 'custom' : 'random');
  const [size, setSize] = useState(spec.defaultSize);
  const [seed, setSeed] = useState(7);
  const [text, setText] = useState(() => initial.q?.split(',').join(', ') ?? makeArray('random', spec.defaultSize, 7).join(', '));
  const [target, setTarget] = useState(() => {
    if (initial.t !== undefined) return String(initial.t);
    return String(middleValue(makeArray('random', spec.defaultSize, 7)));
  });
  const [value, setValue] = useState(String(initial.v ?? 42));
  const [index, setIndex] = useState(String(initial.i ?? 2));

  const built = useMemo(() => buildInput(spec, { text, target, value, index }), [spec, text, target, value, index]);

  // Keep showing the last valid run while the user is mid-edit with invalid input.
  const good = useRef<Step<any>[]>([]);
  /** The new run for the current input, or null when the input is invalid or the algorithm throws. */
  const fresh = useMemo(() => {
    if (!built.ok) return null;
    try {
      return def.run(built.input);
    } catch {
      return null;
    }
  }, [def, built]);
  if (fresh) good.current = fresh;
  const steps = good.current;

  const player = usePlayer(steps.length, initial.s ?? 0);
  const { seek, pause } = player;

  // A new run starts from step 0 (but keep the step from the URL on first mount).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    pause();
    seek(0);
  }, [fresh, pause, seek]);

  /** Generates new data for a preset and refreshes the default target. */
  const regenerate = (p: InputPreset, n: number, s: number) => {
    const values = makeArray(p, n, s);
    setText(values.join(', '));
    setTarget(String(middleValue(values)));
    setPreset(p);
  };

  // Keep the URL in sync so any state can be shared. Debounced and skipped during playback,
  // because Safari throttles history.replaceState.
  useEffect(() => {
    if (player.playing) return;
    /** Writes the shareable state into the URL after a short pause. */
    const id = window.setTimeout(() => {
      try {
        history.replaceState(
          null,
          '',
          encodeHash({
            id: def.id,
            q: built.ok ? built.values.join(',') : undefined,
            t: spec.kind === 'array+target' && built.ok ? Number(target) : undefined,
            v: spec.fields?.includes('value') ? Number(value) : undefined,
            i: spec.fields?.includes('index') ? Number(index) : undefined,
            s: player.index,
          }),
        );
      } catch {
        /* sharing state is a convenience; ignore browsers that refuse */
      }
    }, 300);
    return () => window.clearTimeout(id);
  }, [def.id, spec, built, target, value, index, player.index, player.playing]);

  // Keyboard shortcuts. Ignored while typing in a field.
  useEffect(() => {
    /** Playback shortcuts: Space, arrows, Home/End, and [ ] for speed. */
    const onKey = (e: KeyboardEvent) => {
      if (ignoreShortcut(e)) return;
      if (e.key === ' ') {
        e.preventDefault();
        player.toggle();
      } else if (e.key === 'ArrowRight') player.next();
      else if (e.key === 'ArrowLeft') player.prev();
      else if (e.key === 'Home') player.first();
      else if (e.key === 'End') player.last();
      else if (e.key === '[') player.setSpeed(Math.max(0.25, player.speed / 2));
      else if (e.key === ']') player.setSpeed(Math.min(8, player.speed * 2));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const step = steps[player.index] ?? steps[0];
  const kinds = useMemo(() => kindsUsed(steps), [steps]);
  const error = built.ok ? null : built.error;

  return (
    <div className="page">
      <div className="workspace">
        <header className="page-head">
          <p className="crumb">{def.group ?? def.family}</p>
          <h1>{def.name}</h1>
          <ul className="chips" aria-label="Complexity">
            <li><span>Best</span>{def.complexity.best}</li>
            <li><span>Average</span>{def.complexity.average}</li>
            <li><span>Worst</span>{def.complexity.worst}</li>
            <li><span>Space</span>{def.complexity.space}</li>
          </ul>
        </header>

        <InputPanel
          def={def}
          text={text}
          preset={preset}
          size={size}
          target={target}
          value={value}
          index={index}
          error={error}
          onText={(t) => {
            setText(t);
            setPreset('custom');
          }}
          onPreset={(p) => {
            const s = p === preset ? seed + 1 : seed;
            setSeed(s);
            regenerate(p, size, s);
          }}
          onSize={(n) => {
            setSize(n);
            regenerate(preset === 'custom' ? 'random' : preset, n, seed);
          }}
          onTarget={setTarget}
          onValue={setValue}
          onIndex={setIndex}
        />

        <section className="stage" aria-label="Visualization">
          <div className="stage-head">
            <span className="step-count">Step {player.index + 1} of {steps.length}</span>
            {def.view === 'bars' && spec.kind === 'array+target' && <span className="target-pill">Target {(step.state as SearchState).target}</span>}
          </div>
          <p className="explain" aria-live="polite">{step.explain}</p>
          {def.view === 'bars' && (
            <BarsView array={(step.state as ArrayState | SearchState).array} marks={step.marks} target={spec.kind === 'array+target' ? (step.state as SearchState).target : undefined} />
          )}
          {def.view === 'list' && <ListView nodes={(step.state as ListState).nodes} kind={(step.state as ListState).kind} marks={step.marks} />}
          <Legend kinds={kinds} />
        </section>

        <PlayerDock player={player} length={steps.length} />
      </div>
      <Panels def={def} steps={steps} index={player.index} onSeek={player.seek} />
    </div>
  );
}
