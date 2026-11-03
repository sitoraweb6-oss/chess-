/**
 * Domain logic for explaining Stockfish best move in Bangla
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { Chess, Square, PieceSymbol } from 'chess.js';
import { PIECE_NAMES, toBanglaNumeral } from '../i18n/bn.ts';
import { EvaluationResult } from '../engine/index.ts';
import { detectHungPiece } from './attacks.ts';

export interface BestMoveExplanation {
  uci: string;
  san: string;
  from: Square;
  to: Square;
  pieceName: string;
  pieceSymbol: string;
  moveBn: string;
  explanation: string;
  advantageBn: string;
  cp?: number;
  mate?: number;
  engineElo?: number;
}

const PIECE_GLYPHS: Record<PieceSymbol, { white: string; black: string }> = {
  p: { white: '♙', black: '♟' },
  n: { white: '♘', black: '♞' },
  b: { white: '♗', black: '♝' },
  r: { white: '♖', black: '♜' },
  q: { white: '♕', black: '♛' },
  k: { white: '♔', black: '♚' },
};

/**
 * Explains why the engine's best move is strong in clear, encouraging Bangla.
 */
export function explainBestMove(
  fen: string,
  bestMoveUci: string,
  evalResult?: EvaluationResult,
  engineElo?: number
): BestMoveExplanation | null {
  if (!bestMoveUci || bestMoveUci.length < 4) return null;

  const from = bestMoveUci.slice(0, 2) as Square;
  const to = bestMoveUci.slice(2, 4) as Square;
  const promo = bestMoveUci[4] as PieceSymbol | undefined;

  try {
    const chess = new Chess(fen);
    const movingPiece = chess.get(from);
    if (!movingPiece) return null;

    const targetPiece = chess.get(to);
    const color = movingPiece.color;
    const pieceType = movingPiece.type;
    const pieceName = PIECE_NAMES[pieceType] || 'ঘুঁটি';
    const glyph = color === 'w' ? PIECE_GLYPHS[pieceType].white : PIECE_GLYPHS[pieceType].black;

    // Check if the moving piece was attacked in fen
    const hungInfo = detectHungPiece(fen, color);
    const wasHung = hungInfo && hungInfo.square === from;

    // Apply move in simulated chess to analyze outcome
    const moveRes = chess.move({ from, to, promotion: promo });
    if (!moveRes) return null;

    const san = moveRes.san;
    const moveBn = pieceType === 'p' ? `${to}` : `${pieceName} ${to}`;

    // Compute advantage string in Bangla
    let advantageBn = 'সমান সমান অবস্থান';
    if (evalResult) {
      if (typeof evalResult.mate === 'number' && evalResult.mate !== 0) {
        const turns = Math.abs(evalResult.mate);
        advantageBn =
          evalResult.mate > 0
            ? `সাদা ${toBanglaNumeral(turns)} চালে চেকমেট দিচ্ছে!`
            : `কালো ${toBanglaNumeral(turns)} চালে চেকমেট দিচ্ছে!`;
      } else if (typeof evalResult.cp === 'number') {
        const pawns = (evalResult.cp / 100).toFixed(1);
        if (evalResult.cp > 40) {
          advantageBn = `সাদা +${toBanglaNumeral(pawns)} সুবিধায় আছে`;
        } else if (evalResult.cp < -40) {
          advantageBn = `কালো +${toBanglaNumeral(Math.abs(Number(pawns)))} সুবিধায় আছে`;
        } else {
          advantageBn = 'উভয় পক্ষের অবস্থান সমান সমান';
        }
      }
    }

    // Determine explanation reason
    let explanation = '';

    // Helper to package the result
    const createResult = (explanationText: string): BestMoveExplanation => ({
      uci: bestMoveUci,
      san,
      from,
      to,
      pieceName,
      pieceSymbol: glyph,
      moveBn,
      explanation: explanationText,
      advantageBn,
      cp: evalResult?.cp,
      mate: evalResult?.mate,
      engineElo,
    });

    // 1. Direct Checkmate
    if (chess.isCheckmate()) {
      return createResult(
        `অসাধারণ চাল! ${san} চালটি প্রতিপক্ষের রাজাকে সরাসরি চেকমেট প্রদান করে বিজয় এনে দেয়।`
      );
    }

    // 2. Forced Mate sequence
    if (evalResult?.mate && evalResult.mate !== 0) {
      const turns = Math.abs(evalResult.mate);
      return createResult(
        `এই চালটি ${toBanglaNumeral(turns)} চালে নিশ্চিত চেকমেটের পথ তৈরি করে। প্রতিপক্ষের প্রতিরক্ষা ভেঙে ফেলে।`
      );
    }

    // 3. Delivers a Check
    if (chess.inCheck()) {
      return createResult(
        `প্রতিপক্ষের রাজাকে চেক দিয়ে চাপে ফেলে এবং তাদের পরিকল্পনা বানচাল করে আক্রমণ তৈরি করে।`
      );
    }

    // 4. Captures enemy piece
    if (targetPiece) {
      const capturedName = PIECE_NAMES[targetPiece.type] || 'ঘুঁটি';
      if (targetPiece.type === 'q') {
        return createResult(
          `প্রতিপক্ষের সবচেয়ে শক্তিশালী ঘুঁটি মন্ত্রী কেটে নিয়ে খেলায় বিপুল এগিয়ে যায়।`
        );
      } else if (targetPiece.type === 'r') {
        return createResult(
          `প্রতিপক্ষের মূল্যবান নৌকা কেটে মেটেরিয়াল সুবিধা নিশ্চিত করে।`
        );
      } else if (targetPiece.type === 'b' || targetPiece.type === 'n') {
        return createResult(
          `প্রতিপক্ষের সক্রিয় ${capturedName} কেটে নিয়ে আক্রমণের গতি থামিয়ে দেয়।`
        );
      } else {
        return createResult(
          `প্রতিপক্ষের সৈন্য কেটে কেন্দ্র ও ফাইল দখল করে এগিয়ে যায়।`
        );
      }
    }

    // 5. Castling
    if (pieceType === 'k' && Math.abs(from.charCodeAt(0) - to.charCodeAt(0)) === 2) {
      return createResult(
        `ক্যাসলিং করে রাজাকে নিরাপদে সরিয়ে নেয় এবং নৌকাকে খেলায় যুক্ত করে কেন্দ্রের নিয়ন্ত্রণ বাড়ায়।`
      );
    }

    // 6. Escaping attack if piece was hung
    if (wasHung) {
      return createResult(
        `আক্রান্ত ${pieceName}-টিকে প্রতিপক্ষের আক্রমণ থেকে সুরক্ষিত ঘরে সরিয়ে নিরাপদ করে।`
      );
    }

    // 7. Pawn advance to center
    if (pieceType === 'p' && (to === 'e4' || to === 'd4' || to === 'e5' || to === 'd5' || to === 'c4' || to === 'c5')) {
      return createResult(
        `বোর্ডের কেন্দ্রে শক্ত নিয়ন্ত্রণ প্রতিষ্ঠা করে এবং অন্যান্য ঘুঁটির চলাচলের পথ উন্মুক্ত করে।`
      );
    }

    // 8. Developing Knights and Bishops
    if (pieceType === 'n' || pieceType === 'b') {
      return createResult(
        `ঘুঁটির দ্রুত বিকাশ (Development) ঘটিয়ে কেন্দ্রের সুরক্ষা বৃদ্ধি করে ও রাজাকে ক্যাসলিংয়ের জন্য প্রস্তুত করে।`
      );
    }

    // 9. Pawn push towards promotion
    if (pieceType === 'p' && ((color === 'w' && to[1] === '7') || (color === 'b' && to[1] === '2'))) {
      return createResult(
        `সৈন্যটিকে প্রমোশনের দরজায় পৌঁছে দিয়ে প্রতিপক্ষের ওপর প্রচণ্ড চাপ সৃষ্টি করে।`
      );
    }

    // Default positional improvement
    return createResult(
      `পজিশনে সবচেয়ে কার্যকর ঘরে অবস্থান নিয়ে ঘুঁটির সক্রিয়তা ও বোর্ড নিয়ন্ত্রণ বৃদ্ধি করে।`
    );
  } catch (err) {
    console.warn('[explainBestMove] Error generating explanation:', err);
    return null;
  }
}
