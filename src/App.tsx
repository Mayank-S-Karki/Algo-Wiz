/** App root: hash routing, theme, top bar, sidebar, command palette, and page selection. */
import { List, MagnifyingGlass, Moon, Sun, Trophy } from '@phosphor-icons/react';
import { useEffect, useState } from 'react';
import { REGISTRY } from './algorithms';
import { decodeHash, type UrlState } from './core/urlState';
import { AlgorithmPage } from './ui/AlgorithmPage';
import { CommandPalette } from './ui/CommandPalette';
import { Landing } from './ui/Landing';
import { Race } from './ui/Race';
import { Sidebar } from './ui/Sidebar';
import { ignoreShortcut } from './ui/keys';
import { useTheme } from './ui/useTheme';
import { Backdrop } from './ui/Backdrop';
import { useRevealRoot } from './ui/reveal';

/** Which page the hash points at. */
type Route = { page: 'home' } | { page: 'race' } | { page: 'algo'; state: UrlState };

/**
 * Turns `location.hash` into a route: `#/` home, `#/race`, `#/a/<id>` an algorithm.
 * @param hash - the hash string
 */
function parseRoute(hash: string): Route {
  if (hash.startsWith('#/race')) return { page: 'race' };
  const state = decodeHash(hash);
  return state.id ? { page: 'algo', state } : { page: 'home' };
}

/**
 * Root component. Global shortcuts: `T` toggles the theme; `/` or Ctrl/Cmd+K opens the search palette.
 */
export function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));
  const [theme, toggleTheme] = useTheme();
  const [navOpen, setNavOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  useRevealRoot();

  useEffect(() => {
    /** Re-reads the route whenever the hash changes and returns to the top of the page. */
    const onHash = () => {
      setRoute(parseRoute(window.location.hash));
      window.scrollTo({ top: 0 });
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    /** Global shortcuts: Ctrl/Cmd+K and / open search, T toggles the theme. */
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(true);
        return;
      }
      if (ignoreShortcut(e)) return;
      if (e.key === 't' || e.key === 'T') toggleTheme();
      else if (e.key === '/') {
        e.preventDefault();
        setPalette(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleTheme]);

  const def = route.page === 'algo' && route.state.id ? REGISTRY.get(route.state.id) : undefined;

  // The family hue tints the whole chrome (sidebar, buttons, focus rings).
  useEffect(() => {
    document.documentElement.dataset.family = route.page === 'race' ? 'race' : def?.family ?? 'home';
  }, [route.page, def]);

  return (
    <div className="shell">
      <Backdrop />
      <header className="topbar">
        <button className="icon-btn menu-btn" aria-label="Toggle menu" aria-expanded={navOpen} onClick={() => setNavOpen((o) => !o)}>
          <List size={20} weight="bold" />
        </button>
        <a className="logo" href="#/" aria-label="ALGO-WIZ home">
          <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true" className="logo-mark">
            <circle cx="16" cy="16" r="14.5" className="logo-ring" />
            <circle cx="16" cy="16" r="11.5" className="logo-ring thin" />
            <rect x="9.5" y="16" width="3.4" height="7" rx="1" className="logo-bar" />
            <rect x="14.3" y="9" width="3.4" height="14" rx="1" className="logo-bar hot" />
            <rect x="19.1" y="13" width="3.4" height="10" rx="1" className="logo-bar" />
          </svg>
          <span>Algo<em>Wiz</em></span>
        </a>
        <nav className="top-links" aria-label="Site">
          <a href="#/race" aria-current={route.page === 'race' ? 'page' : undefined}><Trophy size={16} weight="bold" /> Race</a>
        </nav>
        <span className="grow" />
        <button className="top-search" onClick={() => setPalette(true)} aria-label="Search algorithms">
          <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
          <span>Search</span>
          <kbd>Ctrl K</kbd>
        </button>
        <button className="icon-btn" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} title="Switch theme (T)">
          {theme === 'dark' ? <Sun size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
        </button>
      </header>
      <div className="body" data-home={route.page === 'home'}>
        {route.page !== 'home' && <Sidebar activeId={def?.id ?? null} open={navOpen} onNavigate={() => setNavOpen(false)} onSearch={() => setPalette(true)} />}
        <main className="main" onClick={() => navOpen && setNavOpen(false)}>
          {route.page === 'home' && <Landing />}
          {route.page === 'race' && <Race />}
          {route.page === 'algo' && def && <AlgorithmPage key={def.id} def={def} initial={route.state} />}
          {route.page === 'algo' && !def && (
            <div className="not-found">
              <h1>Algorithm not found</h1>
              <p>There is no algorithm called "{route.state.id}".</p>
              <a className="btn primary" href="#/">Back to home</a>
            </div>
          )}
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}
