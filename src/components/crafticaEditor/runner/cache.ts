// 2026-05-11 [opus-4-7] Phase 6: Cache Storage + IndexedDB ハイブリッドキャッシュ
// Phase 7 以降の Pyodide / Univer 等の WASM artifact を永続化する
const CACHE_NAME = 'craftica-editor-runtime-v1';
const IDB_NAME = 'craftica-editor-runtime';
const IDB_STORE = 'artifacts';
const IDB_VERSION = 1;
/** Cache Storage で扱うサイズの上限（超えたら IndexedDB chunk 経路に fallback） */
const CACHE_STORAGE_MAX = 25 * 1024 * 1024; // 25MB

export interface CacheStrategy {
  has(key: string): Promise<boolean>;
  get(key: string): Promise<ArrayBuffer | null>;
  put(key: string, data: ArrayBuffer): Promise<void>;
  evict(prefix: string): Promise<void>;
  estimate(): Promise<{ usage: number; quota: number }>;
}

function idbReq<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

class HybridCache implements CacheStrategy {
  private cacheStorage: Cache | null = null;
  private cacheStoragePromise: Promise<Cache> | null = null;

  private async getCacheStorage(): Promise<Cache | null> {
    if (typeof caches === 'undefined') return null;
    if (this.cacheStorage) return this.cacheStorage;
    if (!this.cacheStoragePromise) {
      this.cacheStoragePromise = caches.open(CACHE_NAME);
    }
    try {
      this.cacheStorage = await this.cacheStoragePromise;
      return this.cacheStorage;
    } catch {
      return null;
    }
  }

  private cacheKeyUrl(key: string): string {
    // Cache Storage は URL ベース。craftica-cache:// scheme で衝突回避
    return `https://craftica-editor-cache.local/${encodeURIComponent(key)}`;
  }

  async has(key: string): Promise<boolean> {
    const cs = await this.getCacheStorage();
    if (cs) {
      const hit = await cs.match(this.cacheKeyUrl(key));
      if (hit) return true;
    }
    try {
      const db = await openIdb();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const got = await idbReq(store.getKey(key));
      db.close();
      return got !== undefined;
    } catch {
      return false;
    }
  }

  async get(key: string): Promise<ArrayBuffer | null> {
    const cs = await this.getCacheStorage();
    if (cs) {
      const hit = await cs.match(this.cacheKeyUrl(key));
      if (hit) return hit.arrayBuffer();
    }
    try {
      const db = await openIdb();
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const got = await idbReq(store.get(key));
      db.close();
      if (got instanceof ArrayBuffer) return got;
      return null;
    } catch {
      return null;
    }
  }

  async put(key: string, data: ArrayBuffer): Promise<void> {
    if (data.byteLength <= CACHE_STORAGE_MAX) {
      const cs = await this.getCacheStorage();
      if (cs) {
        try {
          await cs.put(
            this.cacheKeyUrl(key),
            new Response(data, {
              headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Length': String(data.byteLength),
              },
            }),
          );
          return;
        } catch (e) {
          console.warn('[runner-cache] Cache Storage put failed, fallback to IndexedDB:', e);
        }
      }
    }
    // 大容量 or Cache Storage 不可 → IndexedDB
    const db = await openIdb();
    try {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      await idbReq(store.put(data, key));
    } finally {
      db.close();
    }
  }

  async evict(prefix: string): Promise<void> {
    const cs = await this.getCacheStorage();
    if (cs) {
      const keys = await cs.keys();
      for (const req of keys) {
        if (req.url.includes(encodeURIComponent(prefix))) {
          await cs.delete(req);
        }
      }
    }
    try {
      const db = await openIdb();
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const keys = await idbReq(store.getAllKeys());
      for (const k of keys) {
        if (typeof k === 'string' && k.startsWith(prefix)) {
          await idbReq(store.delete(k));
        }
      }
      db.close();
    } catch {
      /* ignore */
    }
  }

  async estimate(): Promise<{ usage: number; quota: number }> {
    if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
      const e = await navigator.storage.estimate();
      return { usage: e.usage ?? 0, quota: e.quota ?? 0 };
    }
    return { usage: 0, quota: 0 };
  }
}

export const runnerCache: CacheStrategy = new HybridCache();
