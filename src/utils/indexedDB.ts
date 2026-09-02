// IndexedDB Utility with transparent localStorage fallback for notes, scratchpads, and favorites

const DB_NAME = 'toolique_local_db';
const DB_VERSION = 1;
const STORE_NOTES = 'notes';
const STORE_FAVORITES = 'favorites';

// Open IndexedDB safely
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error || new Error('Failed to open IndexedDB'));
    };
  });
}

// ----------------------------------------------------
// NOTES STORAGE (IndexedDB with localStorage Fallback)
// ----------------------------------------------------

export async function saveNoteToDB(key: string, content: string): Promise<void> {
  // Always backup to localStorage for instant synchronous fallback
  try {
    localStorage.setItem(`toolique_note_${key}`, content);
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NOTES, 'readwrite');
      const store = tx.objectStore(STORE_NOTES);
      store.put({ key, content, updatedAt: Date.now() });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    // Graceful fallback to localStorage already handled
  }
}

export async function getNoteFromDB(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    const result = await new Promise<{ key: string; content: string } | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NOTES, 'readonly');
      const store = tx.objectStore(STORE_NOTES);
      const req = store.get(key);

      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (result && typeof result.content === 'string') {
      return result.content;
    }
  } catch (err) {}

  // Fallback to localStorage
  try {
    return localStorage.getItem(`toolique_note_${key}`);
  } catch {
    return null;
  }
}

// ----------------------------------------------------
// FAVORITES STORAGE
// ----------------------------------------------------

export async function getFavoritesFromDB(): Promise<string[]> {
  // Try localStorage first for instant initial render
  let localFavs: string[] = [];
  try {
    const raw = localStorage.getItem('toolique_favorites');
    if (raw) localFavs = JSON.parse(raw);
  } catch {}

  try {
    const db = await openDB();
    const records = await new Promise<Array<{ id: string }>>((resolve, reject) => {
      const tx = db.transaction(STORE_FAVORITES, 'readonly');
      const store = tx.objectStore(STORE_FAVORITES);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });

    if (records && records.length > 0) {
      const dbFavs = records.map(r => r.id);
      // Union with localStorage to ensure no data is lost
      const combined = Array.from(new Set([...localFavs, ...dbFavs]));
      try {
        localStorage.setItem('toolique_favorites', JSON.stringify(combined));
      } catch {}
      return combined;
    }
  } catch (err) {}

  return localFavs;
}

export async function saveFavoritesToDB(ids: string[]): Promise<void> {
  const uniqueIds = Array.from(new Set(ids));

  try {
    localStorage.setItem('toolique_favorites', JSON.stringify(uniqueIds));
    window.dispatchEvent(new CustomEvent('toolique_favorites_updated', { detail: uniqueIds }));
  } catch {}

  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_FAVORITES, 'readwrite');
      const store = tx.objectStore(STORE_FAVORITES);
      store.clear();
      uniqueIds.forEach(id => {
        store.put({ id, addedAt: Date.now() });
      });

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {}
}

export async function toggleFavoriteInDB(id: string): Promise<string[]> {
  const current = await getFavoritesFromDB();
  let updated: string[];
  if (current.includes(id)) {
    updated = current.filter(item => item !== id);
  } else {
    updated = [...current, id];
  }
  await saveFavoritesToDB(updated);
  return updated;
}
