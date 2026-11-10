import { useState, useEffect, useCallback } from 'react';

/**
 * Robust reactive localStorage hook with cross-tab synchronization and SSR safety.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Read initial stored value safely
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Error reading key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      if (typeof window === 'undefined') {
        console.warn(`[useLocalStorage] Cannot set key "${key}" in SSR environment.`);
        return;
      }

      try {
        setStoredValue((currentValue) => {
          const valueToStore = value instanceof Function ? value(currentValue) : value;
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch custom event for same-tab updates
          window.dispatchEvent(new Event(`local-storage-${key}`));
          return valueToStore;
        });
      } catch (error) {
        console.warn(`[useLocalStorage] Error setting key "${key}":`, error);
      }
    },
    [key]
  );

  // Helper to remove key completely
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event(`local-storage-${key}`));
    } catch (error) {
      console.warn(`[useLocalStorage] Error removing key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for storage changes across tabs and within the same window
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | Event) => {
      if ('key' in event && event.key !== key) return;
      setStoredValue(readValue());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(`local-storage-${key}`, handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(`local-storage-${key}`, handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
