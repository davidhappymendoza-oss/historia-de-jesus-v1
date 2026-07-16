# Este directorio ya no aloja archivos reales

Los archivos de imagen/audio se movieron a `/public/` (ver
CHANGELOG.md v1.8), porque Vite solo garantiza que una ruta como
`/musica/track-01.mp3` funcione en `npm run dev` **y** en
`npm run build` si el archivo vive en `public/` — referenciarlo desde
`src/assets/` como string plano (sin `import`) solo funcionaba por
casualidad en modo desarrollo y se rompía en el build de producción.

Ver:
- `/public/images/` — fondos, personajes, íconos
- `/public/assets/audio/` — música de fondo (un solo archivo real en loop, sin playlist)
- `/public/sounds/` — efectos de sonido
- `/public/animations/`, `/public/voices/` — reservados, vacíos todavía
