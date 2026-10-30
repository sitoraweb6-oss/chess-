/**
 * Pure domain logic for Captured Pieces & Material Count
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { Chess, PieceSymbol } from 'chess.js';
import { PIECE_VALUES } from './attacks.ts';

export interface MaterialEvaluation {
  capturedByWhite: PieceSymbol[]; // pieces captured from black
  capturedByBlack: PieceSymbol[]; // pieces captured from white
  whiteScore: number;
  blackScore: number;
  difference: number; // positive = white advantage, negative = black advantage
}

const STARTING_COUNTS: Record<PieceSymbol, number> = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
  k: 1,
};

export function getMaterialDifference(fen: string): MaterialEvaluation {
  try {
    const chess = new Chess(fen);
    const board = chess.board();

    const currentWhite: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
    const currentBlack: Record<PieceSymbol, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) {
          if (p.color === 'w') {
            currentWhite[p.type]++;
          } else {
            currentBlack[p.type]++;
          }
        }
      }
    }

    const capturedByWhite: PieceSymbol[] = [];
    const capturedByBlack: PieceSymbol[] = [];

    const pieceOrder: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

    for (const type of pieceOrder) {
      // black pieces missing = captured by white
      const blackMissing = Math.max(0, STARTING_COUNTS[type] - currentBlack[type]);
      for (let i = 0; i < blackMissing; i++) {
        capturedByWhite.push(type);
      }

      // white pieces missing = captured by black
      const whiteMissing = Math.max(0, STARTING_COUNTS[type] - currentWhite[type]);
      for (let i = 0; i < whiteMissing; i++) {
        capturedByBlack.push(type);
      }
    }

    let whiteScore = 0;
    let blackScore = 0;

    for (const [piece, count] of Object.entries(currentWhite)) {
      if (piece !== 'k') {
        whiteScore += (PIECE_VALUES[piece as PieceSymbol] || 0) * count;
      }
    }

    for (const [piece, count] of Object.entries(currentBlack)) {
      if (piece !== 'k') {
        blackScore += (PIECE_VALUES[piece as PieceSymbol] || 0) * count;
      }
    }

    return {
      capturedByWhite,
      capturedByBlack,
      whiteScore,
      blackScore,
      difference: whiteScore - blackScore,
    };
  } catch (err) {
    console.error('Error calculating material difference:', err);
    return {
      capturedByWhite: [],
      capturedByBlack: [],
      whiteScore: 0,
      blackScore: 0,
      difference: 0,
    };
  }
}
