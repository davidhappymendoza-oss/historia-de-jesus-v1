# Videos ambientales de fondo (público)

- `bg-menu.mp4` — fondo animado del menú principal, referenciado por
  `ASSET_MANIFEST.ambientVideos.menu.path` en
  `src/config/assetManifest.ts`. H.264, 1280x964, ~2.3MB, sin audio
  (el video es mudo por diseño — `muted` en el `<video>`).
- Los demás fondos (`playerSetup`, `game`, `score`, `configuration`)
  todavía no tienen video — quedan con `path: null` hasta que se
  entreguen, y mientras tanto usan la imagen estática de siempre.

Para reemplazar el video del menú: sobrescribir este archivo (mismo
nombre) o cambiar el `path` del manifest — no hace falta tocar código.
