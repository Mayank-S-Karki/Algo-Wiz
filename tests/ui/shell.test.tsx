import { act, fireEvent, render, screen } from '@testing-library/react';
import { App } from '../../src/App';
import { buildInput } from '../../src/ui/inputs';
import { bubbleSort } from '../../src/algorithms/sorting/bubble';
import { binarySearch } from '../../src/algorithms/searching/binary';

/** Points the hash at a route and lets the app react. */
function go(hash: string) {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
}

beforeEach(() => {
  window.location.hash = '#/';
  window.scrollTo = () => {};
});

describe('routing', () => {
  it('shows the landing page at #/', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /watch algorithms think/i })).toBeInTheDocument();
  });
  it('opens an algorithm from the hash', () => {
    window.location.hash = '#/a/bubble-sort';
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Bubble Sort' })).toBeInTheDocument();
  });
  it('shows a not-found page for unknown ids', () => {
    window.location.hash = '#/a/nope';
    render(<App />);
    expect(screen.getByText('Algorithm not found')).toBeInTheDocument();
  });
  it('follows hash changes', () => {
    render(<App />);
    go('#/a/quick-sort');
    expect(screen.getByRole('heading', { level: 1, name: 'Quick Sort' })).toBeInTheDocument();
  });
});

describe('playback and shortcuts', () => {
  it('steps forward and back with buttons and arrow keys', () => {
    window.location.hash = '#/a/bubble-sort';
    render(<App />);
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next step' }));
    expect(screen.getByText(/Step 2 of/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText(/Step 3 of/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText(/Step 2 of/)).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'End' });
    expect(screen.getByText('Done: the array is sorted.', { selector: '.explain' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Home' });
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });
  it('toggles the theme with the T key', () => {
    render(<App />);
    const before = document.documentElement.dataset.theme;
    fireEvent.keyDown(window, { key: 't' });
    expect(document.documentElement.dataset.theme).not.toBe(before);
  });
  it('ignores shortcuts while typing in a field', () => {
    window.location.hash = '#/a/bubble-sort';
    render(<App />);
    const field = screen.getByLabelText('Numbers');
    fireEvent.keyDown(field, { key: 'ArrowRight' });
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });
});

describe('input validation', () => {
  it('shows an inline error for bad input and keeps the last run', () => {
    window.location.hash = '#/a/bubble-sort';
    render(<App />);
    fireEvent.change(screen.getByLabelText('Numbers'), { target: { value: '3, x, 1' } });
    expect(screen.getByRole('alert')).toHaveTextContent('"x" is not a whole number.');
    expect(screen.getByText(/Step 1 of/)).toBeInTheDocument();
  });
  it('runs the algorithm on valid custom input', () => {
    window.location.hash = '#/a/bubble-sort';
    render(<App />);
    fireEvent.change(screen.getByLabelText('Numbers'), { target: { value: '3, 1, 2' } });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.keyDown(window, { key: 'End' });
    expect(screen.getByText(/Step \d+ of/).textContent).toMatch(/of (\d+)/);
  });
});

describe('sidebar search', () => {
  it('filters algorithms by name', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Search algorithms'), { target: { value: 'heap' } });
    expect(screen.getByRole('link', { name: 'Heap Sort' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Bubble Sort' })).toBeNull();
  });
  it('explains an empty result', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Search algorithms'), { target: { value: 'zzzz' } });
    expect(screen.getByText(/No algorithm matches/)).toBeInTheDocument();
  });
});

describe('buildInput', () => {
  it('rejects oversized input', () => {
    const r = buildInput(bubbleSort.input, { text: Array.from({ length: 61 }, (_, i) => i).join(','), target: '', value: '', index: '' });
    expect(r).toMatchObject({ ok: false });
  });
  it('sorts the array for sorted-only searches and validates the target', () => {
    const ok = buildInput(binarySearch.input, { text: '5, 1, 3', target: '3', value: '', index: '' });
    expect(ok).toMatchObject({ ok: true, input: { array: [1, 3, 5], target: 3 } });
    expect(buildInput(binarySearch.input, { text: '5, 1, 3', target: 'abc', value: '', index: '' })).toMatchObject({ ok: false });
  });
});
