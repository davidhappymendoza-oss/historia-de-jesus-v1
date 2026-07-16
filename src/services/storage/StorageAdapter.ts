/**
 * Contrato que debe cumplir cualquier mecanismo de persistencia.
 *
 * Hoy solo existe LocalStorageAdapter. El día que se implemente
 * "guardado en la nube y sincronización entre dispositivos", se escribe
 * un CloudStorageAdapter que cumpla esta misma interfaz y se cambia
 * el adapter activo en index.ts — el resto de la app (stores, screens)
 * no cambia una sola línea porque nunca habla con localStorage
 * directamente, solo con esta interfaz.
 */
export interface StorageAdapter {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  /** Lista todas las claves bajo un prefijo, ej. "player:" para listar perfiles. */
  listKeys(prefix: string): Promise<string[]>;
}
