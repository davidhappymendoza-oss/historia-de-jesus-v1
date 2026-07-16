import type { StorageAdapter } from "./StorageAdapter";

const NAMESPACE = "hdj"; // Historia de Jesús

function namespacedKey(key: string): string {
  return `${NAMESPACE}:${key}`;
}

export class LocalStorageAdapter implements StorageAdapter {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = window.localStorage.getItem(namespacedKey(key));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch (error) {
      console.error(`[LocalStorageAdapter] Error leyendo "${key}":`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      window.localStorage.setItem(namespacedKey(key), JSON.stringify(value));
    } catch (error) {
      console.error(`[LocalStorageAdapter] Error guardando "${key}":`, error);
    }
  }

  async remove(key: string): Promise<void> {
    window.localStorage.removeItem(namespacedKey(key));
  }

  async listKeys(prefix: string): Promise<string[]> {
    const fullPrefix = namespacedKey(prefix);
    const keys: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith(fullPrefix)) {
        keys.push(key.slice(NAMESPACE.length + 1));
      }
    }
    return keys;
  }
}
