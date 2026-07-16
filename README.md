# Historia de Jesús

Videojuego educativo interactivo basado en los cuatro Evangelios (Mateo,
Marcos, Lucas, Juan). Developed by OTSV.

## 📌 Regla permanente de este proyecto

Al finalizar cada fase o modificación importante: se genera un ZIP
completo versionado (nunca se sobrescribe el anterior), con un resumen
de archivos modificados, funciones añadidas, errores conocidos, y
pasos para ejecutar el proyecto. No se avanza a la siguiente fase hasta
que el usuario confirma que descargó y probó el ZIP.

## 🎨 Fase de integración audiovisual (actual)

Se agregó un sistema modular de recursos (`src/config/assetManifest.ts`
en este scaffold, y su equivalente dentro de `/artifact/historia-de-jesus.jsx`):
fondos por pantalla, ilustraciones de preguntas, personajes, y una
playlist de música de fondo con controles de volumen/silencio/pausa/
siguiente, en un canal de audio independiente de los efectos de
correcto/incorrecto. Todo funciona con "recursos vacíos" (`path: null`)
sin romper nada — ver el checklist de qué hace falta más abajo.

### Qué necesito de vos para activar los recursos reales

**Fondos de pantalla** (5 slots: menú, jugador, juego, puntuación,
configuración) — ver `public/images/README.md`.

**Personajes** (celebración de nivel, ánimo tras perder vidas) — ver
`public/images/README.md`.

**Ilustraciones de preguntas** — una por pregunta, el nombre esperado
ya está en el campo `illustration` de cada pregunta en
`src/data/questions/*.json`. Pueden entregarse progresivamente.

**Música** — cuántas pistas, título de cada una, y el archivo o una
URL pública — ver `public/music/README.md`.

**Importante:** dentro del Artefacto de Claude, cualquier imagen o
audio tiene que ser una **URL https:// pública**, porque el artefacto
no puede leer archivos de tu computadora directamente. Si me subís los
archivos al chat, sí los puedo incorporar a este proyecto de respaldo
(para un despliegue real fuera de Claude), pero no sonarán/mostrarán
en la vista previa en vivo del artefacto a menos que además existan en
una URL pública.

No coloco ningún recurso "por intuición" — si falta un dato de los de
arriba para un archivo puntual, lo pregunto antes de tocar el proyecto.

## ⚠️ Estado de este respaldo — leer primero

El desarrollo activo ocurre como un **Artefacto interactivo de una sola
página** (para poder probarlo en vivo), no en esta estructura modular.
Este ZIP es un **respaldo**, no el entorno de desarrollo principal.

- **`/artifact/historia-de-jesus.jsx`** — el juego completo y funcional
  tal como está probado hoy: Fases 1 a 4 completas (menú, jugador,
  motor de juego con cronómetro/vidas/puntuación, banco de 40 preguntas,
  dificultad, Puntuación con reinicio/borrado por jugador, animaciones
  de nivel completado y de ánimo, e intro del estudio OTSV con pantalla
  "Iniciar"). **Esta es la fuente de verdad funcional.**
- **`/src/`** (el resto de este proyecto) — el scaffold modular en
  TypeScript de la **Fase 0**, pensado como la arquitectura de destino
  para un futuro build de producción real (Vite + React + TS, sin las
  restricciones de un artefacto de un solo archivo).
  - El **banco de preguntas** (`src/data/questions/*.json`) SÍ está
    sincronizado — son las mismas 40 preguntas del artefacto, ya
    divididas por categoría en el formato modular original.
  - La **lógica del motor de juego, las pantallas, y los stores**
    (`src/screens`, buena parte de `src/store`) todavía NO están
    portados desde el artefacto — hoy esa lógica solo existe dentro de
    `historia-de-jesus.jsx`. Portarla es el trabajo pendiente para
    cuando este proyecto pase de "artefacto de prueba" a "build de
    producción descargable".

Si querés seguir probando el juego, abrí `/artifact/historia-de-jesus.jsx`
como Artefacto en Claude. Si querés continuar el build de producción
real, este scaffold (`/src`) es el punto de partida arquitectónico.

## Cómo correr el scaffold modular

Requiere Node.js 18+.

```bash
npm install
npm run dev
```

> Generado sin acceso a red en el entorno de Claude — el `npm install`
> no fue probado en un navegador real. La estructura sigue las
> convenciones estándar de Vite + React + TypeScript.

## Qué incluye el scaffold modular (Fase 0 + banco de preguntas actualizado)

- **Modelo de datos completo** (`src/types`): `Question` con evangelio,
  capítulo, versículos, personajes, ubicación, categoría, contexto
  histórico/cultural, enseñanza principal, palabras clave e ilustración
  — más `Player`, `AppSettings`, `PlayerStatistics`, `AchievementDefinition`.
- **Banco de preguntas 100% en JSON, sincronizado con el artefacto**:
  40 preguntas reales repartidas en `milagros.json` (6), `parabolas.json` (8),
  `bienaventuranzas.json` (8), `personajes.json` (6), `lugares.json` (4),
  `ensenanzas.json` (4), `profecias.json` (2), `cronologia.json` (2) —
  auto-descubiertas por Vite (`import.meta.glob`) vía
  `src/data/questions/manifest.ts`. El resto del banco (~1000) se agrega
  en la Fase 5 de la misma forma, sin tocar código.
- **Sistema anti-repetición** (`src/services/questions/randomizer.ts`):
  mismo algoritmo que usa el artefacto — historial por jugador, ciclo
  completo antes de repetir.
- **Almacenamiento con adapter pattern** (`src/services/storage`):
  `LocalStorageAdapter` activa hoy, `CloudStorageAdapter` como stub.
- **Servicio de audio con 3 canales** (`src/services/audio`):
  `playSfx` implementado; `playMusic`/`playVoice` como stubs.
- **Feature flags centralizados** (`src/config/features.ts`).
- **i18n ES/EN** para la interfaz (`src/services/i18n`, `src/locales/*.json`).
- **Tema visual** (`tailwind.config.js`): paleta "manuscrito iluminado".
- **Stores de Zustand**: `settingsStore`, `statisticsStore`.
- **Sistema modular de recursos** (`src/config/assetManifest.ts`):
  fondos, personajes e ilustraciones de preguntas — reemplazar un
  recurso es editar solo este archivo.
- **Música de fondo real** (`src/services/audio/MusicPlayer.ts`):
  playlist con loop, controles de play/pausa/siguiente/volumen/mute,
  canal de audio independiente de los efectos de correcto/incorrecto
  (`SfxPlayer.ts`). Playlist vacía hasta agregar pistas reales.

## Qué está en el artefacto pero NO portado a este scaffold todavía

> Nota: el manifest de recursos y el servicio de música SÍ están
> portados (capa de datos/lógica). Lo que falta portar es la UI que
> los consume — `MusicControlBar`, las capas de fondo por pantalla, y
> el slot de ilustración en la tarjeta de pregunta — porque las
> pantallas (`src/screens/`) todavía no existen en este scaffold.

- Pantallas reales (Menú, Jugador, Configuración, Puntuación, Juego)
- Motor de juego completo (cronómetro, vidas, puntuación, `VerseRevealCard`)
- Selector de dificultad real, reinicio/borrado de jugador desde Puntuación
- Animación de nivel completado (mensajes aleatorios + candado) y pantalla
  de ánimo al perder las 5 vidas
- Intro del estudio OTSV (pantalla "Iniciar" + logo + frase bíblica)
- Registro de avances por nivel (`levelHistory`)

## Estructura

```
artifact/
  historia-de-jesus.jsx   <- el juego completo y funcional (fuente de verdad)
public/
  images/       fondos, personajes, iconos (servido por Vite desde la raiz)
  music/        playlist
  sounds/       efectos de sonido
  animations/, voices/   reservados, vacios todavia
src/
  assets/       solo un README explicando que los archivos viven en /public/
  components/   UI reutilizable (aun vacio - pendiente de portar)
  screens/      pantallas del juego (aun vacio - pendiente de portar)
  store/        settingsStore, statisticsStore (Zustand)
  services/
    storage/    StorageAdapter, LocalStorageAdapter, CloudStorageAdapter (stub)
    audio/      AudioService, SfxPlayer, MusicPlayer (real), VoicePlayer (stub)
    questions/  questionLoader, randomizer (anti-repeticion)
    i18n/       configuracion de i18next
  data/questions/  banco de preguntas en JSON (sincronizado, 40 preguntas) + manifest
  config/       features.ts, difficulty.ts, levels.ts, assetManifest.ts
  types/        Question, Player, Settings, Statistics, Achievements
  locales/      es.json, en.json (strings de interfaz)
```
