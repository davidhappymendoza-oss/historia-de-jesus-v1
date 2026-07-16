import type { Difficulty } from "./question";
import type { Language } from "./settings";

/**
 * Historial de preguntas mostradas a este jugador. Se usa para minimizar
 * repeticiones: el randomizer excluye estos IDs hasta agotar el banco
 * disponible, momento en el que se incrementa cycleCount y se libera
 * el historial para volver a recorrer las ~1000 preguntas.
 */
export interface PlayerQuestionHistory {
  answeredIds: string[]; // se serializa como array (Set no es JSON-nativo)
  cycleCount: number;
}

export interface PlayerProgress {
  currentLevel: number; // 1-10
  score: number; // 0-1000
  lives: number; // 0-5
  difficulty: Difficulty;
}

export interface PlayerProfile {
  id: string;
  name: string;
  language: Language;
  progress: PlayerProgress;
  questionHistory: PlayerQuestionHistory;
  createdAt: string; // ISO date
  lastPlayedAt: string; // ISO date
}
