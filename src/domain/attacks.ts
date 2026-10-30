/**
 * Pure domain logic for Chess attack, defense, hanging piece, and fork detection
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { Chess, Square, PieceSymbol, Color } from 'chess.js';
import { PIECE_NAMES } from '../i18n/bn.ts';

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 100,
};

export interface HungPieceInfo {
  square: Square;
  piece: PieceSymbol;
  banglaName: string;
  isUndefended: boolean;
  attackerPiece?: PieceSymbol;
}

export interface MissedPieceInfo {
  square: Square;
  piece: PieceSymbol;
  banglaName: string;
}

export interface ForkInfo {
  forkingPiece: PieceSymbol;
  banglaName: string;
  forkSquare: Square;
  attackedPieces: PieceSymbol[];
}

/**
 * Checks if any user piece is hung in fenAfter (undefended or attacked by lower-value piece).
 * fenAfter: position right after user made their move (it is opponent's turn to move).
 */
export function detectHungPiece(fenAfter: string, userColor: Color): HungPieceInfo | null {
  try {
    const chess = new Chess(fenAfter);
    const opponentColor: Color = userColor === 'w' ? 'b' : 'w';

    const board = chess.board();
    let mostValuableHung: HungPieceInfo | null = null;
    let highestValue = 0;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const squareObj = board[r][c];
        if (!squareObj || squareObj.color !== userColor) continue;
        if (squareObj.type === 'k') continue; // king is handled by check/mate rules

        const file = String.fromCharCode(97 + c);
        const rank = String(8 - r);
        const sq = `${file}${rank}` as Square;

        const enemyAttackers = chess.attackers(sq, opponentColor);
        if (enemyAttackers.length === 0) continue;

        const friendlyDefenders = chess.attackers(sq, userColor);
        const pieceVal = PIECE_VALUES[squareObj.type];

        // 1. Undefended piece under attack
        if (friendlyDefenders.length === 0) {
          if (pieceVal > highestValue) {
            highestValue = pieceVal;
            mostValuableHung = {
              square: sq,
              piece: squareObj.type,
              banglaName: PIECE_NAMES[squareObj.type] || squareObj.type,
              isUndefended: true,
            };
          }
          continue;
        }

        // 2. Defended piece attacked by a lower value enemy piece (e.g. Queen attacked by pawn or bishop)
        let lowestEnemyVal = 1000;
        let lowestEnemyType: PieceSymbol | undefined;
        for (const atkSq of enemyAttackers) {
          const atkPiece = chess.get(atkSq);
          if (atkPiece) {
            const val = PIECE_VALUES[atkPiece.type];
            if (val < lowestEnemyVal) {
              lowestEnemyVal = val;
              lowestEnemyType = atkPiece.type;
            }
          }
        }

        if (lowestEnemyVal < pieceVal) {
          if (pieceVal > highestValue) {
            highestValue = pieceVal;
            mostValuableHung = {
              square: sq,
              piece: squareObj.type,
              banglaName: PIECE_NAMES[squareObj.type] || squareObj.type,
              isUndefended: false,
              attackerPiece: lowestEnemyType,
            };
          }
        }
      }
    }

    return mostValuableHung;
  } catch (err) {
    console.error('Error detecting hung piece:', err);
    return null;
  }
}

/**
 * Checks if user missed winning a free piece that was available in fenBefore.
 * fenBefore: position when user was on turn.
 * bestMoveUci: engine's best move (e.g. 'e2e4', 'd1d8')
 */
export function detectMissedFreePiece(
  fenBefore: string,
  userColor: Color,
  bestMoveUci?: string
): MissedPieceInfo | null {
  try {
    const chess = new Chess(fenBefore);
    const opponentColor: Color = userColor === 'w' ? 'b' : 'w';

    // If best move captured an opponent piece, let's see if that piece was free/undefended
    if (bestMoveUci && bestMoveUci.length >= 4) {
      const toSq = bestMoveUci.slice(2, 4) as Square;
      const targetPiece = chess.get(toSq);
      if (targetPiece && targetPiece.color === opponentColor && targetPiece.type !== 'p') {
        const enemyDefenders = chess.attackers(toSq, opponentColor);
        const myAttackers = chess.attackers(toSq, userColor);
        if (enemyDefenders.length === 0 || myAttackers.length > enemyDefenders.length) {
          return {
            square: toSq,
            piece: targetPiece.type,
            banglaName: PIECE_NAMES[targetPiece.type] || targetPiece.type,
          };
        }
      }
    }

    // Also check any undefended opponent piece that was attackable in fenBefore
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (!p || p.color !== opponentColor || p.type === 'p' || p.type === 'k') continue;
        const file = String.fromCharCode(97 + c);
        const rank = String(8 - r);
        const sq = `${file}${rank}` as Square;

        const myAttackers = chess.attackers(sq, userColor);
        const enemyDefenders = chess.attackers(sq, opponentColor);

        if (myAttackers.length > 0 && enemyDefenders.length === 0) {
          return {
            square: sq,
            piece: p.type,
            banglaName: PIECE_NAMES[p.type] || p.type,
          };
        }
      }
    }

    return null;
  } catch (err) {
    console.error('Error detecting missed free piece:', err);
    return null;
  }
}

/**
 * Checks if the move allows the opponent to deliver a fork against two or more valuable pieces.
 * fenAfter: position right after user made their move.
 */
export function detectAllowedFork(fenAfter: string, userColor: Color): ForkInfo | null {
  try {
    const chess = new Chess(fenAfter);
    const opponentColor: Color = userColor === 'w' ? 'b' : 'w';
    const opponentMoves = chess.moves({ verbose: true });

    for (const move of opponentMoves) {
      // Create a temporary clone with opponent's move made
      const simChess = new Chess(fenAfter);
      simChess.move({ from: move.from, to: move.to, promotion: move.promotion });

      // In this new position, how many user pieces are attacked by the piece at move.to?
      const forkSquare = move.to;
      const pieceAtSquare = simChess.get(forkSquare);
      if (!pieceAtSquare) continue;

      const board = simChess.board();
      const attackedValuable: PieceSymbol[] = [];

      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const target = board[r][c];
          if (!target || target.color !== userColor) continue;
          const file = String.fromCharCode(97 + c);
          const rank = String(8 - r);
          const sq = `${file}${rank}` as Square;

          // Check if forkSquare attacks sq
          const attackersOnTarget = simChess.attackers(sq, opponentColor);
          if (attackersOnTarget.includes(forkSquare)) {
            // Check value of target (King, Queen, Rook, Bishop, Knight, or undefended piece)
            if (target.type === 'k' || PIECE_VALUES[target.type] >= 3) {
              attackedValuable.push(target.type);
            }
          }
        }
      }

      if (attackedValuable.length >= 2) {
        return {
          forkingPiece: move.piece,
          banglaName: PIECE_NAMES[move.piece] || move.piece,
          forkSquare,
          attackedPieces: attackedValuable,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error detecting fork:', err);
    return null;
  }
}
