import type { Difficulty } from "@/types";

export const DIFFICULTY_SECONDS: Record<Difficulty, number> = {
  beginner: 30,
  intermediate: 15,
  advanced: 10,
};

export const DIFFICULTY_ORDER: Difficulty[] = ["beginner", "intermediate", "advanced"];
