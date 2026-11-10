import { useState, useCallback, useMemo } from 'react';

export interface HistoryOptions {
  maxHistory?: number;
}

export interface UseHistoryReturn<T> {
  state: T;
  set: (newPresent: T | ((curr: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: (newInitial?: T) => void;
  history: {
    past: T[];
    present: T;
    future: T[];
  };
}

/**
 * State history hook with undo/redo capabilities and boundary controls.
 */
export function useHistory<T>(initialPresent: T, options: HistoryOptions = {}): UseHistoryReturn<T> {
  const { maxHistory = 50 } = options;

  const [history, setHistory] = useState<{
    past: T[];
    present: T;
    future: T[];
  }>({
    past: [],
    present: initialPresent,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const undo = useCallback(() => {
    setHistory((curr) => {
      if (curr.past.length === 0) return curr;

      const previous = curr.past[curr.past.length - 1];
      const newPast = curr.past.slice(0, curr.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [curr.present, ...curr.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((curr) => {
      if (curr.future.length === 0) return curr;

      const next = curr.future[0];
      const newFuture = curr.future.slice(1);

      return {
        past: [...curr.past, curr.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const set = useCallback(
    (newPresent: T | ((curr: T) => T)) => {
      setHistory((curr) => {
        const resolved = newPresent instanceof Function ? newPresent(curr.present) : newPresent;
        if (resolved === curr.present) return curr;

        const newPast = [...curr.past, curr.present].slice(-maxHistory);

        return {
          past: newPast,
          present: resolved,
          future: [],
        };
      });
    },
    [maxHistory]
  );

  const clear = useCallback(
    (newInitial?: T) => {
      setHistory({
        past: [],
        present: newInitial !== undefined ? newInitial : initialPresent,
        future: [],
      });
    },
    [initialPresent]
  );

  return useMemo(
    () => ({
      state: history.present,
      set,
      undo,
      redo,
      canUndo,
      canRedo,
      clear,
      history,
    }),
    [history, set, undo, redo, canUndo, canRedo, clear]
  );
}

export default useHistory;
