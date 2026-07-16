/**
 * Feature flags centralizados.
 *
 * Cada función futura pedida en el brief ya tiene su interruptor aquí.
 * Todo el código que las soporta (servicios, stores, tipos) ya existe
 * o está en forma de stub — activar una función en el futuro es, en el
 * caso ideal, cambiar `false` a `true` aquí y completar la implementación
 * concreta del servicio correspondiente, sin rediseñar nada alrededor.
 */
export const FEATURES = {
  /** Efectos de sonido en respuestas correctas/incorrectas. IMPLEMENTADO desde Fase 0. */
  soundEffects: true,

  /** Narración por voz de las preguntas (ES/EN). Preparado, no implementado. */
  voiceNarration: false,

  /** Música de fondo en loop. IMPLEMENTADO — motor real (ver MusicPlayer.ts) con un archivo real en public/assets/audio/ (ver ASSET_MANIFEST.music.background). */
  backgroundMusic: true,

  /** Selector de Modo Oscuro en Configuración. Preparado, no implementado. */
  darkMode: false,

  /** Modo de Estudio: sin cronómetro, sin pérdida de vidas. Preparado, no implementado. */
  studyMode: false,

  /** Modo Competitivo. Preparado, no implementado. */
  competitiveMode: false,

  /** Guardado en la nube y sincronización entre dispositivos. Preparado, no implementado. */
  cloudSync: false,

  /** Pantalla de Estadísticas. La recolección de datos SÍ corre desde Fase 2. */
  statisticsScreen: false,

  /** Logros e insignias visibles al jugador. */
  achievementsUI: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
