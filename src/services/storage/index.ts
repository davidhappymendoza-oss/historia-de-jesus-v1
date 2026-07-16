import { LocalStorageAdapter } from "./LocalStorageAdapter";
import { FEATURES } from "@/config/features";
import type { StorageAdapter } from "./StorageAdapter";

// Cuando FEATURES.cloudSync se active y CloudStorageAdapter esté
// implementado, este es el único lugar que cambia.
function createStorageAdapter(): StorageAdapter {
  if (FEATURES.cloudSync) {
    throw new Error(
      "cloudSync está activado pero CloudStorageAdapter aún no está implementado."
    );
  }
  return new LocalStorageAdapter();
}

export const storageService: StorageAdapter = createStorageAdapter();
export type { StorageAdapter } from "./StorageAdapter";
