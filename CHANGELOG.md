# Changelog

## v2.4 — Video ambiental real del menú principal (2026-07-16)

### Archivo

- **Ruta definitiva:** `public/assets/video/backgrounds/bg-menu.mp4`
  (proyecto modular). Registrado en
  `src/config/assetManifest.ts` → `ASSET_MANIFEST.ambientVideos.menu.path`.
- Optimizado desde el original (54MB, 4096×3086, ~54 Mbps — no apto
  para web) a 1280×964, H.264, ~2.3MB, sin audio.
- En el artefacto de vista previa se incrustó como base64
  (`BG_MENU_VIDEO_DATA_URI`) — es el único fondo con video de los 5;
  los otros 4 siguen con `path: null` a propósito, tal como se pidió
  ("primero probar únicamente el video del menú").

### Integración visual (`AmbientBackground`)

- `autoplay`, `muted`, `loop`, `playsInline`, sin controles nativos.
- `object-fit: cover` + `object-position: center center` — mismo
  encuadre que la imagen estática, sin deformarse.
- Siempre detrás de toda la interfaz — título, botones (Jugar,
  Configuración, Puntuación), selector de idioma, controles de audio y
  "Developed by OTSV" quedan exactamente donde estaban, sin tocar su
  código, estilo ni sonidos.
- **Carga y respaldo:** la imagen estática (`bg-menu.webp`) queda
  montada todo el tiempo por debajo; el video arranca con opacidad 0 y
  hace un fundado suave (0.8s) hacia opacidad 1 recién cuando el
  evento `canplay` confirma que puede reproducirse. Si el video falla
  o no es compatible (evento `error`), se oculta automáticamente y
  queda la imagen estática de forma permanente — sin ningún mensaje de
  error visible.
- Overlay oscuro del menú bajado de 25% a **15%** (dentro del rango
  10-20% pedido) para no oscurecer el arte del video.
- Se pausa con la pestaña oculta y retoma al volver; respeta
  `prefers-reduced-motion` (nunca monta el video, queda la imagen
  estática). No se reinicia al re-renderizar la misma pantalla.

### Limpieza confirmada

Se re-verificó (no quedaba nada, ya se había sacado en v2.3): sin
óvalo/círculo de nube, sin formas genéricas de aves/agua/luz, sin
banner de diagnóstico, sin modo de prueba exagerado.

### Verificación real — y una limitación honesta

Se confirmó con navegador headless: atributos del `<video>` correctos
(autoplay/muted/loop/playsinline/sin controls/object-fit/position), y
la lógica de `canplay`→fundido y `error`→respaldo se disparan y
funcionan como corresponde (probado con una ruta de video inválida
real).

**Lo que NO se pudo verificar en este entorno:** la reproducción real
del archivo H.264 específico, porque el Chromium headless disponible
acá es una build open-source sin el decodificador H.264 (licencia
propietaria) — se confirmó reproduciendo un video VP9/WebM de prueba,
que sí cargó sin problema, aislando el límite al códec y no al
archivo ni al código. H.264 sigue siendo la elección correcta para
producción (compatibilidad más amplia, especialmente en Safari/iOS).

### No tocado (confirmado)

Audio (música y efectos), preguntas, respuestas, cronómetro, vidas,
puntuación, niveles, jugadores, idioma, progreso, animaciones de
victoria/derrota, posición de la interfaz.

## v2.3 — Fondo ambiental: de formas genéricas a video real opcional (2026-07-16)

Cambio de enfoque pedido tras revisar visualmente la v2.2: las formas
CSS genéricas (círculo de nube, líneas de aves, franjas de agua/
vegetación) se veían artificiales y no correspondían al estilo del
fondo. Se sacaron por completo y se reemplazó el enfoque.

### Eliminado

- Los 12 componentes de efectos con formas genéricas (nubes, aves,
  brillo del sol, luz del amanecer, vegetación, agua, rayos de luz,
  partículas doradas, llama, luz de lámpara, cortina, polvo).
- `AMBIENT_EFFECTS_CONFIG`, `AMBIENT_EFFECT_COMPONENTS`.
- Todo el CSS asociado (keyframes y clases `.ambient-*`).
- `AMBIENT_DEBUG_MODE` y el banner verde de diagnóstico — no queda
  ningún modo de prueba exagerado ni panel visible.

### Nuevo enfoque: video ambiental opcional

- `AmbientBackground` ahora envuelve `AssetBackground` (sin
  modificarlo) y, opcionalmente, reproduce un video real de fondo si
  hay uno configurado en `ASSET_MANIFEST.ambientVideos[asset.id].path`
  — pensado para un video generado externamente (agua, nubes, aves,
  luz, vegetación reales, no formas CSS).
- **Sin video configurado** (estado actual — los 5 fondos tienen
  `path: null`): se comporta exactamente igual que el fondo estático
  de siempre, sin overlays artificiales de ningún tipo.
- **Con video configurado**: `autoplay`, `muted`, `loop`,
  `playsInline`, sin controles visibles, `object-fit: cover`, siempre
  detrás de toda la interfaz (botones/título/íconos se conservan
  estáticos y utilizables, sin cambios de posición). No se reinicia
  mientras la pantalla siga montada. Se pausa con la pestaña oculta y
  retoma desde donde estaba. `prefers-reduced-motion: reduce` hace que
  el video nunca se monte — queda la imagen estática como alternativa.
- Activar un video a futuro: alcanza con poner su ruta en
  `ASSET_MANIFEST.ambientVideos` — cero cambios de código.

### Verificado (navegador real)

Lógica de decisión de video (sin configurar / configurado / con
reduced-motion), atributos del `<video>` (autoplay, muted, loop,
playsinline, sin controls, object-fit: cover, position: absolute), y
pausa/reanudación según visibilidad de pestaña — todo confirmado con
Chromium headless.

### No tocado (confirmado)

Audio, preguntas, niveles, puntuación, jugadores, progreso,
persistencia, posición de la interfaz.

## v2.2 — Animaciones ambientales sobre los fondos (2026-07-16)

Fase independiente, sobre los 5 fondos principales ya aprobados. Regla
de oro respetada: las imágenes de fondo siguen siendo exactamente las
mismas (mismo path, mismo encuadre) — se agregaron capas de movimiento
sutil ENCIMA, con CSS puro (transform/opacity), sin video ni GIF.

### Dónde vive esta fase

Implementada en el **artefacto** (`AmbientBackground`, componente
nuevo que envuelve `AssetBackground` sin modificarlo, más una
configuración central `AMBIENT_EFFECTS_CONFIG` por `asset.id`). Este
proyecto modular todavía no tiene capa de pantallas/componentes React
(`src/screens/` y `src/components/` siguen vacíos, igual que antes de
esta fase) — no hay dónde "engancharlo" todavía acá. El diseño es
config-first, así que portarlo cuando exista esa capa es directo: se
reutilizan los mismos nombres de efecto y las mismas listas por
`asset.id`.

### Efectos activos por pantalla

- **Menú (`bg-menu`)**: nubes lentas, brillo del sol muy sutil, aves
  ocasionales.
- **Selección de jugador (`bg-player-setup`)**: nubes lentas, luz del
  amanecer respirando, reflejo de agua, vegetación con balanceo mínimo.
- **Juego (`bg-game`)**: reflejo de agua, nubes lentas, aves
  ocasionales, vegetación casi imperceptible. (También aplica a las
  pantallas de fin de nivel/fin de juego, que reutilizan el mismo fondo.)
- **Puntuación (`bg-score`)**: rayos de luz con variación lenta, nubes,
  partículas doradas ocasionales. Cruz y montaña: sin animar (parte de
  la imagen estática, no se tocan).
- **Configuración (`bg-configuration`)**: llama de lámpara con parpadeo
  delicado, variación de la luz proyectada, cortina con balanceo leve,
  partículas de polvo discretas.

### Accesibilidad / rendimiento

- Solo `transform`/`opacity` en todas las animaciones.
- `prefers-reduced-motion: reduce` → todas las animaciones se
  desactivan, quedan los fondos estáticos de siempre.
- Pestaña oculta (`visibilitychange`) → todas las animaciones se
  pausan.
- Capa completa con `pointer-events: none` — nunca interfiere con
  clics ni con la lectura de preguntas/respuestas.
- Cantidad de elementos deliberadamente baja (2-3 nubes, 2 aves, 5-6
  partículas como máximo), y se reduce más en móvil (`@media
  max-width: 480px` oculta la segunda instancia de cada efecto).

### Nota sobre posiciones

Como las imágenes son fondos ya aplanados (no hay capas separadas de
agua/vegetación/etc.), la posición de cada efecto es una primera
aproximación genérica sobre la composición — exactamente lo pedido
para esta pasada ("versión moderada y fácil de ajustar"). Ajustar
posición/tamaño/intensidad después de la revisión visual es tan simple
como tocar la clase CSS del efecto correspondiente, sin tocar lógica.

### No tocado (confirmado)

Sistema de audio (arquitectura, controles, archivo de música), panel
de diagnóstico (no se reintrodujo), preguntas, vidas, cronómetro,
puntuación, progreso, jugadores, idioma, persistencia, encuadre y
rutas de los fondos actuales.

## v2.1 — Música de fondo real + pad ambiental menos monótono (2026-07-16)

### Proyecto modular — archivo real de música entregado por el usuario

- Se reemplazó el placeholder anterior por el archivo real entregado
  ("Hasta el final"), guardado como
  `public/assets/audio/background-music.mp3`.
- `ASSET_MANIFEST.music.ambient` se renombró a
  `ASSET_MANIFEST.music.background` para mayor claridad — sigue siendo
  el único punto que hay que tocar para cambiar la música a futuro.
- Se eliminaron `ambient.mp3` / `ambient-alt.mp3` (superados por el
  archivo real de esta entrega).
- **Verificación real con el archivo entregado** (Chromium headless):
  reproduce, pausa **conservando la posición** (1.08s → sigue en 1.08s
  tras pausar, no se resetea), retoma **desde esa posición** (continúa
  a 1.37s, no vuelve a 0), `loop=true` confirmado, volumen y mute
  responden correctamente.

### Artefacto — pad ambiental generativo menos monótono

El artefacto (single-file, sin servidor) no puede cargar archivos
reales — ver nota de arquitectura en v2.0. Como alternativa a base64,
se mejoró la síntesis existente para no sonar como "un tono sostenido,
lineal": las 4 voces ahora se deslizan lentamente entre 4 acordes
(Re mayor → Si menor 7 → Sol mayor → La sus2, ~24s por acorde con
glide de ~6s) y se sumó un tremolo muy suave. Play/Pause/Volumen/Mute
sin cambios — solo se tocó el generador de sonido interno.

## v2.0 — Sistema de música simplificado: archivos reales, sin playlist (2026-07-16)

Reemplazo completo del sistema de música de fondo, pedido explícitamente
para dejar de parchar la playlist anterior. Se aplicó tanto en el
artefacto (JSX de vista previa) como en este proyecto modular, con la
arquitectura que corresponde a cada uno (ver nota al final).

### Eliminado

- Playlist de 8 pistas (`ASSET_MANIFEST.music.playlist`, `MusicTrack.id`).
- Navegación entre pistas: `nextTrack()`, `previousTrack()`,
  `findNextPlayableIndex()`, `findPreviousPlayableIndex()`.
- `trackIndex`, `currentTrack`, `duration`, `currentTime` del estado del
  reproductor — ya no aplican a un loop de un solo archivo.
- Cualquier código de diagnóstico temporal (panel de diagnóstico del
  artefacto, ya quitado en la iteración anterior de esta misma fase).

### Conservado / implementado

- Música de fondo en **loop infinito**, un solo archivo.
- Play/Pause, Volumen, Mute — funcionando de forma verificada (ver abajo).
- SFX de acierto/error/clic — canal de audio independiente, sin cambios
  en su comportamiento.
- Arranca recién con un gesto real del jugador (ninguna llamada a
  `play()` antes de esa interacción) — cumple la política de autoplay
  del navegador.

### Archivos reales, sin base64

- `public/assets/audio/ambient.mp3` — pista activa (contenido real ya
  entregado por el usuario, "The King"), referenciada desde
  `ASSET_MANIFEST.music.ambient` en `src/config/assetManifest.ts`.
- `public/assets/audio/ambient-alt.mp3` — segunda pista entregada
  ("Hasta el final"), guardada sin referenciar para que el usuario
  pueda activarla más adelante sin tocar código.
- Se eliminó `public/music/` (carpeta vieja, superada).
- Reemplazar la música de acá en más: sobrescribir `ambient.mp3` o
  cambiar el `path` en el manifest — `MusicPlayer.ts` no necesita cambios.

### Verificación real (navegador headless, no simulada)

Se compiló `MusicPlayer.ts` de forma standalone y se corrió contra el
archivo `ambient.mp3` real en Chromium headless (Playwright):

- Estado inicial: `isPlaying: false` — sin autoplay antes del gesto. ✔
- Tras el gesto + `playMusic()`: `isPlaying: true` (el archivo real
  reproduce). ✔
- `setMusicVolume(0.3)` → `volume: 0.3` reflejado correctamente. ✔
- `toggleMusicMute()` → `muted: true/false` alterna correctamente. ✔
- `pauseMusic()` → `isPlaying: false`. ✔
- `toggleMusic()` para reanudar → `isPlaying: true` de nuevo, sin error. ✔

### Nota sobre las dos arquitecturas de audio del proyecto

El artefacto de vista previa (single-file, sin servidor detrás) no
puede cargar archivos desde `public/` — no tiene forma de resolver esa
ruta en tiempo real. Para ese build, la música de fondo es 100%
generativa (Web Audio API: osciladores + filtro, sin archivos ni
base64) — ver `useAmbientMusic()` en el artefacto. Este proyecto
modular, al ser una app Vite real, sí puede (y debe) usar archivos
reales — por eso ambos sistemas cumplen "sin base64" pero de formas
distintas, correctas para cada entorno.

## v1.9 — Verificación final antes del respaldo (2026-07-15)

Verificación exhaustiva pedida antes de cerrar esta fase. Resultado:
**1 problema real encontrado y corregido** (menor, no relacionado con
audio); todo lo demás resuelve correctamente. Ver la sección final
sobre lo que **no** pude comprobar en este entorno.

### 1. `npm run build` — no se pudo ejecutar (documentado, no oculto)

```
npm install
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/@types%2freact
```

Este entorno no tiene acceso a red saliente — `npm install` es
rechazado por el registro de npm, así que no existe forma de instalar
`node_modules` ni de correr `npm run build` real acá. Esto es una
limitación del entorno de verificación, no del proyecto.

### 2. Lo que hice en su lugar (verificación real, no simulada)

**a) Chequeo de sintaxis/tipos de cada archivo TypeScript** — corrí el
compilador de TypeScript sobre los 27 archivos `.ts`/`.tsx` del
proyecto (`tsc -p tsconfig.json --noEmit`), y separé los errores en
dos grupos:
- Esperables por no tener `node_modules` (ej. "Cannot find module
  'react'/'zustand'/'i18next'", tipos JSX genéricos, `import.meta.glob`
  sin los tipos de Vite) — **desaparecen solos en cuanto corras
  `npm install` vos, con acceso a red real.**
- Errores de código genuinos: **encontré 1** —
  `src/config/assetManifest.ts`, parámetro `illustrationFilename` sin
  usar en la función stub `getQuestionIllustrationPath`. **Corregido**
  (renombrado a `_illustrationFilename`, convención ya usada en el
  resto del archivo). Tras la corrección, cero errores de código
  reales restantes.

**b) Rutas de assets — todas verificadas contra el disco real**, no
solo contra el manifest:

| Ruta | Archivo real | Estado |
|---|---|---|
| `/images/backgrounds/bg-menu.webp` | ✓ existe | OK |
| `/images/backgrounds/bg-player-setup.png` | ✓ existe | OK |
| `/images/backgrounds/bg-game.webp` | ✓ existe | OK |
| `/images/backgrounds/bg-score.webp` | ✓ existe | OK |
| `/images/backgrounds/bg-configuration.webp` | ✓ existe | OK |
| `/images/characters/char-celebrate.png` | ✓ existe | OK |
| `/images/icons/lock-open.png` | ✓ existe | OK |
| `/music/track-01.mp3` | ✓ existe | OK |
| `/music/track-02.mp3` | ✓ existe | OK |
| `/sounds/correct.wav`, `/sounds/incorrect.wav` | ✓ existen | OK |
| `/sounds/click.wav`, `/sounds/level-complete.wav`, `/sounds/life-lost.wav` | sin archivo | Pendiente — esperado, documentado, no rompe nada |

**Cero rutas rotas.** Las tres pendientes de SFX están correctamente
documentadas como tal, no son un error.

**c) Cada paquete importado en el código está declarado en
`package.json`** — verificado programáticamente (`react`, `react-dom`,
`zustand`, `i18next`, `react-i18next`, `i18next-browser-languagedetector`
— los 6 aparecen en `dependencies`).

**d) Reproductor de música — API completa revisada para producción**:
`playMusic`, `pauseMusic`, `toggleMusic`, `nextTrack`, `previousTrack`,
`setMusicVolume`, `toggleMusicMute`, `setPlaylist`, `getState`,
`subscribe`, `initMusicPreferences` — todas presentes, consistentes
con `AudioService.ts`, y con el fix de la v1.8 (`isPlaying` derivado de
eventos reales, no optimista) ya incorporado.

### 3. Lo que NO pude comprobar en este entorno (explícito, para que lo pruebes vos)

- **No pude correr `npm install` ni `npm run build` real** — sin
  acceso a red (ver error arriba). El chequeo de TypeScript que sí
  hice es una verificación fuerte de que el código compila
  correctamente, pero no reemplaza un build real de Vite.
- **No pude confirmar la reproducción de audio dentro del Artefacto
  real de Claude.ai** — no tengo forma de abrir/inspeccionar el
  artefacto en vivo desde este entorno de verificación. La v1.8 ya
  incluyó una prueba con un navegador real (Chromium headless vía
  Playwright) fuera del sandbox del artefacto, que confirmó que el
  archivo de audio y la lógica funcionan correctamente en un
  navegador estándar — pero eso no es 100% equivalente al sandbox
  específico del artefacto.

**Para completar la verificación de tu lado:**
```bash
npm install
npm run build     # debe terminar sin errores
npm run dev       # abrir la URL local y confirmar que la música suena
```
Si `npm run build` falla con algo que no sea un típico error de
versión de dependencia, avisame el mensaje exacto y lo reviso.

### Archivos modificados

- `src/config/assetManifest.ts` — parámetro sin usar corregido.

### Verificación de no-regresión

Cero cambios en preguntas, respuestas, puntuación, cronómetro, vidas,
progreso, idioma o persistencia — el único cambio de esta versión es
el nombre de un parámetro no utilizado.

---

## v1.8 — Diagnóstico y corrección del reproductor de música (2026-07-15)

Diagnóstico completo solicitado porque "Play" no producía sonido.
**Causa real encontrada: un bug genuino de manejo de estado**, no una
limitación del entorno — se corrigió. Además se corrigió un problema
real de rutas en el proyecto modular (Vite) encontrado al verificar el
punto 3 del checklist pedido.

### Diagnóstico, punto por punto

1. **¿Los MP3 están físicamente en `public/music/`?** Sí — verificado
   con `ls`. (Antes estaban en `src/assets/music/`, ver punto 3.)
2. **¿Nombres/rutas coinciden exactamente?** Sí, verificado
   directamente contra `ASSET_MANIFEST.music.playlist`.
3. **¿Las rutas se resuelven correctamente vía Vite?** **No — bug real
   encontrado.** `path: "/src/assets/music/track-01.mp3"` es una ruta
   que Vite solo sirve por casualidad en `npm run dev`, y que **se
   rompe en un build de producción real** (`npm run build`) porque
   Vite no copia `src/assets/` al output — solo bundlea lo que se
   importa explícitamente como módulo, o lo que vive en `/public/`.
   **Corregido**: todos los archivos (imágenes, música, sonidos) se
   movieron a `/public/`, y todas las rutas en `assetManifest.ts` y
   `SfxPlayer.ts` ahora son `/images/...`, `/music/...`, `/sonidos/...`
   (root-relative, funciona igual en dev y en build).
4. **¿El navegator exige interacción manual antes de reproducir?**
   Confirmado con una prueba real en Chromium headless (Playwright):
   sin gesto de usuario, `play()` es rechazado con
   `NotAllowedError`; con un clic real, se resuelve exitosamente. El
   flujo ya dispara `music.play()` dentro del clic en "Iniciar".
5. **¿El botón Play llama `audio.play()` con `catch`?** Sí, pero
   **bug real encontrado**: el `catch` estaba vacío
   (`.catch(() => {})`) y el código marcaba `isPlaying = true`
   **incondicionalmente**, sin esperar a que la promesa se resolviera.
   Si `play()` fallaba por cualquier motivo, el botón mostraba
   "Pausa" (como si sonara) sin que sonara nada — exactamente el
   síntoma reportado. **Corregido**: `isPlaying` ahora se deriva
   únicamente de los eventos reales `play`/`pause` que dispara el
   navegador, nunca de una suposición.
6. **¿Pause usa `audio.pause()` sin reiniciar `currentTime`?** Sí,
   ya era correcto — no se toca `currentTime` al pausar.
7. **¿Volumen inicial > 0 y muted = false?** Sí: volumen por defecto
   0.6, muted por defecto false (confirmado en el código).
8. **¿Se indica si un archivo no cargó?** Antes no — **corregido**:
   nuevo estado `lastError`, alimentado tanto por el rechazo de la
   promesa de `play()` como por el evento `error` del elemento
   `<audio>` (con el código de error real: ABORTED/NETWORK/DECODE/
   SRC_NOT_SUPPORTED).
9. **¿Están conectados `loadedmetadata`, `canplay`, `play`, `pause`,
   `ended`, `error`?** Antes solo `ended` — **corregido**: los 6
   eventos están conectados (más `timeupdate` para la barra de
   tiempo).
10. **¿Si una pista falla, se omite y sigue con la siguiente?** Sí,
    ya funcionaba (`findNextPlayableIndex`/`findPreviousPlayableIndex`
    saltan automáticamente las pistas sin archivo o con error).

### Verificación empírica (no especulativa)

Se extrajo el dato base64 real embebido en el artefacto y se cargó en
Chromium headless real (Playwright) para observar el comportamiento
genuino del navegador:
- El archivo decodifica correctamente: `loadedmetadata` confirma
  220.64s de duración (coincide con el original).
- Sin gesto de usuario: `play()` rechazado con `NotAllowedError`
  (política de autoplay real, no un bug).
- Con un clic real simulado: `play()` se resuelve y `currentTime`
  avanza — reproducción genuina confirmada.

Esto aísla la causa al bug de manejo de estado de los puntos 5/8/9
(ya corregido) — no al archivo de audio ni a una limitación
fundamental de la plataforma.

### Panel de diagnóstico temporal (pedido explícitamente)

Nuevo componente `MusicDiagnosticPanel` (visible arriba del control de
música), gateado por `FEATURES.musicDiagnosticsEnabled` (fácil de
apagar en una línea cuando ya no haga falta). Muestra: nombre de la
pista, tipo de ruta resuelta, estado real (Reproduciendo/Pausado/
Error: mensaje exacto), volumen, muted, tiempo actual/duración con
barra de progreso visual.

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- `useMusicPlayer` reescrito: `isPlaying` derivado de eventos reales;
  nuevo estado `duration`, `currentTime`, `lastError`; todo intento de
  `play()` (manual o automático) captura errores reales en vez de
  silenciarlos.
- Nuevo componente `MusicDiagnosticPanel` + `FEATURES.musicDiagnosticsEnabled`.

**Proyecto modular** (`/src` y `/public`, nuevo):
- **Reestructuración de assets**: `src/assets/images|music|sounds/*`
  → `public/images|music|sounds/*`. `src/assets/` ahora solo tiene un
  README explicando el cambio.
- `assetManifest.ts` — todas las rutas actualizadas a `/images/...`,
  `/music/...`.
- `SfxPlayer.ts` — rutas actualizadas a `/sounds/...`.
- `MusicPlayer.ts` — mismo fix de `isPlaying` basado en eventos reales.
- READMEs de cada categoría movidos a `public/` y actualizados.

### Verificación de no-regresión

Cero cambios en preguntas, respuestas, puntuación, cronómetro, vidas,
progreso, idioma o persistencia (diff línea por línea contra v1.7,
excluyendo los datos base64).

### Limitación honesta de esta verificación

No pude ejecutar `npm install` (sin acceso a red en este entorno) ni
abrir el Artefacto real de Claude.ai para observarlo directamente —
la verificación en navegador real se hizo con un Chromium headless
aislado (Playwright), cargando el mismo dato de audio embebido, fuera
del sandbox específico del artefacto. Es una prueba fuerte de que el
archivo y la lógica funcionan en un navegador estándar, pero no
descarta 100% alguna restricción propia del sandbox del artefacto que
no pueda replicar acá. El panel de diagnóstico temporal está pensado
exactamente para cerrar esa brecha: si al probarlo en el artefacto
real seguís sin escuchar nada, el panel debería mostrar un
`lastError` concreto en vez de fallar en silencio.

### Cómo probar

1. Abrir el artefacto, tocar "Iniciar".
2. Mirar el panel "🔧 Diagnóstico de audio" — debería decir "▶
   Reproduciendo" y la barra de tiempo debería avanzar.
3. Si dice "Pausado" o "Error: ...", ese mensaje exacto es la próxima
   pista a seguir — copiámelo y seguimos desde ahí.

---

## v1.7 — Primeras 2 canciones integradas + botón Previous (2026-07-15)

Se integraron las primeras 2 pistas reales de la playlist (`The King`,
`Hasta el final`), y se agregó el botón Previous con la lógica exacta
pedida (reiniciar vs. pista anterior según los 3 segundos).

### Pistas integradas en esta versión

| Pista | Título | Estado |
|---|---|---|
| track-01 | The King | ✅ Integrada |
| track-02 | Hasta el final | ✅ Integrada (reemplaza el título "Glory Trap" de la playlist preparada en v1.6 — el usuario entregó esta canción en su lugar) |
| track-03 a track-08 | — | Pendientes |

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Nuevas constantes `TRACK_01_DATA_URI`, `TRACK_02_DATA_URI` — los MP3
  entregados, comprimidos a 48kbps mono para poder incrustarlos
  (`track-01`: 5.26MB → 1.68MB en base64; `track-02`: 4.2MB → 1.39MB
  en base64). **Nota de calidad**: a este bitrate el audio pierde
  fidelidad notablemente respecto al original — aceptable para música
  de fondo a bajo volumen, pero si querés la calidad completa sonando
  en la vista previa en vivo del artefacto, la alternativa es alojar
  los MP3 en una URL pública tuya.
- `ASSET_MANIFEST.music.playlist` — track-01 y track-02 con sus
  `path` reales.
- Nueva función `findPreviousPlayableIndex` (misma lógica que
  `findNextPlayableIndex`, buscando hacia atrás).
- `useMusicPlayer` — nueva función `previous()`: si la pista lleva
  más de 3s, reinicia (`currentTime = 0`); si lleva menos, retrocede a
  la pista anterior disponible (con loop: desde la primera vuelve a la
  última). Verificado con simulación.
- `MusicControlBar` — nuevo botón Previous (ícono `SkipBack`), y la
  barra ahora es responsive: en pantallas angostas (≤420px) oculta el
  título de la canción y angosta el control de volumen, para no tapar
  preguntas ni botones en móvil.
- Todo lo demás del reproductor (play/pausa, next, mute, volumen,
  persistencia, canal independiente de SFX, "nunca se reinicia al
  cambiar de pantalla") — **sin cambios**, ya cumplía lo pedido.

**Proyecto modular** (`/src`):
- `src/assets/music/track-01.mp3`, `track-02.mp3` — archivos
  originales del usuario, calidad completa, sin comprimir.
- `src/config/assetManifest.ts` — rutas reales actualizadas.
- `src/services/audio/MusicPlayer.ts` — `previousTrack()` agregada,
  mismo diseño que el artefacto.
- `src/services/audio/AudioService.ts`, `index.ts` — interfaz y
  export actualizados.
- `src/assets/music/README.md` — estado actual de la playlist.

### Verificación de no-regresión

Cero cambios en preguntas, respuestas, puntuación, cronómetro, vidas,
progreso, idioma o persistencia (diff línea por línea contra v1.6,
excluyendo los datos base64 de audio).

### Errores conocidos / limitaciones

- Quedan 6 pistas pendientes (track-03 a track-08).
- El audio incrustado en el artefacto suena con calidad reducida
  (48kbps mono) por el tamaño — ver nota arriba.
- Quedan pendientes `char-encourage`, ícono de candado cerrado, y las
  ilustraciones de preguntas.
- Sin animaciones ambientales todavía.

### Cómo probar

Abrir el artefacto, tocar "Iniciar" (necesario para desbloquear el
autoplay del navegador), y confirmar: la música suena de fondo,
Play/Pausa/Siguiente/Anterior/Silenciar responden, el volumen se
guarda, y nada se reinicia al cambiar de pantalla.

---

## v1.6 — Playlist de 8 canciones + reproductor robustecido (2026-07-15)

Se preparó la estructura completa de la playlist de música de fondo
(8 pistas, orden definido, todavía sin archivos reales) y se corrigió
un caso importante: el reproductor ahora salta automáticamente
cualquier pista sin archivo en vez de quedarse trabado, permitiendo
agregar canciones fuera de orden.

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- `ASSET_MANIFEST.music.playlist` — 8 entradas en el orden pedido
  ("The King", "Glory Trap", Canción 3-8), todas con `path: null`.
- Nueva función `findNextPlayableIndex(list, fromIndex)` — busca la
  próxima pista con archivo real, saltando las vacías, con loop al
  llegar al final. Verificada con simulación: sin archivos no
  reproduce nada; con una sola pista la repite en loop; con pistas
  fuera de orden (ej. solo 1, 2, 5 y 6) cicla correctamente solo entre
  esas cuatro.
- `useMusicPlayer` — `play()`, `next()`, y el listener `ended`
  reescritos para usar `findNextPlayableIndex` en vez de avanzar a
  ciegas al índice siguiente.
- Controles existentes (play/pausa, siguiente, silenciar, volumen) y
  la persistencia de la preferencia de volumen — **sin cambios**, ya
  cumplían lo pedido.
- Autoplay al iniciar sesión — **sin cambios**: ya se dispara dentro
  del gesto de tocar "Iniciar", que es el único punto de entrada a la
  app, así que la música ya suena de fondo para cuando arranca
  cualquier partida (no hizo falta agregar otro punto de disparo).

**Proyecto modular** (`/src`):
- `src/config/assetManifest.ts` — playlist de 8 pistas sincronizada.
- `src/services/audio/MusicPlayer.ts` — mismo fix de
  `findNextPlayableIndex` portado.
- `src/assets/music/README.md` — estado actual de la playlist y cómo
  agregar cada archivo.

### Confirmación de requisitos ya cumplidos sin cambios

- Reproducción secuencial en el orden de la playlist ✓ (ya existía)
- Loop infinito al llegar a la última pista ✓ (ya existía)
- Nunca se reinicia al cambiar de pantalla ✓ (vive en App(), nunca se desmonta)
- Solo se reinicia al recargar la app desde cero ✓ (estado en memoria, nunca persistido)
- Escala a cualquier cantidad de pistas sin tocar el reproductor ✓
  (todo opera sobre `playlist.length`, nunca sobre un número fijo)

### Verificación de no-regresión

Cero cambios en preguntas, respuestas, puntuación, cronómetro, vidas,
progreso, idioma o persistencia — el diff completo (101 líneas) está
contenido en el reproductor de música y la playlist (diff línea por
línea contra v1.5).

### Errores conocidos / limitaciones

- Ninguna de las 8 pistas tiene archivo real todavía — los controles
  se muestran y son clickeables, pero no suena nada hasta agregar al
  menos un .mp3 o una URL pública.
- Quedan pendientes `char-encourage`, ícono de candado cerrado, y las
  ilustraciones de preguntas.
- Sin animaciones ambientales todavía (ver v1.5 — es el siguiente paso
  acordado, después de la música).

### Cómo probar

Abrir el artefacto — los controles de música (esquina inferior
derecha) deben seguir mostrándose y respondiendo a los clics
normalmente. No debería sonar nada todavía (esperado, sin archivos).

---

## v1.5 — Fondo de Configuración — 5/5 fondos principales completos (2026-07-15)

Se integró `bg-configuration`, entregado por el usuario: interior
contemplativo con vela, pergamino y vista al lago por la ventana.
**Con este recurso quedan completos los 5 fondos principales del
juego** (menú, jugador, juego, puntuación, configuración).

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Nueva constante `BG_CONFIGURATION_DATA_URI` (67.8KB).
- `ASSET_MANIFEST.backgrounds.configuration.path` — apunta al recurso real.
- `ConfigurationScreen` — usa `backgroundOverlay={0.12}` y
  `panelVariant="glass"`, reutilizando el mismo `GlassPanel` construido
  para Puntuación (glassmorphism, sin bloques grises opacos, bordes
  suaves, sombra ligera) — cero código nuevo necesario, exactamente el
  punto de tener `panelVariant` como variante reutilizable de
  `ScreenShell` en vez de un caso especial.

**Proyecto modular** (`/src`):
- `src/assets/images/backgrounds/bg-configuration.webp` — conversión
  WebP en alta calidad (95%) del archivo entregado.
- `src/config/assetManifest.ts` — ruta real actualizada.
- `src/assets/images/README.md` — los 5 fondos marcados como completos.

### Verificación de no-regresión

Cero cambios en preguntas, respuestas, puntuación, cronómetro, vidas,
progreso, idioma o persistencia (diff línea por línea contra v1.4,
excluyendo los datos base64 de imágenes). El selector de idioma y el
selector de dificultad por defecto de esta pantalla no se tocaron.

### Errores conocidos / limitaciones

- Los 5 fondos principales están completos. Quedan pendientes:
  `char-encourage`, ícono de candado cerrado, y las ilustraciones de
  preguntas (0 de 40).
- **Sin animaciones ambientales todavía** — según el plan acordado,
  ahora que los 5 fondos están listos, el siguiente paso natural es
  diseñar el sistema conjunto y reutilizable de animaciones
  ambientales para los cinco, en vez de resolverlas una por una.

### Cómo probar

Abrir el artefacto y entrar a Configuración desde el menú — el fondo
(interior con vista al lago) debe verse con oscurecimiento sutil, y
los controles de idioma/dificultad deben estar sobre el mismo panel
translúcido que ya viste en Puntuación.

---

## v1.4 — Fondo de Puntuación + panel "glass" (2026-07-15)

Se integró `bg-score`, entregado por el usuario: una cruz en la cima
de una colina con rayos de luz sobre el mismo paisaje del Mar de
Galilea. Coherente con la dirección de arte establecida. Esta pantalla
además recibió un tratamiento visual nuevo (panel translúcido) porque
el usuario pidió que la tabla se sintiera "parte del entorno" en vez
de flotar sobre él.

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Nueva constante `BG_SCORE_DATA_URI` (104KB).
- `ASSET_MANIFEST.backgrounds.score.path` — apunta al recurso real.
- Nuevo componente `GlassPanel` — alternativa a `ComicPanel`: bordes
  suaves, relleno translúcido (88% opacidad, mantiene excelente
  contraste de texto), `backdrop-filter: blur(10px)` para integrar
  visualmente el paisaje detrás, sombra difusa en vez del desnivel
  "cómic" duro.
- `ScreenShell` — nuevo prop `panelVariant` (`"comic"` por defecto,
  cero cambio para el resto de las pantallas; `"glass"` activa el
  panel nuevo). Diseñado como variante reutilizable, no como caso
  especial de una sola pantalla.
- `ScoreBoard` — usa `backgroundOverlay={0.12}` y
  `panelVariant="glass"`; se agregó un comentario marcando dónde
  insertar estadísticas del jugador a futuro (Fase 6) sin rediseñar la
  pantalla — sin ningún elemento visible todavía, seguiendo el mismo
  criterio de "nunca mostrar una caja vacía" ya establecido.

**Proyecto modular** (`/src`):
- `src/assets/images/backgrounds/bg-score.webp` — conversión WebP en
  alta calidad (95%) del archivo entregado.
- `src/config/assetManifest.ts` — ruta real actualizada.
- `src/assets/images/README.md` — movido de pendiente a entregado.

### Verificación de no-regresión

Cero cambios en preguntas, respuestas, puntuación, cronómetro, vidas,
progreso, idioma o persistencia — incluida la lógica de reiniciar/
borrar jugador de esta misma pantalla, que no se tocó (diff línea por
línea contra v1.3, excluyendo los datos base64 de imágenes).

### Errores conocidos / limitaciones

- Queda pendiente 1 fondo (`bg-configuration`), `char-encourage`,
  ícono de candado cerrado, y las ilustraciones de preguntas.
- `GlassPanel`/`panelVariant` solo existen en el artefacto — el
  proyecto modular (`/src`) todavía no tiene las pantallas que los
  consumirían.
- Sin animaciones ambientales todavía, a propósito.

### Cómo probar

Abrir el artefacto y entrar a Puntuación desde el menú — el fondo
(cruz + colina + luz) debe verse con oscurecimiento sutil, y la tabla
debe estar sobre un panel translúcido con bordes suaves en vez de la
tarjeta opaca de bordes gruesos que usan las demás pantallas.

---

## v1.3 — Fondo de la pantalla de juego (2026-07-15)

Se integró `bg-game`, entregado por el usuario: Jesús enseñando a la
multitud junto al Mar de Galilea. Coherente con la dirección de arte
ya establecida (misma familia de atardecer/hora dorada que `bg-menu`
y `bg-player-setup`).

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Nueva constante `BG_GAME_DATA_URI` (imagen optimizada a 117.5KB,
  calidad más alta que los recursos anteriores para no perder detalle,
  según lo pedido).
- `ASSET_MANIFEST.backgrounds.game.path` — apunta al recurso real.
- El fondo de la pantalla de juego (donde aparecen las preguntas) usa
  un overlay del **12%**, más sutil que el 25% del resto — decisión
  deliberada: ahí el contenido vive sobre un `ComicPanel` opaco, no
  directo sobre la imagen, así que solo hacía falta atenuar el fondo
  un poco, no garantizar contraste de texto. La pantalla de ánimo (al
  perder vidas) y la de "juego completado" también usan `bg-game`,
  pero a través de `ScreenShell` con su 25% por defecto — no se tocó
  ese comportamiento.
- **Sin animaciones ambientales** — según lo pedido, se deja para
  cuando estén los 5 fondos y se implemente un sistema conjunto.
- El slot de ilustración de preguntas ya no mostraba un cuadro gris
  vacío desde una fase anterior — se confirmó que ese comportamiento
  sigue intacto (nunca se llegó a modificar).

**Proyecto modular** (`/src`):
- `src/assets/images/backgrounds/bg-game.webp` — conversión a WebP en
  alta calidad (95%) del archivo entregado, resolución completa.
- `src/config/assetManifest.ts` — ruta real actualizada.
- `src/assets/images/README.md` — movido de pendiente a entregado.

### Verificación de no-regresión

Cero cambios en la lógica de preguntas, respuestas, puntuación,
cronómetro, vidas, progreso, idioma o persistencia (diff línea por
línea contra v1.2, excluyendo los datos base64 de imágenes).

### Errores conocidos / limitaciones

- Quedan pendientes 2 fondos (`bg-score`, `bg-configuration`),
  `char-encourage`, ícono de candado cerrado, y las ilustraciones de
  preguntas.
- Sin animaciones ambientales todavía, a propósito.

### Cómo probar

Abrir el artefacto, crear o continuar un jugador, y entrar a una
pregunta — el fondo debe verse con un oscurecimiento apenas
perceptible detrás de la tarjeta de pregunta.

---

## v1.2 — Fondo de selección de jugador (2026-07-15)

Se integró `bg-player-setup`, entregado por el usuario, siguiendo la
guía de dirección de arte (`STYLE_GUIDE.md`). También se generalizó el
overlay oscuro para que cualquier fondo futuro lo herede sin código
adicional.

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Nueva constante `BG_PLAYER_SETUP_DATA_URI` en la sección de recursos
  incrustados (imagen optimizada a 84.5KB).
- `ASSET_MANIFEST.backgrounds.playerSetup.path` — ahora apunta al
  recurso real.
- `ScreenShell` — nuevo prop `backgroundOverlay` (default `0.25`,
  aplicado automáticamente a cualquier `backgroundAsset` que reciba).
  `PlayerSetup` y `PlayerProgress` ya pasaban
  `backgroundAsset={ASSET_MANIFEST.backgrounds.playerSetup}` desde la
  fase anterior — no necesitaron ningún cambio para mostrar el fondo.

**Proyecto modular** (`/src`):
- `src/assets/images/backgrounds/bg-player-setup.png` — archivo
  original del usuario, sin modificar.
- `src/config/assetManifest.ts` — ruta real actualizada.
- `src/assets/images/README.md` — movido de pendiente a entregado.

### Nota de dirección de arte

Estilo, iluminación cálida y paleta consistentes con `bg-menu` (misma
familia de atardecer/hora dorada sobre el Mar de Galilea). El verde de
la vegetación y las flores son algo más saturados que en `bg-menu` —
no bloqueé la integración por eso, pero queda anotado por si se quiere
ajustar en una revisión de arte más adelante.

### Verificación de no-regresión

Cero cambios en la lógica de preguntas, respuestas, vidas, puntuación,
cronómetro, jugadores, idiomas o progreso (diff comparado línea por
línea contra v1.1, excluyendo los datos base64 de las imágenes).

### Errores conocidos / limitaciones

- Quedan pendientes 3 fondos (`bg-game`, `bg-score`,
  `bg-configuration`), `char-encourage`, ícono de candado cerrado, y
  las ilustraciones de preguntas.
- El overlay del 25% ahora es automático en `ScreenShell` para
  cualquier pantalla con fondo — si algún fondo futuro necesita un
  valor distinto, se puede pasar `backgroundOverlay` explícito en ese
  llamado.

### Cómo probar

Abrir el artefacto — la pantalla de selección de jugador (botón
"Jugar" desde el menú, y también la pantalla de progreso de un
jugador existente) debe mostrar el nuevo fondo con la superposición
oscura.

---

## v1.1 — Primeros 3 recursos reales integrados (2026-07-15)

Regla permanente de dirección de arte establecida — ver
`STYLE_GUIDE.md` en la raíz de este proyecto. Se integraron los
primeros 3 recursos de prueba, entregados por el usuario, exactamente
con el comportamiento que especificó.

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Nueva sección "0. Recursos incrustados (base64)" — las 3 imágenes
  entregadas, optimizadas (95.6KB / 47.6KB / 12.6KB) y embebidas
  directamente porque el artefacto no puede leer archivos locales del
  usuario ni cargar URLs propias.
- `ASSET_MANIFEST` — `backgrounds.menu`, `characters.celebrate`, y
  nuevo `icons.lockOpen` ahora apuntan a esos datos embebidos.
- `AssetBackground` — nuevo prop opcional `overlayOpacity` (default 0,
  no rompe usos existentes) para la capa negra del 25% pedida sobre
  `bg-menu`.
- `MainMenu` — aplica `overlayOpacity={0.25}` sobre su fondo.
- `LevelCompleteAnimation` — reescrita para usar `char-celebrate.png`
  (entrada con fade+slide, flotado con salto/escala/balanceo, brillo
  radial detrás, salida con fade, ~2s total) y `lock-open.png` (escala
  + rotación + brillo) en las etapas correspondientes — **con fallback
  automático a los íconos de lucide-react ya probados** cuando el
  recurso no está disponible (así sigue funcionando igual para
  cualquier instalación futura de este artefacto sin estos archivos).
- Nuevas clases CSS: `.char-celebrate-img`, `.char-celebrate-float`,
  `.icon-asset-lock` (tamaños responsivos exactos pedidos: personaje
  38%/45% alto móvil/escritorio, candado 130px/200px).

**Proyecto modular** (`/src`):
- `src/assets/images/backgrounds/bg-menu.webp`,
  `src/assets/images/characters/char-celebrate.png`,
  `src/assets/images/icons/lock-open.png` — archivos originales del
  usuario, sin modificar, en las rutas exactas que especificó.
- `src/config/assetManifest.ts` — actualizado con esas 3 rutas reales
  y el nuevo bloque `icons`.

### Verificación de no-regresión

Se comparó línea por línea contra el respaldo v1.0: cero cambios en
`handleAnswer`, `handleNext`, `selectQuestionsForLevel`,
`recordAnswered`, `resetProgress`, `handleLevelComplete`,
`handleLifeLossReset`, `handleQuestionAnswered`, `handleSubmitName`,
`handleSetLanguage`, `handleSetDefaultDifficulty`,
`handleSetPlayerDifficulty`, `slugify`, `createPlayerProfile`, ni las
constantes de configuración del juego (vidas, puntos, niveles,
segundos por dificultad).

### Errores conocidos / limitaciones

- El personaje y el candado nuevo solo se ven en la animación de
  **nivel completado**. Todavía no hay recurso para la pantalla de
  ánimo al perder vidas (`char-encourage`) ni para el candado cerrado
  — siguen usando los íconos de lucide-react.
- Los otros 4 fondos (jugador, juego, puntuación, configuración) siguen
  sin imagen — se ve el color de fondo normal, sin overlay.
- El proyecto modular (`/src`) todavía no tiene las pantallas
  (`src/screens/`) que consumirían estos assets — los archivos están
  listos y el manifest los referencia, pero la integración visual
  completa (fondos con overlay, animación del personaje) solo existe
  hoy en el artefacto.

### Cómo probar

Abrir `/artifact/historia-de-jesus.jsx` como Artefacto en Claude —
o el archivo publicado en el chat. Ver la lista de pruebas específica
de estos 3 recursos en la respuesta del chat.

---

## v1.0 — Fase de integración audiovisual (2026-07-15)

Primer respaldo bajo la nueva regla permanente del proyecto: ZIP
versionado al final de cada fase, nunca sobrescribe el anterior, con
este resumen incluido.

### Archivos modificados

**Artefacto** (`/artifact/historia-de-jesus.jsx`):
- Imports: se agregaron los íconos `Pause`, `SkipForward`, `Volume2`,
  `VolumeX` (además de los ya usados `Sparkles`, `Lock`, `Unlock`,
  `HeartHandshake` de la Fase 4).
- Nueva sección 1.5 "Asset Manifest": `ASSET_MANIFEST`,
  `getQuestionIllustrationAsset()`, `AssetImage`, `AssetBackground`.
- `audio`: se quitó el stub `playMusic` (reemplazado por el sistema
  real más abajo); `playVoice` sigue como stub.
- Nuevo `useMusicPlayer()` — hook de playlist con loop, independiente
  del canal de SFX.
- Nuevo componente `MusicControlBar`.
- `ScreenShell` — nuevo prop opcional `backgroundAsset` (no rompe
  llamadas existentes, default `null`).
- `MainMenu`, `GameScreen` (render principal) — capa de fondo agregada
  (invisible sin recurso real).
- `QuestionCard` — slot de ilustración agregado arriba del enunciado.
- `PlayerSetup`, `PlayerProgress`, `ConfigurationScreen`, `ScoreBoard`,
  `EncouragementScreen`, pantalla final de nivel 10 — pasan su
  `backgroundAsset` correspondiente a `ScreenShell`.
- `App()` — nuevo estado `musicVolume`/`musicMuted`, cargados/guardados
  junto a `language`/`defaultDifficulty`; instancia `useMusicPlayer`;
  dispara el primer `play()` dentro del gesto de clic en "Iniciar";
  monta `MusicControlBar` fuera del bloque de pantallas condicionales.
- STRINGS (ES/EN) — nuevas claves para los controles de música.

**Proyecto modular** (`/src`):
- Nuevo `src/config/assetManifest.ts`.
- `src/services/audio/MusicPlayer.ts` — reescrito de stub a
  implementación real (mismo diseño que el artefacto).
- `src/services/audio/AudioService.ts` — interfaz actualizada al nuevo
  API de música (playlist, no track-por-id).
- `src/services/audio/index.ts` — actualizado a los nuevos exports.
- `src/config/features.ts` — `backgroundMusic: false -> true`.
- `src/assets/music/README.md`, `src/assets/images/README.md` —
  reescritos con el checklist de recursos pendientes.
- `README.md` — nueva sección de regla permanente + checklist de
  assets necesarios.

### Funciones/componentes añadidos

`useMusicPlayer`, `MusicControlBar`, `AssetImage`, `AssetBackground`,
`getQuestionIllustrationAsset` (artefacto) · `MusicPlayer.ts` real,
`assetManifest.ts` (proyecto modular).

### Verificación de no-regresión

Se comparó línea por línea contra el respaldo anterior
(`historia-de-jesus-respaldo.zip`): el diff no toca ninguna línea de
`handleAnswer`, `handleNext`, `selectQuestionsForLevel`,
`recordAnswered`, `resetProgress`, `handleLevelComplete`,
`handleLifeLossReset`, `handleQuestionAnswered`, ni las constantes
`STARTING_LIVES`/`POINTS_PER_LEVEL`/`MAX_SCORE` — la lógica de
preguntas, vidas, puntuación, niveles y persistencia queda intacta.

### Errores conocidos / limitaciones

- **La playlist de música está vacía** — no hay archivos .mp3 todavía.
  Los controles se muestran y funcionan (se pueden clickear), pero no
  suena nada hasta agregar pistas reales.
- **Ningún fondo, personaje ni ilustración de pregunta tiene imagen
  real todavía** — todos muestran su placeholder (o, en personajes,
  el ícono animado ya probado de la Fase 4).
- **Restricción de plataforma**: dentro del Artefacto de Claude, todo
  `path` debe ser una URL https:// pública — no hay forma de leer
  archivos locales de la computadora del usuario directamente en la
  vista previa en vivo.
- El proyecto modular (`/src`) no tiene `node_modules` instalados (sin
  acceso a red en este entorno) — no se pudo correr `npm install` ni
  probar en un navegador real. El artefacto SÍ está probado (sintaxis
  validada con TypeScript en modo `--allowJs`, y la lógica de vidas se
  verificó con simulaciones en fases anteriores).

### Cómo probar

**Artefacto** (recomendado, es la versión jugable): abrir
`/artifact/historia-de-jesus.jsx` en Claude como Artefacto. Ver la
lista de pruebas de esta fase en la respuesta del chat.

**Proyecto modular**: `cd historia-de-jesus && npm install && npm run dev`
(no probado en este entorno por falta de red).
