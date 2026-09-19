/** App root: hash routing, theme, top bar, sidebar, and page selection. */
import { List, Moon, Sun } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { REGISTRY } from './algorithms';
import { decodeHash, type UrlState } from './core/urlState';
import { AlgorithmPage } from './ui/AlgorithmPage';
import { Landing } from './ui/Landing';
import { Sidebar } from './ui/Sidebar';
import { ignoreShortcut } from './ui/keys';
import { useTheme } from './ui/useTheme';

/**
 * Root component. Routes are `#/` (landing) and `#/a/<id>` (an algorithm).
 * Global shortcuts: `T` toggles the theme, `/` focuses the sidebar search.
 */
export function App() {
  const [route, setRoute] = useState<UrlState>(() => decodeHash(window.location.hash));
  const [theme, toggleTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    /** Re-reads the route whenever the hash changes and returns to the top of the page. */
    const onHash = () => {
      setRoute(decodeHash(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    /** Global shortcuts: T toggles the theme, / focuses the sidebar search. */
    const onKey = (e: KeyboardEvent) => {
      if (ignoreShortcut(e)) return;
      if (e.key === 't' || e.key === 'T') toggleTheme();
      else if (e.key === '/') {
        e.preventDefault();
        setNavOpen(true);
        document.getElementById('algo-search')?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTheme]);

  const def = route.id ? REGISTRY.get(route.id) : undefined;

  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn menu-btn" aria-label="Toggle menu" aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>
          <List size={20} weight="bold" />
        </button>
        <a className="logo" href="#/">ALGO<b>WIZ</b></a>
        <span className="grow" />
        <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Switch theme (T)">
          {theme === 'dark' ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
        </button>
      </header>
      <div className="body">
        <Sidebar activeId={def?.id ?? null} open={navOpen} onNavigate={() => setNavOpen(false)} />
        <main className="main" onClick={() => navOpen && setNavOpen(false)}>
          {route.id === null && <Landing />}
          {route.id !== null && def && <AlgorithmPage key={def.id} def={def} initial={route} />}
          {route.id !== null && !def && (
            <div className="not-found">
              <h1>Algorithm not found</h1>
              <p>There is no algorithm called "{route.id}".</p>
              <a className="btn primary" href="#/">Back to home</a>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
