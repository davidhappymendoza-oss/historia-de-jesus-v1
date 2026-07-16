import type { PlayerStatistics } from "./statistics";
import type { PlayerProgress } from "./player";

export type BadgeTier = "bronze" | "silver" | "gold";

/**
 * Un logro se define por un criterio evaluable contra las estadísticas
 * y el progreso actuales del jugador. checkAchievements() en
 * services/achievements (fase futura) recorrerá el registro y
 * devolverá los que se acaban de desbloquear.
 */
export interface AchievementCriteria {
  evaluate: (stats: PlayerStatistics, progress: PlayerProgress) => boolean;
}

export interface AchievementDefinition {
  id: string;
  titleKey: string; // clave de i18n, ej: "achievements.perfectLevel.title"
  descriptionKey: string;
  badgeTier: BadgeTier;
  criteria: AchievementCriteria;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string; // ISO date
}

/**
 * Registro vacío por diseño — Fase 0 solo deja la estructura lista.
 * Las definiciones reales de logros se agregan en la Fase 6 sin tocar
 * ningún otro módulo del juego.
 */
export const achievementRegistry: AchievementDefinition[] = [];
