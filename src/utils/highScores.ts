import type { GameSettings } from "../types/game";

const HIGH_SCORES_KEY = "calculate-and-conquer-high-scores";

export interface HighScore {
  score: number;
  date: string;
}

export interface HighScores {
  [key: string]: HighScore; // key format: "operation-mode-number-duration"
}

function getScoreKey(settings: GameSettings): string {
  const { operation, practiceMode, specificNumber, practiceDuration } =
    settings;
  if (practiceMode === "specific" && specificNumber !== undefined) {
    return `${operation}-specific-${specificNumber}-${practiceDuration}s`;
  }
  return `${operation}-all-${practiceDuration}s`;
}

export function getHighScores(): HighScores {
  try {
    const stored = localStorage.getItem(HIGH_SCORES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Failed to load high scores:", error);
    return {};
  }
}

export function getHighScore(settings: GameSettings): number {
  const scores = getHighScores();
  const key = getScoreKey(settings);
  return scores[key]?.score || 0;
}

export function saveHighScore(settings: GameSettings, score: number): boolean {
  try {
    const scores = getHighScores();
    const key = getScoreKey(settings);
    const currentHigh = scores[key]?.score || 0;

    if (score > currentHigh) {
      scores[key] = {
        score,
        date: new Date().toISOString(),
      };
      localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores));
      return true; // New high score!
    }
    return false;
  } catch (error) {
    console.error("Failed to save high score:", error);
    return false;
  }
}

export function formatScoreKey(key: string): string {
  const parts = key.split("-");
  const operation = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  const mode = parts[1];
  const duration = parts[parts.length - 1]; // Last part is duration

  if (mode === "specific" && parts[2]) {
    return `${operation} - Practice ${parts[2]} (${duration})`;
  }
  return `${operation} - All Numbers (${duration})`;
}
