/** Landing page: asymmetric hero with a live preview, then a bento of algorithm families. */
import { ArrowRight } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { REGISTRY } from '../algorithms';
import { bubbleSort } from '../algorithms/sorting/bubble';
import { makeArray } from '../core/random';
import { encodeHash } from '../core/urlState';
import { BarsView } from '../views/BarsView';
import { usePlayer } from './usePlayer';

/** A fixed, seeded array so the hero preview is identical on every visit. */
const PREVIEW_STEPS = bubbleSort.run(makeArray('random', 14, 21));

/** Hero preview: a real bubble sort that plays on a loop, using the same view as the app. */
function LivePreview() {
  const player = usePlayer(PREVIEW_STEPS.length);
  const { play, setSpeed, setLoop } = player;
  useEffect(() => {
    setSpeed(4);
    setLoop(true);
    play();
    // Start once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const step = PREVIEW_STEPS[player.index];
  return (
    <div className="preview" aria-label="Live bubble sort preview">
      <div className="preview-bar">
        <span>Bubble Sort</span>
        <span className="dim">Step {player.index + 1} / {PREVIEW_STEPS.length}</span>
      </div>
      <BarsView array={step.state.array} marks={step.marks} />
      <p className="preview-explain">{step.explain}</p>
    </div>
  );
}

/** Keyboard shortcuts worth knowing, shown as a compact row. */
const SHORTCUTS: Array<[string, string]> = [
  ['Space', 'Play or pause'],
  ['Left / Right', 'Step back or forward'],
  ['[  ]', 'Slower or faster'],
  ['T', 'Switch theme'],
  ['/', 'Search'],
];

/**
 * The landing page.
 * The four families that are not built yet are shown honestly as coming soon.
 */
export function Landing() {
  const total = REGISTRY.all.length;
  const counts = {
    sorting: REGISTRY.byFamily('sorting').length,
    searching: REGISTRY.byFamily('searching').length,
    linkedlist: REGISTRY.byFamily('linkedlist').length,
  };
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-copy">
          <p className="hero-tag">Algorithm visualizer</p>
          <h1>Watch algorithms think.</h1>
          <p className="hero-sub">Step through {total} algorithms with plain-English explanations, live pseudocode, and full playback control.</p>
          <div className="hero-cta">
            <a className="btn primary" href={encodeHash({ id: 'quick-sort' })}>
              Try quick sort <ArrowRight size={18} weight="bold" />
            </a>
            <a className="btn" href="#families" onClick={(e) => { e.preventDefault(); document.getElementById('families')?.scrollIntoView({ behavior: 'smooth' }); }}>
              Browse all
            </a>
          </div>
        </div>
        <LivePreview />
      </section>

      <section id="families" className="families">
        <h2>Pick a family</h2>
        <div className="bento">
          <a className="tile t-sorting" href={encodeHash({ id: 'bubble-sort' })}>
            <div className="mini-bars" aria-hidden="true">
              {[38, 72, 24, 90, 55, 30, 82, 46, 64, 20, 76, 50].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
            </div>
            <h3>Sorting</h3>
            <p>{counts.sorting} algorithms, from bubble sort to tim sort and even bogo sort.</p>
          </a>
          <a className="tile t-searching" href={encodeHash({ id: 'binary-search' })}>
            <div className="mini-cells" aria-hidden="true">
              {[3, 8, 12, 19, 25, 31, 44].map((v, i) => <i key={v} data-hit={i === 4}>{v}</i>)}
            </div>
            <h3>Searching</h3>
            <p>{counts.searching} ways to find a value, with the window shrinking on screen.</p>
          </a>
          <a className="tile t-lists" href={encodeHash({ id: 'singly-insert-head' })}>
            <h3>Linked lists</h3>
            <p>{counts.linkedlist} operations on singly, doubly, and circular lists.</p>
          </a>
          <div className="tile soon t-graphs">
            <h3>Graphs and pathfinding</h3>
            <p>BFS, Dijkstra, A*, and more. Coming soon.</p>
          </div>
          <div className="tile soon t-trees">
            <h3>Trees and heaps</h3>
            <p>BST, AVL, and heaps. Coming soon.</p>
          </div>
          <div className="tile soon t-dp">
            <h3>Dynamic programming and strings</h3>
            <p>Knapsack, LCS, edit distance, and KMP. Coming soon.</p>
          </div>
          <div className="tile soon t-classics">
            <h3>Backtracking and classics</h3>
            <p>N-Queens, Sudoku, and Tower of Hanoi. Coming soon.</p>
          </div>
        </div>
      </section>

      <section className="shortcuts" aria-label="Keyboard shortcuts">
        {SHORTCUTS.map(([k, d]) => (
          <div key={k}>
            <kbd>{k}</kbd>
            <span>{d}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
