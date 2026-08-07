/**
 * Darsa Enterprise Browser Cache Engine (IndexedDB + Storage Isolation)
 * Sesuai Ketentuan Resmi Manajemen Cache Browser Darsa Enterprise
 * 
 * 1. Database Server (PostgreSQL / Neon) adalah Single Source of Truth (SSOT).
 * 2. Client-side Cache (IndexedDB & localStorage) memberikan pengalaman instan (< 100ms) tanpa spinner loading berulang.
 * 3. Hapus 100% seluruh cache saat logout.
 */

const DB_NAME = 'darsa_enterprise_cache';
const DB_VERSION = 1;
const STORES = ['santri', 'guru', 'asrama', 'pelanggaran', 'surat', 'alumni', 'arsip', 'audit_log', 'roles', 'general'];

// ─── IndexedDB Connection Helper ─────────────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      STORES.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'key' });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── IndexedDB Operations ───────────────────────────────────────────────────

export async function setIndexedDBCache<T>(storeName: string, key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(storeName)) return;
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put({ key, data, timestamp: Date.now() });
  } catch (e) {
    console.warn('[Cache Engine] IndexedDB write failed:', e);
  }
}

export async function getIndexedDBCache<T>(storeName: string, key: string, maxAgeMs = 30 * 60 * 1000): Promise<T | null> {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(storeName)) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => {
        const item = req.result;
        if (!item) return resolve(null);
        if (Date.now() - item.timestamp > maxAgeMs) {
          // Expired
          removeIndexedDBCache(storeName, key);
          return resolve(null);
        }
        resolve(item.data as T);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function removeIndexedDBCache(storeName: string, key: string): Promise<void> {
  try {
    const db = await openDB();
    if (!db.objectStoreNames.contains(storeName)) return;
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
  } catch {}
}

// ─── Sync Storage (localStorage / sessionStorage) ───────────────────────────

export function setLocalCache<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`darsa_${key}`, JSON.stringify({
        timestamp: Date.now(),
        data,
      }));
    }
  } catch (e) {
    console.error('[Cache] Error writing localStorage:', e);
  }
}

export function getLocalCache<T>(key: string, maxAgeMs = 30 * 60 * 1000): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(`darsa_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > maxAgeMs) {
      localStorage.removeItem(`darsa_${key}`);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

// ─── Clear All Local Storage on Logout (Rule 9) ──────────────────────────────

export async function clearAllLocalCache(): Promise<void> {
  try {
    if (typeof window === 'undefined') return;

    // 1. Clear IndexedDB
    if (window.indexedDB) {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onerror = () => console.warn('[Cache] Delete IndexedDB error');
    }

    // 2. Clear localStorage items starting with darsa_
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith('darsa_')) {
        localStorage.removeItem(k);
      }
    });

    // 3. Clear sessionStorage
    sessionStorage.clear();

    // 4. Delete Auth cookies
    document.cookie = 'darsa_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'darsa_instansi=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'better-auth.session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch (e) {
    console.error('[Cache Engine] Clear cache error:', e);
  }
}
