/** Left navigation: searchable list of algorithms grouped by family. */
import { MagnifyingGlass } from '@phosphor-icons/react';
import { useMemo, useState } from 'react';
import { REGISTRY } from '../algorithms';
import type { AlgorithmDef, Family } from '../core/step';
import { encodeHash } from '../core/urlState';

/** Families with display names, in sidebar order. */
const FAMILIES: Array<{ id: Family; label: string }> = [
  { id: 'sorting', label: 'Sorting' },
  { id: 'searching', label: 'Searching' },
  { id: 'linkedlist', label: 'Linked lists' },
];

/** Props for {@link Sidebar}. */
interface SidebarProps {
  /** Id of the algorithm on screen, or null on the landing page. */
  activeId: string | null;
  /** Mobile drawer state. */
  open: boolean;
  /** Called when a link is chosen so the drawer can close. */
  onNavigate: () => void;
}

/**
 * Sidebar with a search box (focus with `/`) and collapsible families.
 * Linked-list operations are sub-grouped by list type.
 * @param props - active id and drawer state
 */
export function Sidebar({ activeId, open, onNavigate }: SidebarProps) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  /** True when the algorithm's name, family, or group contains the search text. */
  const matches = (d: AlgorithmDef<any, any>) => q === '' || `${d.name} ${d.family} ${d.group ?? ''}`.toLowerCase().includes(q);

  const groups = useMemo(
    () =>
      FAMILIES.map((f) => {
        const defs = REGISTRY.byFamily(f.id).filter(matches);
        // Sub-group by `group` (linked lists); other families use one unnamed group.
        const sub = new Map<string, AlgorithmDef<any, any>[]>();
        for (const d of defs) sub.set(d.group ?? '', [...(sub.get(d.group ?? '') ?? []), d]);
        return { ...f, count: defs.length, sub: [...sub.entries()] };
      }).filter((g) => g.count > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q],
  );

  return (
    <nav className="sidebar" data-open={open} aria-label="Algorithms">
      <div className="search">
        <MagnifyingGlass size={16} weight="bold" aria-hidden="true" />
        <input id="algo-search" type="search" placeholder="Search algorithms" aria-label="Search algorithms" value={query} onChange={(e) => setQuery(e.target.value)} />
        <kbd>/</kbd>
      </div>
      {groups.length === 0 && <p className="dim pad">No algorithm matches "{query}".</p>}
      {groups.map((g) => (
        <details key={g.id} open={q !== '' || g.sub.some(([, d]) => d.some((x) => x.id === activeId)) || g.id === 'sorting'}>
          <summary>
            {g.label}
            <span className="count">{g.count}</span>
          </summary>
          {g.sub.map(([name, defs]) => (
            <div key={name}>
              {name && <p className="subgroup">{name}</p>}
              <ul>
                {defs.map((d) => (
                  <li key={d.id}>
                    <a href={encodeHash({ id: d.id })} aria-current={d.id === activeId ? 'page' : undefined} onClick={onNavigate}>
                      {d.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </details>
      ))}
    </nav>
  );
}
