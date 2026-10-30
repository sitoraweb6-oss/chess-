/**
 * Pure domain logic for Chess Evaluation, Win Percentage, Accuracy, and Classification
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { MoveClassification } from '../storage/index.ts';

/**
 * Calculates win percentage from cp (centipawns) or mate score from mover's perspective.
 * winPercent = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1);
 * treat mate as 100 (winning mate) or 0 (getting mated).
 */
export function calculateWinPercent(cp?: number, mate?: number): number {
  if (typeof mate === 'number') {
    if (mate > 0) return 100;
    // mate <= 0: negative mate or mate 0 (checkmated) gives 0% win chance
    return 0;
  }

  const centipawns = typeof cp === 'number' && !isNaN(cp) ? cp : 0;
  const sigmoid = 2 / (1 + Math.exp(-0.00368208 * centipawns)) - 1;
  const win = 50 + 50 * sigmoid;
  return Math.max(0, Math.min(100, win));
}

/**
 * Move accuracy formula:
 * clamp(103.1668 * exp(-0.04354 * winDrop) - 3.1669, 0, 100)
 */
export function calculateMoveAccuracy(winDrop: number): number {
  const drop = Math.max(0, winDrop);
  const raw = 103.1668 * Math.exp(-0.04354 * drop) - 3.1669;
  return Math.max(0, Math.min(100, Math.round(raw * 10) / 10));
}

/**
 * Game accuracy:
 * Average accuracy over user's moves
 */
export function calculateGameAccuracy(moveAccuracies: number[]): number {
  if (moveAccuracies.length === 0) return 100;
  const sum = moveAccuracies.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / moveAccuracies.length) * 10) / 10;
}

/**
 * Classifies a user move based on winDrop, best move match, and forced mate dynamics.
 * - played the engine's best move -> brilliant
 * - winDrop < 5 -> good
 * - 5 to 10 -> inaccuracy
 * - 10 to 15 -> mistake
 * - 15 or more, or missed a forced mate, or allowed a forced mate -> blunder
 */
export function classifyMove(
  winDrop: number,
  isBestMove: boolean,
  missedMate: boolean = false,
  allowedMate: boolean = false
): MoveClassification {
  if (isBestMove) {
    return 'brilliant';
  }
  if (missedMate || allowedMate || winDrop >= 15) {
    return 'blunder';
  }
  if (winDrop >= 10) {
    return 'mistake';
  }
  if (winDrop >= 5) {
    return 'inaccuracy';
  }
  return 'good';
}
