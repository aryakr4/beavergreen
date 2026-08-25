import type { Difficulty } from "@/lib/types";

const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
  easy: "border-washington-green-dark bg-gradient-to-b from-washington-green-light to-washington-green text-white",
  moderate: "border-amber-dark bg-gradient-to-b from-amber-light to-amber text-oregon-blue-dark",
  hard: "border-red-dark bg-gradient-to-b from-red-light to-red text-white",
};

export function difficultyBadgeClass(difficulty: Difficulty): string {
  return DIFFICULTY_BADGE_CLASSES[difficulty];
}
