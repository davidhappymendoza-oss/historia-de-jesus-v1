import type { StorageAdapter } from "./StorageAdapter";

/**
 * STUB — Guardado en la nube y sincronización entre dispositivos.
 *
 * No implementado todavía (ver FEATURES.cloudSync en config/features.ts).
 * Cuando se construya, esta clase implementará StorageAdapter hablando
 * con un backend real (ej. REST API o Firebase). Como ya cumple el mismo
 * contrato que LocalStorageAdapter, activarla es cuestión de:
 *   1) Implementar los 4 métodos contra el backend elegido.
 *   2) Cambiar el adapter activo en storageService.ts.
 * Ningún store ni pantalla necesita cambios.
 */
export class CloudStorageAdapter implements StorageAdapter {
  async get<T>(_key: string): Promise<T | null> {
    throw new Error("CloudStorageAdapter no está implementado todavía.");
  }
  async set<T>(_key: string, _value: T): Promise<void> {
    throw new Error("CloudStorageAdapter no está implementado todavía.");
  }
  async remove(_key: string): Promise<void> {
    throw new Error("CloudStorageAdapter no está implementado todavía.");
  }
  async listKeys(_prefix: string): Promise<string[]> {
    throw new Error("CloudStorageAdapter no está implementado todavía.");
  }
}
