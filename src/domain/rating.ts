/**
 * Pure domain logic for Rating and Elo calculations
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

export const STARTING_RATINGS = {
  beginner: 600,
  intermediate: 900,
  advanced: 1200,
} as const;

export const DEFAULT_BOT_LEVELS = {
  beginner: 2,
  intermediate: 4,
  advanced: 6,
} as const;

/**
 * Calculates bot rating based on level (1-10)
 * Level 1 = 400, Level 10 = 2200
 */
export function getBotRating(level: number): number {
  const clamped = Math.max(1, Math.min(10, Math.round(level)));
  return 400 + (clamped - 1) * 200;
}

/**
 * Stockfish skill level (0 - 20)
 * skillLevel = round((level - 1) * 20 / 9)
 */
export function getBotSkillLevel(level: number): number {
  const clamped = Math.max(1, Math.min(10, Math.round(level)));
  return Math.round(((clamped - 1) * 20) / 9);
}

/**
 * Bot move calculation time (100ms - 1500ms)
 */
export function getBotMoveTime(level: number): number {
  const clamped = Math.max(1, Math.min(10, Math.round(level)));
  return Math.round(100 + ((clamped - 1) * (1500 - 100)) / 9);
}

/**
 * Returns K-factor: 64 for first 5 provisional games, then standard 32
 */
export function getKFactor(completedGamesCount: number): number {
  return completedGamesCount < 5 ? 64 : 32;
}

/**
 * Returns true if rating is still provisional (fewer than 5 games played)
 */
export function isProvisionalRating(completedGamesCount: number): boolean {
  return completedGamesCount < 5;
}

/**
 * Elo calculation with dynamic K-factor (64 for first 5 provisional games, then 32)
 */
export function calculateElo(
  userRating: number,
  botRating: number,
  result: 'win' | 'loss' | 'draw',
  k: number = 32
): { newRating: number; change: number } {
  const expected = 1 / (1 + Math.pow(10, (botRating - userRating) / 400));
  const actual = result === 'win' ? 1 : result === 'draw' ? 0.5 : 0;
  const change = Math.round(k * (actual - expected));
  const newRating = Math.max(100, userRating + change);

  return {
    newRating,
    change,
  };
}

