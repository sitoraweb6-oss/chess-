/**
 * Personal Mistake Puzzles Domain Layer
 * "তোমার ভুল থেকে শেখো" - Daba Shikkhok
 *
 * Extracts blunders/mistakes from user games where best move gains >= 15% win chance,
 * provides spaced repetition management (1d, 3d, 7d, 21d), and validates answers
 * within 50 centipawns of the engine's best move.
 */

import { ReviewedMove } from '../storage/index.ts';

export interface PersonalPuzzle {
  id: string;
  gameId: string;
  date: string;
  fenBefore: string;
  userMoveSan: string;
  bestMoveSan: string;
  bestMoveUci: string;
  bestMovePieceSquare: string; // e.g. "e2" (piece origin)
  bestMoveTargetSquare: string; // e.g. "e4" (target square)
  explanationBn: string;
  winGain: number; // e.g. 24 (%)
  category?: 'blunder' | 'mistake';
  box: number; // 0 = new, 1 = 1d, 2 = 3d, 3 = 7d, 4 = 21d
  dueDate: string; // ISO string
  solvedCount: number;
  failedCount: number;
  lastPracticed?: string;
}

export const SPACED_REPETITION_DAYS = [1, 3, 7, 21];

/**
 * Calculates next review date based on spaced repetition box (0 to 4)
 */
export function getNextDueDate(box: number): string {
  const now = new Date();
  const daysToAdd = SPACED_REPETITION_DAYS[Math.min(box, SPACED_REPETITION_DAYS.length - 1)] || 1;
  const next = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return next.toISOString();
}

/**
 * Checks if a puzzle is currently due for review
 */
export function isPuzzleDue(puzzle: PersonalPuzzle): boolean {
  if (!puzzle.dueDate) return true;
  return new Date(puzzle.dueDate).getTime() <= Date.now();
}

/**
 * Extracts candidate puzzles from a reviewed game.
 * Stores only: fenBefore, userMoveSan, bestMove, category, and gameId.
 * Does NOT rely on stored PV or multi-ply solutions.
 */
export function extractMistakePuzzles(gameId: string, moves: ReviewedMove[]): PersonalPuzzle[] {
  const puzzles: PersonalPuzzle[] = [];

  for (const m of moves) {
    if (!m.isUser) continue;
    if (m.classification !== 'blunder' && m.classification !== 'mistake') continue;

    // Must have a noticeable winDrop (>= 15%) and known best move
    const winDrop = m.winDrop || 0;
    if (winDrop < 15) continue;

    const bestUci = m.evalBefore?.bestMove;
    if (!bestUci || bestUci.length < 4) continue;

    const fromSq = bestUci.slice(0, 2);
    const toSq = bestUci.slice(2, 4);

    const puzzle: PersonalPuzzle = {
      id: `puzzle-${gameId}-${m.ply}`,
      gameId,
      date: new Date().toISOString(),
      fenBefore: m.fenBefore,
      userMoveSan: m.san,
      bestMoveSan: m.bestMoveSan || bestUci,
      bestMoveUci: bestUci,
      bestMovePieceSquare: fromSq,
      bestMoveTargetSquare: toSq,
      explanationBn: m.explanation || 'এই চালে অনেক ভালো বিকল্প চাল ছিল।',
      winGain: Math.round(winDrop),
      category: m.classification,
      box: 0,
      dueDate: new Date().toISOString(), // due immediately
      solvedCount: 0,
      failedCount: 0,
    };

    puzzles.push(puzzle);
  }

  return puzzles;
}

/**
 * Checks if a played move is accepted:
 * Matches exact bestMove UCI, or is within 50 centipawns tolerance of the best move.
 */
export function isMoveAcceptable(
  playedUci: string,
  bestUci: string,
  evalDiffCp?: number
): boolean {
  if (playedUci === bestUci) return true;
  if (typeof evalDiffCp === 'number' && Math.abs(evalDiffCp) <= 50) return true;
  return false;
}
