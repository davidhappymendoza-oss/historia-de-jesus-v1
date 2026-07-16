/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // Preparado para Modo Oscuro futuro: se activa agregando la clase "dark"
  // al <html>. No se implementa el toggle todavía (ver src/store/settingsStore.ts).
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Sistema de color "manuscrito iluminado": noche de Belén + oro de halo,
        // en vez de la paleta crema+terracota genérica.
        ink: {
          DEFAULT: "#1A1F3C", // fondo de panel, cielo nocturno
          light: "#2C3466",
          dark: "#0F1226",
        },
        parchment: {
          DEFAULT: "#F5E8C9", // pergamino cálido, tarjetas de pregunta
          light: "#FBF3DE",
          dark: "#E4D3A3",
        },
        halo: {
          DEFAULT: "#E8B94A", // oro de halo — correcto, logros, luz
          light: "#F5D785",
          dark: "#C99A2E",
        },
        clay: {
          DEFAULT: "#C0603D", // arcilla — incorrecto, advertencias, acentos puntuales
          light: "#D98363",
          dark: "#9A4A2E",
        },
        olive: {
          DEFAULT: "#6E7F4B", // oliva — estados secundarios, naturaleza
          light: "#8A9E63",
          dark: "#556238",
        },
        comicblack: "#14141C",
      },
      fontFamily: {
        // Display: cómic redondeado y amistoso para títulos/HUD
        display: ["Baloo 2", "system-ui", "sans-serif"],
        // Body: cálida pero muy legible en ES/EN
        body: ["Nunito Sans", "system-ui", "sans-serif"],
        // Utilitaria: cronómetro y puntuación — números tabulares, sin "jitter"
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        panel: "0 6px 0 0 #14141C",
        "panel-sm": "0 3px 0 0 #14141C",
      },
      borderWidth: {
        3: "3px",
      },
    },
  },
  plugins: [],
};
