import type { Language } from "@/types";

/**
 * Sistema modular de recursos — mismo diseño que el manifest del
 * artefacto (ver /artifact/historia-de-jesus.jsx). Reemplazar un
 * recurso es editar SOLO este archivo; ningún componente ni la lógica
 * del juego necesitan cambiar.
 *
 * IMPORTANTE: los archivos reales viven en /public/ (no en
 * src/assets/) — cualquier ruta acá referenciada como string plano
 * (sin `import`) solo se sirve de forma confiable en dev Y en el
 * build de producción si el archivo está en /public/. Poner un
 * archivo en src/assets/ y referenciarlo como "/src/assets/..." solo
 * funciona por casualidad en `npm run dev`, y se rompe en
 * `npm run build`.
 *
 * En el artefacto de Claude, en cambio, `path` tiene que ser una URL
 * https:// pública (no hay /public/ en un artefacto de un solo archivo).
 */

export type AssetType = "image" | "audio";
export type ResponsiveMode = "cover" | "contain";

export interface AssetEntry {
  id: string;
  path: string | null; // null = recurso pendiente
  type: AssetType;
  screen: string;
  alt: string;
  responsive?: ResponsiveMode;
}

export interface MusicTrack {
  path: string | null;
  title: string;
}

export interface AmbientVideoEntry {
  path: string | null; // null = todavía sin video, usa el fondo estático
}

export const ASSET_MANIFEST = {
  backgrounds: {
    // bg-menu.webp — entregado por el usuario. cover, sin deformar,
    // overlay negro 25% para legibilidad (aplicar donde se consuma).
    menu: { id: "bg-menu", path: "/images/backgrounds/bg-menu.webp", type: "image", screen: "menu", alt: "Fondo del menú principal", responsive: "cover" } as AssetEntry,
    // bg-player-setup.png — entregado por el usuario. cover, overlay
    // negro 25% (aplicar donde se consuma).
    playerSetup: { id: "bg-player-setup", path: "/images/backgrounds/bg-player-setup.png", type: "image", screen: "playerSetup", alt: "Fondo de selección de jugador", responsive: "cover" } as AssetEntry,
    // bg-game.webp — entregado por el usuario. cover, overlay sutil
    // 12% (aplicar donde se consuma en la pantalla de juego).
    game: { id: "bg-game", path: "/images/backgrounds/bg-game.webp", type: "image", screen: "game", alt: "Fondo de la pantalla de juego", responsive: "cover" } as AssetEntry,
    // bg-score.webp — entregado por el usuario. cover, overlay sutil
    // 12%, panel "glass" translúcido (ver GlassPanel / panelVariant en
    // el artefacto — pendiente de portar a las pantallas modulares).
    score: { id: "bg-score", path: "/images/backgrounds/bg-score.webp", type: "image", screen: "score", alt: "Fondo de la pantalla de puntuación", responsive: "cover" } as AssetEntry,
    // bg-configuration.webp — entregado por el usuario. cover, overlay
    // sutil 12%, panel "glass" translúcido (mismo tratamiento que Puntuación).
    configuration: { id: "bg-configuration", path: "/images/backgrounds/bg-configuration.webp", type: "image", screen: "configuration", alt: "Fondo de configuración", responsive: "cover" } as AssetEntry,
  },
  characters: {
    // char-celebrate.png — entregado por el usuario. contain, centrado,
    // máx. 45% alto escritorio / 38% móvil, animación de entrada+flotado+salida.
    celebrate: { id: "char-celebrate", path: "/images/characters/char-celebrate.png", type: "image", screen: "game", alt: "Jesús celebrando al completar un nivel", responsive: "contain" } as AssetEntry,
    encourage: { id: "char-encourage", path: null, type: "image", screen: "game", alt: "Personaje animando al jugador tras perder", responsive: "contain" } as AssetEntry,
  },
  icons: {
    // lock-open.png — entregado por el usuario, pantalla de nivel
    // desbloqueado. 160-240px escritorio / 130px móvil, contain.
    lockOpen: { id: "lock-open", path: "/images/icons/lock-open.png", type: "image", screen: "game", alt: "Candado desbloqueado", responsive: "contain" } as AssetEntry,
  },
  music: {
    // Un solo loop de fondo, archivo real (mp3/ogg, sin base64) en
    // public/assets/audio/. Para reemplazar la música alcanza con
    // sobrescribir ese archivo o cambiar este path — MusicPlayer.ts no
    // necesita cambios.
    background: { path: "/assets/audio/background-music.mp3", title: "Hasta el final" } as MusicTrack,
  },
  // Video ambiental opcional por fondo. path: null = usa la imagen
  // estática de siempre, sin overlays artificiales. Para activar un
  // video: poner su ruta acá (public/assets/video/backgrounds/) — el
  // componente de fondo (pendiente de portar a este proyecto, ver
  // AmbientBackground en el artefacto) no necesita ningún otro cambio.
  ambientVideos: {
    menu: { path: "/assets/video/backgrounds/bg-menu.mp4" } as AmbientVideoEntry,
    playerSetup: { path: null } as AmbientVideoEntry,
    game: { path: null } as AmbientVideoEntry,
    score: { path: null } as AmbientVideoEntry,
    configuration: { path: null } as AmbientVideoEntry,
  },
};

/** Ilustraciones de preguntas: se resuelven desde Question.illustration, no se enumeran aquí. */
export function getQuestionIllustrationPath(_illustrationFilename: string): string | null {
  // Cuando existan archivos reales en public/images/, resolver así:
  // return `/images/${_illustrationFilename}`;
  return null;
}

export function localizedTitle(track: MusicTrack, _language: Language): string {
  return track.title;
}
