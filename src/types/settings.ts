export type Language = "es" | "en";

export type ThemeMode = "light" | "dark";

/**
 * Modos de juego. Solo "standard" está implementado en la Fase 2.
 *
 * - standard: cronómetro + vidas (el juego tal como está especificado).
 * - study: sin cronómetro, sin pérdida de vidas — pensado para aprender
 *   sin presión. Preparado en el tipo y en gameStore; su lógica se activa
 *   en una fase futura.
 * - competitive: reglas adicionales (ej. multiplicadores, tiempos más
 *   estrictos) para una futura modalidad ranked. Preparado, no implementado.
 */
export type GameMode = "standard" | "study" | "competitive";

export interface AppSettings {
  language: Language;
  theme: ThemeMode; // fijo en "light" hasta que se implemente Modo Oscuro
  gameMode: GameMode; // fijo en "standard" hasta fases futuras
  audio: {
    sfxEnabled: boolean;
    musicEnabled: boolean; // sin efecto todavía — música no implementada
    voiceEnabled: boolean; // sin efecto todavía — narración no implementada
    sfxVolume: number; // 0-1
    musicVolume: number; // 0-1
    voiceVolume: number; // 0-1
  };
  sync: {
    /** Preparado para guardado en la nube. "local" es el único adapter activo hoy. */
    provider: "local" | "cloud";
  };
}
