/**
 * Modelo de datos de Pregunta.
 *
 * IMPORTANTE: este tipo describe la FORMA de los datos que viven en
 * /src/data/questions/*.json. El banco de preguntas es contenido puro
 * (JSON), completamente independiente de la lógica del juego. Agregar,
 * editar o eliminar preguntas nunca requiere tocar código — solo estos
 * archivos JSON, validados contra este tipo.
 */

export type Gospel = "Mateo" | "Marcos" | "Lucas" | "Juan";

export type Difficulty = "beginner" | "intermediate" | "advanced";

/** Una pregunta puede aplicar a una dificultad específica o a todas ("all"). */
export type DifficultyTag = Difficulty | "all";

export type QuestionCategory =
  | "personajes"
  | "lugares"
  | "milagros"
  | "parabolas"
  | "bienaventuranzas"
  | "contexto_historico"
  | "contexto_cultural"
  | "significado_espiritual"
  | "ensenanzas"
  | "profecias"
  | "cronologia"
  | "relaciones_personajes"
  | "citas_biblicas";

/** Referencia bíblica precisa: evangelio, capítulo y versículo(s). */
export interface BibleReference {
  gospel: Gospel;
  chapter: number;
  /** Ej: "3-12", "16", "1-4" */
  verses: string;
}

/** Contenido de la pregunta en un idioma específico. */
export interface QuestionContent {
  prompt: string;
  /** Exactamente 3 opciones, 1 correcta + 2 distractores plausibles. */
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  explanation: string;
  historicalContext: string;
  culturalContext: string;
  mainTeaching: string;
  /** Texto del versículo, mostrado en la VerseRevealCard tras responder. */
  verseText: string;
}

export interface Question {
  /** Identificador único y estable. Formato sugerido: gospel-cap-verso-categoria-secuencia */
  id: string;
  reference: BibleReference;
  characters: string[];
  location: string;
  category: QuestionCategory;
  subcategory?: string;
  /** Nivel de juego sugerido (1-10). Una pregunta puede reutilizarse en varios niveles. */
  level: number;
  difficulty: DifficultyTag;
  content: {
    es: QuestionContent;
    en: QuestionContent;
  };
  /** Ruta relativa dentro de public/images, ej: "milagros/bodas-cana.png" */
  illustration: string;
  keywords: string[];
}

/** Metadatos ligeros usados por el índice/manifest sin cargar el contenido completo. */
export interface QuestionMeta {
  id: string;
  category: QuestionCategory;
  subcategory?: string;
  level: number;
  difficulty: DifficultyTag;
  gospel: Gospel;
  file: string;
}
