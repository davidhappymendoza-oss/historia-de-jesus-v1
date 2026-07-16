import { allQuestions } from "@/data/questions/manifest";
import type { Question, Difficulty, QuestionCategory } from "@/types";

export function getAllQuestions(): Question[] {
  return allQuestions;
}

export function getQuestionById(id: string): Question | undefined {
  return allQuestions.find((q) => q.id === id);
}

export function getQuestionsByLevel(level: number): Question[] {
  return allQuestions.filter((q) => q.level === level);
}

export function getQuestionsByDifficulty(difficulty: Difficulty): Question[] {
  return allQuestions.filter(
    (q) => q.difficulty === difficulty || q.difficulty === "all"
  );
}

export function getQuestionsByCategory(category: QuestionCategory): Question[] {
  return allQuestions.filter((q) => q.category === category);
}

export function getQuestionBankSize(): number {
  return allQuestions.length;
}
