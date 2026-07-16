# Audio de fondo (público)

- `background-music.mp3` — pista activa, referenciada por
  `ASSET_MANIFEST.music.background` en `src/config/assetManifest.ts`.
  Para reemplazar la música: **sobrescribir este archivo** (o cambiar el
  `path` del manifest) — `MusicPlayer.ts` no necesita cambios.

Formatos soportados por el reproductor: cualquiera que el navegador
pueda reproducir con un `<audio>` (mp3, ogg, wav...). No hay datos
embebidos en base64 en ningún lugar de este sistema.
