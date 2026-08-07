/**
 * Darsa Enterprise Browser Cache Manager
 * Menyimpan data sesi & dashboard di sessionStorage/localStorage browser
 * agar halaman terbuka INSTAN (0ms loading), dan otomatis terhapus saat logout.
 */

export function setLocalCache<T>(key: string, data: T): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`darsa_cache_${key}`, JSON.stringify({
        timestamp: Date.now(),
        data,
      }));
    }
  } catch (e) {
    console.error('[Cache] Error saving to sessionStorage:', e);
  }
}

export function getLocalCache<T>(key: string, maxAgeMs = 15 * 60 * 1000): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = sessionStorage.getItem(`darsa_cache_${key}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > maxAgeMs) {
      sessionStorage.removeItem(`darsa_cache_${key}`);
      return null;
    }
    return parsed.data as T;
  } catch {
    return null;
  }
}

export function clearAllLocalCache(): void {
  try {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith('darsa_')) {
          localStorage.removeItem(k);
        }
      });
    }
  } catch (e) {
    console.error('[Cache] Error clearing cache:', e);
  }
}
