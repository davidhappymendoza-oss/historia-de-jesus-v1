import type { Gospel } from "./question";

/**
 * Estadísticas acumuladas del jugador. Se actualizan automáticamente cada
 * vez que se responde una pregunta (desde la Fase 2), aunque la pantalla
 * "Statistics" que las visualiza no se construye hasta la Fase 6.
 */
export interface PlayerStatistics {
  questionsAnswered: number;
  correctAnswers: number;
  accuracyPercent: number; // derivado, recalculado en cada actualización
  totalTimeSpentSeconds: number;
  averageTimePerQuestionSeconds: number;
  accuracyByGospel: Record<Gospel, { answered: number; correct: number }>;
  strongestGospel: Gospel | null;
  weakestGospel: Gospel | null;
  currentStreak: number;
  maxStreak: number;
}

/** Un evento individual, para un futuro "Player History" detallado. */
export interface PlayerHistoryEntry {
  questionId: string;
  wasCorrect: boolean;
  timeTakenSeconds: number;
  answeredAt: string; // ISO date
  levelAtTime: number;
}

export function createEmptyStatistics(): PlayerStatistics {
  return {
    questionsAnswered: 0,
    correctAnswers: 0,
    accuracyPercent: 0,
    totalTimeSpentSeconds: 0,
    averageTimePerQuestionSeconds: 0,
    accuracyByGospel: {
      Mateo: { answered: 0, correct: 0 },
      Marcos: { answered: 0, correct: 0 },
      Lucas: { answered: 0, correct: 0 },
      Juan: { answered: 0, correct: 0 },
    },
    strongestGospel: null,
    weakestGospel: null,
    currentStreak: 0,
    maxStreak: 0,
  };
}
