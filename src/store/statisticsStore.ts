import { create } from "zustand";
import type { PlayerStatistics, Gospel } from "@/types";
import { createEmptyStatistics } from "@/types/statistics";
import { storageService } from "@/services/storage";

function statsKey(playerId: string): string {
  return `statistics:${playerId}`;
}

interface StatisticsState {
  statistics: PlayerStatistics;
  load: (playerId: string) => Promise<void>;
  /**
   * Se llama una vez por cada respuesta (correcta o incorrecta) desde el
   * motor de juego (Fase 2). Recalcula precisión, racha, evangelio
   * fuerte/débil, etc. La UI que muestra esto llega en la Fase 6.
   */
  recordAnswer: (params: {
    playerId: string;
    gospel: Gospel;
    wasCorrect: boolean;
    timeTakenSeconds: number;
  }) => Promise<void>;
}

function recompute(stats: PlayerStatistics): PlayerStatistics {
  const accuracyPercent =
    stats.questionsAnswered === 0
      ? 0
      : Math.round((stats.correctAnswers / stats.questionsAnswered) * 100);

  const averageTimePerQuestionSeconds =
    stats.questionsAnswered === 0
      ? 0
      : Number((stats.totalTimeSpentSeconds / stats.questionsAnswered).toFixed(1));

  let strongestGospel: Gospel | null = null;
  let weakestGospel: Gospel | null = null;
  let bestRate = -1;
  let worstRate = 2;

  (Object.keys(stats.accuracyByGospel) as Gospel[]).forEach((gospel) => {
    const entry = stats.accuracyByGospel[gospel];
    if (entry.answered === 0) return;
    const rate = entry.correct / entry.answered;
    if (rate > bestRate) {
      bestRate = rate;
      strongestGospel = gospel;
    }
    if (rate < worstRate) {
      worstRate = rate;
      weakestGospel = gospel;
    }
  });

  return { ...stats, accuracyPercent, averageTimePerQuestionSeconds, strongestGospel, weakestGospel };
}

export const useStatisticsStore = create<StatisticsState>((set, get) => ({
  statistics: createEmptyStatistics(),

  load: async (playerId) => {
    const stored = await storageService.get<PlayerStatistics>(statsKey(playerId));
    set({ statistics: stored ?? createEmptyStatistics() });
  },

  recordAnswer: async ({ playerId, gospel, wasCorrect, timeTakenSeconds }) => {
    const current = get().statistics;
    const gospelEntry = current.accuracyByGospel[gospel];

    const updated: PlayerStatistics = recompute({
      ...current,
      questionsAnswered: current.questionsAnswered + 1,
      correctAnswers: current.correctAnswers + (wasCorrect ? 1 : 0),
      totalTimeSpentSeconds: current.totalTimeSpentSeconds + timeTakenSeconds,
      currentStreak: wasCorrect ? current.currentStreak + 1 : 0,
      maxStreak: wasCorrect
        ? Math.max(current.maxStreak, current.currentStreak + 1)
        : current.maxStreak,
      accuracyByGospel: {
        ...current.accuracyByGospel,
        [gospel]: {
          answered: gospelEntry.answered + 1,
          correct: gospelEntry.correct + (wasCorrect ? 1 : 0),
        },
      },
    });

    set({ statistics: updated });
    await storageService.set(statsKey(playerId), updated);
  },
}));
