/** Light/dark theme state, persisted in localStorage when available. */
import { useCallback, useEffect, useState } from 'react';

/** Theme names. */
export type Theme = 'dark' | 'light';

/** Reads the saved theme; storage can throw in private windows, so failures fall back to dark. */
function readTheme(): Theme {
  try {
    return localStorage.getItem('algowiz-theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

/**
 * Tracks the theme and mirrors it to `<html data-theme>`.
 * @returns the current theme and a toggle function
 */
export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(readTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('algowiz-theme', theme);
    } catch {
      /* storage unavailable: the theme still applies for this session */
    }
  }, [theme]);
  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);
  return [theme, toggle];
}
