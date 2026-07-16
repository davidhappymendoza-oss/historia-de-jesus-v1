export type SfxKey = "correct" | "incorrect" | "click" | "levelComplete" | "lifeLost";

export interface PlaybackOptions {
  volume?: number; // 0-1
}

/**
 * Un solo servicio de audio con tres canales INDEPENDIENTES:
 *   - SFX: elementos <audio> reales (SfxPlayer.ts) — implementado.
 *   - Música: <audio> real en loop simple, un solo archivo (MusicPlayer.ts) — implementado.
 *   - Voz: narración por pregunta (VoicePlayer.ts) — STUB, Fase futura.
 * Nunca se pisan entre sí porque usan elementos <audio> independientes.
 */
export interface AudioService {
  /** Efectos de sonido cortos (correcto/incorrecto/clic...). Implementado. */
  playSfx(key: SfxKey, options?: PlaybackOptions): void;

  /** Música de fondo en loop infinito, un solo archivo real. Implementado. */
  playMusic(): void;
  pauseMusic(): void;
  toggleMusic(): void;
  setMusicVolume(volume: number): void;
  toggleMusicMute(): void;

  /** Narración por voz de una pregunta, en el idioma activo. STUB — ver VoicePlayer.ts. */
  playVoice(questionId: string, language: "es" | "en"): void;
}
