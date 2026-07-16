import { ASSET_MANIFEST } from "@/config/assetManifest";

/**
 * v2.0: reproductor de música de fondo simplificado — un solo archivo de
 * audio real (mp3/ogg, sin base64) en loop infinito, sin playlist ni
 * navegación entre pistas. Mismo diseño que useAmbientMusic() en el
 * artefacto: un único <audio>, creado una sola vez a nivel de módulo (no
 * por componente/pantalla), así que nunca se reinicia al navegar entre
 * pantallas — solo con play()/pause() explícitos del jugador.
 *
 * Canal de audio totalmente independiente de SfxPlayer.ts (que reproduce
 * sus propios <audio> para clic/acierto/error) — nunca se pisan entre sí.
 *
 * isPlaying se deriva de los eventos reales "play"/"pause" del elemento
 * <audio>, nunca se asume de forma optimista al llamar playMusic(): si el
 * navegador rechaza play() (autoplay bloqueado, archivo ausente, etc.),
 * el fallo queda en getState().lastError en vez de mostrar "reproduciendo"
 * por error.
 *
 * Para reemplazar la música: sobrescribir el archivo en
 * public/assets/audio/ (ver ASSET_MANIFEST.music.background) — este archivo
 * no necesita cambios.
 */

type MusicListener = (state: MusicPlayerState) => void;

export interface MusicPlayerState {
  isPlaying: boolean;
  volume: number;
  muted: boolean;
  lastError: string | null;
}

let audioEl: HTMLAudioElement | null = null;
let isPlaying = false;
let volume = 0.6;
let muted = false;
let lastError: string | null = null;
const listeners = new Set<MusicListener>();

function getAudio(): HTMLAudioElement {
  if (!audioEl) {
    const el = new Audio();
    el.loop = true; // loop infinito real — no hay "pista siguiente" que gestionar
    el.volume = muted ? 0 : volume;
    const track = ASSET_MANIFEST.music.background;
    if (track.path) el.src = track.path;

    el.addEventListener("play", () => {
      isPlaying = true;
      lastError = null;
      notify();
    });
    el.addEventListener("pause", () => {
      isPlaying = false;
      notify();
    });
    el.addEventListener("error", () => {
      const err = el.error;
      const codeNames: Record<number, string> = { 1: "ABORTED", 2: "NETWORK", 3: "DECODE", 4: "SRC_NOT_SUPPORTED" };
      lastError = err ? `${codeNames[err.code] ?? "desconocido"} (código ${err.code})` : "Error desconocido";
      isPlaying = false;
      notify();
    });
    audioEl = el;
  }
  return audioEl;
}

function notify(): void {
  const state = getState();
  listeners.forEach((fn) => fn(state));
}

export function getState(): MusicPlayerState {
  return { isPlaying, volume, muted, lastError };
}

export function subscribe(listener: MusicListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Arranca (o reanuda) la música. Debe llamarse desde un gesto real del
 * jugador (ej. el botón "Jugar") para cumplir la política de autoplay
 * del navegador — igual que useAmbientMusic() en el artefacto.
 */
export function playMusic(): void {
  const el = getAudio();
  if (!ASSET_MANIFEST.music.background.path) {
    lastError = "Sin archivo de audio todavía (ASSET_MANIFEST.music.background.path)";
    notify();
    return;
  }
  el.play().catch((err) => {
    lastError = err?.message || String(err);
    notify();
  });
}

export function pauseMusic(): void {
  audioEl?.pause();
}

export function toggleMusic(): void {
  isPlaying ? pauseMusic() : playMusic();
}

export function setMusicVolume(v: number): void {
  volume = v;
  if (audioEl && !muted) audioEl.volume = v;
  notify();
}

export function toggleMusicMute(): void {
  muted = !muted;
  if (audioEl) audioEl.volume = muted ? 0 : volume;
  notify();
}

/** Restaura volumen/silencio guardados (ver settingsStore.audio.musicVolume) al cargar la app. */
export function initMusicPreferences(savedVolume: number, savedMuted: boolean): void {
  volume = savedVolume;
  muted = savedMuted;
  if (audioEl) audioEl.volume = muted ? 0 : volume;
}
