/** Landing-page section where scrolling drives a real insertion sort, one step per stretch of scroll. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { insertionSort } from '../algorithms/sorting/insertion';
import { trackIds } from '../core/identity';
import { BarsView } from '../views/BarsView';

/** A fixed, short array so every step fits comfortably in the scroll length. */
const DATA = [41, 12, 67, 25, 88, 9, 53, 34, 71, 18];

/**
 * A tall section with a sticky stage. While the section is on screen, an animation-frame loop reads how far
 * it has scrolled and maps that to a step index; React re-renders only when the step changes. The loop stops
 * when the section leaves the viewport.
 */
export function ScrollScrub() {
  const steps = useMemo(() => insertionSort.run(DATA), []);
  const ids = useMemo(() => trackIds(steps.map((s) => s.state.array)), [steps]);
  const section = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = section.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    let raf = 0;
    let last = -1;
    /** Reads scroll progress through the section and updates the step when it changes. */
    const tick = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(Math.max(-r.top / span, 0), 1) : 0;
      const i = Math.round(p * (steps.length - 1));
      if (i !== last) {
        last = i;
        setIndex(i);
        setProgress(p);
      }
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) raf = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [steps.length]);

  const step = steps[index];
  return (
    <section className="scrub-story" ref={section} style={{ height: `${Math.min(100 + steps.length * 9, 640)}vh` }} aria-label="Insertion sort, driven by scrolling">
      <div className="scrub-sticky">
        <div className="scrub-copy">
          <h2>One step, one sentence.</h2>
          <p className="scrub-lede">This section is the scrubber. Move down the page and the sort moves with you, one recorded step at a time.</p>
          <p className="scrub-now" aria-live="off">{step.explain}</p>
          <ol className="code scrub-code" aria-hidden="true">
            {insertionSort.pseudocode.map((line, i) => (
              <li key={i} data-active={step.line === i}>
                <span className="ln">{i + 1}</span>
                <code>{line}</code>
              </li>
            ))}
          </ol>
        </div>
        <div className="scrub-stage">
          <header>
            <span>Insertion Sort</span>
            <span className="mono">step {index + 1} / {steps.length}</span>
          </header>
          <div style={{ ['--move' as string]: '260ms' }}>
            <BarsView array={step.state.array} marks={step.marks} ids={ids[index]} />
          </div>
          <div className="scrub-rail" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
