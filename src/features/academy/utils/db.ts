const DB_NAME = 'toolique_academy_db';
const DB_VERSION = 1;
const STORE_PLAYGROUND_QUERIES = 'playground_queries';
const STORE_NOTES = 'notes_store';

let dbInstance: IDBDatabase | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_PLAYGROUND_QUERIES)) {
        db.createObjectStore(STORE_PLAYGROUND_QUERIES, { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_NOTES)) {
        db.createObjectStore(STORE_NOTES, { keyPath: 'questionId' });
      }
    };

    request.onsuccess = (event: any) => {
      dbInstance = event.target.result;
      resolve(dbInstance!);
    };

    request.onerror = (event: any) => {
      reject(event.target.error);
    };
  });
}

// SQL/JS/Python Query History API
export async function saveQueryHistory(type: 'sql' | 'js' | 'python', queryText: string) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYGROUND_QUERIES, 'readwrite');
    const store = tx.objectStore(STORE_PLAYGROUND_QUERIES);
    
    const entry = {
      type,
      query: queryText,
      timestamp: new Date().toISOString()
    };

    const req = store.add(entry);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getQueryHistory(type: 'sql' | 'js' | 'python'): Promise<any[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYGROUND_QUERIES, 'readonly');
    const store = tx.objectStore(STORE_PLAYGROUND_QUERIES);
    const req = store.getAll();

    req.onsuccess = () => {
      const results = req.result || [];
      const filtered = results
        .filter((item: any) => item.type === type)
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      resolve(filtered);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearQueryHistory(type: 'sql' | 'js' | 'python'): Promise<void> {
  const db = await getDB();
  const allHistory = await new Promise<any[]>((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYGROUND_QUERIES, 'readonly');
    const store = tx.objectStore(STORE_PLAYGROUND_QUERIES);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });

  const idsToClear = allHistory
    .filter((item: any) => item.type === type)
    .map((item: any) => item.id);

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PLAYGROUND_QUERIES, 'readwrite');
    const store = tx.objectStore(STORE_PLAYGROUND_QUERIES);
    
    let completed = 0;
    if (idsToClear.length === 0) resolve();

    idsToClear.forEach(id => {
      const req = store.delete(id);
      req.onsuccess = () => {
        completed++;
        if (completed === idsToClear.length) resolve();
      };
      req.onerror = () => reject(req.error);
    });
  });
}

// Markdown notes API
export async function saveDetailedNote(questionId: string, noteHtml: string) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NOTES, 'readwrite');
    const store = tx.objectStore(STORE_NOTES);
    const req = store.put({ questionId, note: noteHtml, updated: new Date().toISOString() });
    
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDetailedNote(questionId: string): Promise<string> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NOTES, 'readonly');
    const store = tx.objectStore(STORE_NOTES);
    const req = store.get(questionId);

    req.onsuccess = () => {
      resolve(req.result ? req.result.note : '');
    };
    req.onerror = () => reject(req.error);
  });
}
