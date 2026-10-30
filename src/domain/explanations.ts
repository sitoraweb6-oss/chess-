/**
 * Bangla Chess Explanation Rule Engine
 * "দাবা শিক্ষক" - Daba Shikkhok
 *
 * Ordered list of pure rule functions:
 * Takes (fenBefore, movePlayed, bestMove, fenAfter, evalBefore, evalAfter)
 * and returns a Bangla teacher-style sentence or null.
 * First match wins.
 */

import { Chess, Color } from 'chess.js';
import { toBanglaNumeral, PIECE_NAMES } from '../i18n/bn.ts';
import { detectHungPiece, detectMissedFreePiece, detectAllowedFork } from './attacks.ts';

export interface EvalInfo {
  cp?: number;
  mate?: number;
  bestMove?: string;
  pv?: string;
}

export type ExplanationRule = (
  fenBefore: string,
  movePlayed: string, // UCI e.g. "e2e4" or SAN
  bestMove: string,   // UCI e.g. "g1f3"
  fenAfter: string,
  evalBefore?: EvalInfo,
  evalAfter?: EvalInfo
) => string | null;

/**
 * Converts UCI move string (e.g. "g1f3") to readable Bangla chess notation (e.g. "ঘোড়া f3" or "e4")
 */
export function formatUciMoveToBangla(uci: string, fen: string): string {
  if (!uci || uci.length < 4) return uci || '';
  try {
    const chess = new Chess(fen);
    const from = uci.slice(0, 2);
    const to = uci.slice(2, 4);
    const promotion = uci[4];
    const piece = chess.get(from as never);
    if (!piece) return uci;

    const pieceBn = PIECE_NAMES[piece.type] || '';
    if (piece.type === 'p') {
      return to;
    }
    const promoBn = promotion ? ` (${PIECE_NAMES[promotion] || promotion})` : '';
    return `${pieceBn} ${to}${promoBn}`;
  } catch {
    return uci;
  }
}

/**
 * Rule 1: Allowed forced mate
 * "এই চালের পর প্রতিপক্ষ [N] চালে চেকমেট দিতে পারে।"
 */
export const ruleAllowedForcedMate: ExplanationRule = (
  _fenBefore,
  _movePlayed,
  _bestMove,
  _fenAfter,
  _evalBefore,
  evalAfter
) => {
  // In fenAfter, it is opponent's turn.
  // In UCI output for fenAfter, evalAfter.mate > 0 means opponent has mate in M moves!
  if (evalAfter && typeof evalAfter.mate === 'number' && evalAfter.mate > 0) {
    const n = Math.abs(evalAfter.mate);
    return `এই চালের পর প্রতিপক্ষ ${toBanglaNumeral(n)} চালে চেকমেট দিতে পারে।`;
  }
  return null;
};

/**
 * Rule 2: Missed forced mate
 * "এখানে [N] চালে চেকমেট ছিল!"
 */
export const ruleMissedForcedMate: ExplanationRule = (
  _fenBefore,
  _movePlayed,
  _bestMove,
  _fenAfter,
  evalBefore,
  evalAfter
) => {
  // In fenBefore, it was user's turn. evalBefore.mate > 0 means user had mate in M moves.
  // If user did not play the mating sequence, evalAfter.mate is either null or <= 0
  if (evalBefore && typeof evalBefore.mate === 'number' && evalBefore.mate > 0) {
    // Check if user still has mate after the move
    const opponentEvalMate = evalAfter?.mate;
    // For user, opponent having mate < 0 means user has mate in -mate moves.
    // If opponent has mate >= 0 or opponent has no mate, user missed the mate!
    if (!opponentEvalMate || opponentEvalMate >= 0) {
      const n = Math.abs(evalBefore.mate);
      return `এখানে ${toBanglaNumeral(n)} চালে চেকমেট ছিল!`;
    }
  }
  return null;
};

/**
 * Rule 3: Hung a piece (user's piece attacked and undefended, or attacked by a lower-value piece)
 * "তোমার [piece] অরক্ষিত হয়ে গেছে, প্রতিপক্ষ এটা খেয়ে নিতে পারে।"
 */
export const ruleHungPiece: ExplanationRule = (
  fenBefore,
  _movePlayed,
  _bestMove,
  fenAfter,
  _evalBefore,
  _evalAfter
) => {
  try {
    const chessBefore = new Chess(fenBefore);
    const userColor: Color = chessBefore.turn();
    const hung = detectHungPiece(fenAfter, userColor);
    if (hung) {
      return `তোমার ${hung.banglaName} অরক্ষিত হয়ে গেছে, প্রতিপক্ষ এটা খেয়ে নিতে পারে।`;
    }
  } catch (err) {
    console.error('Error in ruleHungPiece:', err);
  }
  return null;
};

/**
 * Rule 4: Missed winning a free piece
 * "প্রতিপক্ষের [piece] ফ্রিতে খাওয়া যেত।"
 */
export const ruleMissedFreePiece: ExplanationRule = (
  fenBefore,
  _movePlayed,
  bestMove,
  _fenAfter,
  _evalBefore,
  _evalAfter
) => {
  try {
    const chessBefore = new Chess(fenBefore);
    const userColor: Color = chessBefore.turn();
    const missed = detectMissedFreePiece(fenBefore, userColor, bestMove);
    if (missed) {
      return `প্রতিপক্ষের ${missed.banglaName} ফ্রিতে খাওয়া যেত।`;
    }
  } catch (err) {
    console.error('Error in ruleMissedFreePiece:', err);
  }
  return null;
};

/**
 * Rule 5: Allowed a fork (one enemy move attacks two or more valuable user pieces)
 * "এই চালের পর প্রতিপক্ষ [piece] দিয়ে ফর্ক করতে পারে।"
 */
export const ruleAllowedFork: ExplanationRule = (
  fenBefore,
  _movePlayed,
  _bestMove,
  fenAfter,
  _evalBefore,
  _evalAfter
) => {
  try {
    const chessBefore = new Chess(fenBefore);
    const userColor: Color = chessBefore.turn();
    const fork = detectAllowedFork(fenAfter, userColor);
    if (fork) {
      return `এই চালের পর প্রতিপক্ষ ${fork.banglaName} দিয়ে ফর্ক করতে পারে।`;
    }
  } catch (err) {
    console.error('Error in ruleAllowedFork:', err);
  }
  return null;
};

/**
 * Rule 6: Fallback
 * "এর চেয়ে ভালো চাল ছিল [best move]।"
 */
export const ruleFallback: ExplanationRule = (
  fenBefore,
  _movePlayed,
  bestMove,
  _fenAfter,
  _evalBefore,
  _evalAfter
) => {
  const formattedBest = formatUciMoveToBangla(bestMove, fenBefore);
  return `এর চেয়ে ভালো চাল ছিল ${formattedBest}।`;
};

/**
 * Ordered list of rules. First match wins.
 */
export const EXPLANATION_RULES: ExplanationRule[] = [
  ruleAllowedForcedMate,
  ruleMissedForcedMate,
  ruleHungPiece,
  ruleMissedFreePiece,
  ruleAllowedFork,
  ruleFallback,
];

/**
 * Generates an encouraging, teacher-style Bangla explanation for a move.
 */
export function generateMoveExplanation(
  fenBefore: string,
  movePlayed: string,
  bestMove: string,
  fenAfter: string,
  evalBefore?: EvalInfo,
  evalAfter?: EvalInfo
): string {
  for (const rule of EXPLANATION_RULES) {
    const explanation = rule(fenBefore, movePlayed, bestMove, fenAfter, evalBefore, evalAfter);
    if (explanation) {
      return explanation;
    }
  }
  return ruleFallback(fenBefore, movePlayed, bestMove, fenAfter, evalBefore, evalAfter) || '';
}
