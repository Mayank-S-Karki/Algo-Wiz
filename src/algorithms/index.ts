/** Central registry of every algorithm in the app. */
import { createRegistry } from '../core/registry';
import { SORTING } from './sorting';
import { SEARCHING } from './searching';
import { LINKED_LISTS } from './linkedlist';

/** The app-wide registry. Phase 2+ families append their arrays here. */
export const REGISTRY = createRegistry([...SORTING, ...SEARCHING, ...LINKED_LISTS]);
