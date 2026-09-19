/** Landing page: hero with live boards, a ticker, one live tile per family, and a look at the shared player. */
import { ArrowRight, Trophy } from '@phosphor-icons/react';
import { useEffect, useMemo } from 'react';
import { REGISTRY } from '../algorithms';
import { encodeHash } from '../core/urlState';
import { FAMILIES } from './family';
import { defaultInput } from './inputs';
import { MiniStage } from './MiniStage';
import { usePlayer } from './usePlayer';

/** Order of the family tiles; chosen so each bento row fills its 12 columns. */
const TILE_ORDER = ['sorting', 'searching', 'graph', 'tree', 'linkedlist', 'dp', 'strings', 'classics'];

/** Keyboard shortcuts worth knowing. */
const SHORTCUTS: Array<[string, string]> = [
  ['Space', 'Play or pause'],
  ['Left / Right', 'Step back or forward'],
  ['[  ]', 'Slower or faster'],
  ['T', 'Switch theme'],
  ['/', 'Search'],
];

/**
 * Pseudocode with the active line highlighted, driven by a real looping run.
 * It shows what the Code tab does on every algorithm page.
 */
function LiveCode({ id }: { id: string }) {
  const def = REGISTRY.get(id);
  const steps = useMemo(() => (def ? def.run(defaultInput(def)) : []), [def]);
  const player = usePlayer(steps.length);
  const { play, setSpeed, setLoop } = player;
  useEffect(() => {
    setSpeed(1);
    setLoop(true);
    play();
    // Start once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!def || !steps.length) return null;
  const step = steps[player.index];
  return (
    <div className="live-code" aria-hidden="true">
      <p className="live-explain">{step.explain}</p>
      <ol className="code">
        {def.pseudocode.map((line, i) => (
          <li key={i} data-active={step.line === i}>
            <span className="ln">{i + 1}</span>
            <code>{line}</code>
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * The landing page. Every preview is a real run of the same engine the app uses.
 */
export function Landing() {
  const total = REGISTRY.all.length;
  const names = useMemo(() => REGISTRY.all.map((d) => d.name), []);
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <h1>Watch algorithms think.</h1>
          <p className="hero-sub">Step through {total} algorithms with plain-English explanations, live pseudocode, and full playback control.</p>
          <div className="hero-cta">
            <a className="btn primary" href="#families" onClick={(e) => { e.preventDefault(); document.getElementById('families')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Explore algorithms <ArrowRight size={18} weight="bold" />
            </a>
            <a className="btn" href="#/race">
              <Trophy size={18} weight="bold" /> Race sorts
            </a>
          </div>
        </div>
        <div className="hero-boards" aria-hidden="true">
          <div className="board board-a" style={{ ['--h' as string]: 262 }}>
            <header><span>Quick Sort</span></header>
            <MiniStage id="quick-sort" size={14} speed={4} caption />
          </div>
          <div className="board board-b" style={{ ['--h' as string]: 300 }}>
            <header><span>A* Search</span></header>
            <MiniStage id="grid-astar" speed={6} />
          </div>
          <div className="board board-c" style={{ ['--h' as string]: 145 }}>
            <header><span>AVL Insert</span></header>
            <MiniStage id="avl-insert" speed={2} />
          </div>
        </div>
      </section>

      <div className="ticker" aria-hidden="true">
        <div className="ticker-track">
          {[...names, ...names].map((n, i) => (
            <span key={i}>{n}</span>
          ))}
        </div>
      </div>

      <section id="families" className="families">
        <h2>Eight families, one player</h2>
        <div className="bento">
          {[...FAMILIES].sort((a, b) => TILE_ORDER.indexOf(a.id) - TILE_ORDER.indexOf(b.id)).map((f) => {
            const defs = REGISTRY.byFamily(f.id);
            return (
              <a key={f.id} className="tile" data-family={f.id} style={{ ['--h' as string]: f.hue }} href={encodeHash({ id: defs[0].id })}>
                <div className="tile-view"><MiniStage id={f.previewId} speed={3} /></div>
                <div className="tile-text">
                  <h3>
                    <f.Icon size={20} weight="duotone" />
                    {f.label}
                    <span className="count">{defs.length}</span>
                  </h3>
                  <p>{f.pitch}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="player-demo">
        <div className="pd-copy">
          <h2>Every step explained.</h2>
          <p>Each frame comes with one sentence of plain English, the pseudocode line that caused it, and running counters. Step forward, step back, or scrub anywhere.</p>
          <ul className="shortcuts" aria-label="Keyboard shortcuts">
            {SHORTCUTS.map(([k, d]) => (
              <li key={k}>
                <kbd>{k}</kbd>
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </div>
        <LiveCode id="binary-search" />
      </section>

      <footer className="site-foot">
        <p>Built by Mayank Karki, Nitin Kandpal, and Swarit Kumar. MIT license.</p>
      </footer>
    </div>
  );
}
