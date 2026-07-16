import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // El banco de preguntas crecerá a ~1000 items repartidos en varios JSON.
    // Se separan en un chunk propio para no inflar el bundle principal.
    rollupOptions: {
      output: {
        manualChunks: {
          "question-bank": ["src/data/questions/manifest.ts"],
        },
      },
    },
  },
});
