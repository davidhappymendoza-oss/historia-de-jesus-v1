import type { SfxKey, PlaybackOptions } from "./AudioService";

/**
 * Mapa de efectos a sus archivos. Agregar un nuevo efecto es agregar
 * una línea aquí + el archivo en public/sounds — nada más. Los
 * archivos viven en /public/ (no en src/assets/) porque Vite solo
 * garantiza que una ruta como "/sounds/correct.wav" funcione tanto en
 * `npm run dev` como en el build de producción si el archivo está en
 * /public/ — referenciarlo desde src/assets/ como string plano solo
 * funcionaba por casualidad en desarrollo.
 * "click", "levelComplete" y "lifeLost" quedan mapeados pero sin
 * archivo todavía (se agregan en fases posteriores); reproducirlos
 * falla en silencio hasta entonces gracias al try/catch de play().
 */
const SFX_FILES: Record<SfxKey, string> = {
  correct: "/sounds/correct.wav",
  incorrect: "/sounds/incorrect.wav",
  click: "/sounds/click.wav",
  levelComplete: "/sounds/level-complete.wav",
  lifeLost: "/sounds/life-lost.wav",
};

// Cache simple de elementos <audio> para no recrearlos en cada reproducción.
const cache = new Map<SfxKey, HTMLAudioElement>();

export function playSfx(key: SfxKey, options: PlaybackOptions = {}): void {
  try {
    let audio = cache.get(key);
    if (!audio) {
      audio = new Audio(SFX_FILES[key]);
      cache.set(key, audio);
    }
    audio.currentTime = 0;
    audio.volume = options.volume ?? 1;
    void audio.play().catch(() => {
      // Archivo ausente o reproducción bloqueada por el navegador — no rompe el juego.
    });
  } catch {
    // Entorno sin soporte de audio — no rompe el juego.
  }
}
