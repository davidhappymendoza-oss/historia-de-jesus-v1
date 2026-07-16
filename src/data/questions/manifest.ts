import type { Question } from "@/types";

/**
 * Vite descubre automáticamente cualquier archivo *.json agregado a esta
 * carpeta (milagros.json, parabolas.json, bienaventuranzas.json...).
 *
 * Agregar, editar o eliminar preguntas es SOLO editar esos archivos JSON.
 * Este archivo, y el resto del código del juego, nunca necesitan cambiar
 * cuando el banco de preguntas crece hacia las ~1000 preguntas.
 */
const modules = import.meta.glob<{ default: Question[] }>("./*.json", {
  eager: true,
});

function loadAllQuestions(): Question[] {
  const all: Question[] = [];
  for (const path in modules) {
    all.push(...modules[path].default);
  }
  return all;
}

export const allQuestions: Question[] = loadAllQuestions();
