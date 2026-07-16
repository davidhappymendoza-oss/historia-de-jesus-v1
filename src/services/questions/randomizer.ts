import type { Question, PlayerQuestionHistory } from "@/types";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export interface SelectQuestionsParams {
  pool: Question[];
  history: PlayerQuestionHistory;
  count: number;
}

export interface SelectQuestionsResult {
  questions: Question[];
  /** Historial resultante — puede traer el ciclo reiniciado si el pool se agotó. */
  history: PlayerQuestionHistory;
}

/**
 * Selecciona `count` preguntas al azar del `pool`, excluyendo las que ya
 * aparecen en `history.answeredIds`. Dos jugadores nunca reciben el mismo
 * orden porque el shuffle es independiente por llamada.
 *
 * Si el pool sin repetir no alcanza para `count` preguntas, se considera
 * que el jugador recorrió el banco disponible: se incrementa `cycleCount`,
 * se libera el historial, y se vuelve a elegir sobre el pool completo.
 * Así el jugador siempre recorre las ~1000 preguntas antes de que algo
 * se repita.
 */
export function selectQuestions({
  pool,
  history,
  count,
}: SelectQuestionsParams): SelectQuestionsResult {
  const answeredSet = new Set(history.answeredIds);
  let available = pool.filter((q) => !answeredSet.has(q.id));
  let nextHistory = history;

  if (available.length < count) {
    nextHistory = { answeredIds: [], cycleCount: history.cycleCount + 1 };
    available = pool;
  }

  return {
    questions: shuffle(available).slice(0, count),
    history: nextHistory,
  };
}

export function recordAnswered(
  history: PlayerQuestionHistory,
  questionId: string
): PlayerQuestionHistory {
  if (history.answeredIds.includes(questionId)) return history;
  return { ...history, answeredIds: [...history.answeredIds, questionId] };
}
