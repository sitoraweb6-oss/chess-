/**
 * Weakness Profile & Personal Coach Domain Logic
 * "দাবা শিক্ষক" - Daba Shikkhok
 *
 * Tracks recurring patterns across the user's last 10 games:
 * - Hung pieces (undefended piece attacked)
 * - Missed free pieces (opponent left piece hanging, user didn't take)
 * - Allowed forks (knight/pawn forks)
 * - Missed checkmate in 1
 * - Allowed checkmate in 1
 * - Opening mistakes (first 10 moves / ply <= 20)
 * - Endgame mistakes (queens off or <= 6 pieces)
 *
 * Computes rates per 100 moves, finds top 3 weaknesses, top 2 strengths,
 * and provides friendly teacher tips and opening recommendations.
 */

import { Chess } from 'chess.js';
import { GameRecord, ReviewedMove } from '../storage/index.ts';
import { detectHungPiece, detectMissedFreePiece, detectAllowedFork } from './attacks.ts';

export type WeaknessKey =
  | 'hungPieces'
  | 'missedFreePieces'
  | 'allowedForks'
  | 'missedMateInOne'
  | 'allowedMateInOne'
  | 'openingBlunders'
  | 'endgameBlunders';

export interface WeaknessStat {
  key: WeaknessKey;
  titleBn: string;
  count: number;
  per100Moves: number;
  tipBn: string;
}

export interface StrengthStat {
  titleBn: string;
  descriptionBn: string;
}

export interface WeaknessProfile {
  gamesAnalyzedCount: number;
  totalUserMovesCount: number;
  topWeaknesses: WeaknessStat[];
  topStrengths: StrengthStat[];
  overallSummaryBn: string;
}

export const WEAKNESS_METADATA: Record<
  WeaknessKey,
  { titleBn: string; tipBn: string }
> = {
  hungPieces: {
    titleBn: 'অরক্ষিত ঘুঁটি (Hanging Pieces)',
    tipBn: 'চাল দেওয়ার আগে শেষবারের মতো দেখে নাও তোমার কোনো ঘুঁটি অরক্ষিত থেকে যাচ্ছে কি না।',
  },
  missedFreePieces: {
    titleBn: 'ফ্রি ঘুঁটি জয়ের সুযোগ হাতছাড়া',
    tipBn: 'প্রতিপক্ষ চাল দেওয়ার সাথে সাথে পুরো বোর্ডে খেয়াল করো কোনো ঘুঁটি অসুরক্ষিত হলো কি না।',
  },
  allowedForks: {
    titleBn: 'ঘোড়া বা সৈন্যের ফর্ক (Forks)',
    tipBn: 'রাজা ও গুরুত্বপূর্ণ ঘুঁটিগুলো একই লাইনে বা ঘোড়ার নাগালের ঘরে কাছাকাছি রাখা পরিহার করো।',
  },
  missedMateInOne: {
    titleBn: '১ চালে চেকমেট হাতছাড়া',
    tipBn: 'প্রতিপক্ষের রাজা যদি অসুরক্ষিত থাকে, সর্বদা আগে চেক ও চেকমেটের সুযোগগুলো পরীক্ষা করো।',
  },
  allowedMateInOne: {
    titleBn: '১ চালে মেট হতে দেওয়া',
    tipBn: 'নিজের রাজার সুরক্ষায় ব্যাক-র‍্যাঙ্ক ও f7/f2 ঘরের দুর্বলতার দিকে সজাগ দৃষ্টি রাখো।',
  },
  openingBlunders: {
    titleBn: 'শুরুর চালের অসাবধানতা (Opening)',
    tipBn: 'ওপেনিংয়ে একই ঘুঁটি বারবার না চালিয়ে দ্রুত কেন্দ্র নিয়ন্ত্রণ ও রাজাকে ক্যাসলিং করে সুরক্ষিত করো।',
  },
  endgameBlunders: {
    titleBn: 'শেষ খেলায় ঘুঁটি হারানো (Endgame)',
    tipBn: 'ঘুঁটি কমে গেলে রাজাকে সক্রিয় করো এবং নিজের পাস্ট সৈন্যকে সাবধানে এগিয়ে নিয়ে যাও।',
  },
};

/**
 * Checks if a FEN represents an endgame (queens off or <= 6 total pieces remaining)
 */
function isEndgamePosition(fen: string): boolean {
  try {
    const chess = new Chess(fen);
    const board = chess.board();
    let pieceCount = 0;
    let whiteQueen = false;
    let blackQueen = false;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const sq = board[r][c];
        if (sq) {
          pieceCount++;
          if (sq.type === 'q' && sq.color === 'w') whiteQueen = true;
          if (sq.type === 'q' && sq.color === 'b') blackQueen = true;
        }
      }
    }

    if (pieceCount <= 6) return true;
    if (!whiteQueen && !blackQueen) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Analyzes a single game's reviewed moves to aggregate weakness occurrences.
 */
function analyzeGameWeaknesses(
  game: GameRecord,
  accumulator: Record<WeaknessKey, number>
): number {
  if (!game.analysis || !game.analysis.moves) {
    return 0;
  }

  let userMovesCount = 0;
  const userColor = game.userColor === 'white' ? 'w' : 'b';

  for (const m of game.analysis.moves) {
    if (!m.isUser) continue;
    userMovesCount++;

    const isBlunderOrMistake = m.classification === 'blunder' || m.classification === 'mistake';

    // 1. Hung piece detection
    if (isBlunderOrMistake) {
      const hung = detectHungPiece(m.fenAfter, userColor);
      if (hung) {
        accumulator.hungPieces++;
      }
    }

    // 2. Missed free piece detection
    if (isBlunderOrMistake && m.bestLine && m.bestLine.length > 0) {
      const missed = detectMissedFreePiece(m.fenBefore, userColor, m.bestLine[0]);
      if (missed) {
        accumulator.missedFreePieces++;
      }
    }

    // 3. Allowed fork
    if (isBlunderOrMistake) {
      const fork = detectAllowedFork(m.fenAfter, userColor);
      if (fork) {
        accumulator.allowedForks++;
      }
    }

    // 4. Missed mate in 1
    if (m.evalBefore && m.evalBefore.mate === 1 && m.classification !== 'good' && m.classification !== 'brilliant') {
      accumulator.missedMateInOne++;
    }

    // 5. Allowed mate in 1
    if (m.evalAfter && m.evalAfter.mate === 1) {
      accumulator.allowedMateInOne++;
    }

    // 6. Opening mistakes (ply <= 20, i.e. first 10 moves)
    if (m.ply <= 20 && isBlunderOrMistake) {
      accumulator.openingBlunders++;
    }

    // 7. Endgame mistakes
    if (isBlunderOrMistake && isEndgamePosition(m.fenBefore)) {
      accumulator.endgameBlunders++;
    }
  }

  return userMovesCount;
}

/**
 * Generates weakness profile from up to last 10 games.
 */
export function buildWeaknessProfile(games: GameRecord[]): WeaknessProfile {
  const recentGames = games.slice(0, 10);
  const counts: Record<WeaknessKey, number> = {
    hungPieces: 0,
    missedFreePieces: 0,
    allowedForks: 0,
    missedMateInOne: 0,
    allowedMateInOne: 0,
    openingBlunders: 0,
    endgameBlunders: 0,
  };

  let totalMoves = 0;
  for (const g of recentGames) {
    totalMoves += analyzeGameWeaknesses(g, counts);
  }

  const safeMoves = Math.max(1, totalMoves);

  // Convert to per 100 moves
  const statsList: WeaknessStat[] = (Object.keys(counts) as WeaknessKey[]).map((key) => {
    const count = counts[key];
    const per100Moves = Math.round((count / safeMoves) * 100 * 10) / 10;
    return {
      key,
      titleBn: WEAKNESS_METADATA[key].titleBn,
      count,
      per100Moves,
      tipBn: WEAKNESS_METADATA[key].tipBn,
    };
  });

  // Sort by count descending
  statsList.sort((a, b) => b.count - a.count || b.per100Moves - a.per100Moves);

  // Top 3 weaknesses (if count is 0, give standard beginner areas)
  const topWeaknesses = statsList.slice(0, 3);

  // Derive top 2 strengths based on low error areas and achievements
  const topStrengths: StrengthStat[] = [];

  const totalBlunders = recentGames.reduce((acc, g) => acc + (g.analysis?.blunderCount || 0), 0);
  const avgAccuracy =
    recentGames.length > 0
      ? Math.round(
          recentGames.reduce((acc, g) => acc + (g.accuracy || 0), 0) / recentGames.length
        )
      : 0;

  if (counts.allowedMateInOne === 0 && recentGames.length >= 2) {
    topStrengths.push({
      titleBn: 'রাজার সতর্ক নিরাপত্তা',
      descriptionBn: 'তুমি শেষ খেলাগুলোতে একবারও হুট করে ১ চালে মেট হওনি!',
    });
  } else if (counts.allowedForks === 0 && recentGames.length >= 2) {
    topStrengths.push({
      titleBn: 'ফর্ক সতর্ক দৃষ্টি',
      descriptionBn: 'ঘোড়া বা সৈন্যের যুগল আক্রমণ তুমি চমৎকারভাবে সামলেছো।',
    });
  } else if (avgAccuracy >= 65) {
    topStrengths.push({
      titleBn: 'উচ্চ নির্ভুলতা',
      descriptionBn: `গড় নির্ভুলতা চমৎকার (${avgAccuracy}%)। তোমার চালের মান বেশ ধারালো।`,
    });
  } else {
    topStrengths.push({
      titleBn: 'নিয়মিত অনুশীলন',
      descriptionBn: 'প্রতিটি নতুন খেলায় তুমি আগের ভুল থেকে শিখছো।',
    });
  }

  if (counts.openingBlunders <= 1 && recentGames.length >= 2) {
    topStrengths.push({
      titleBn: 'সুদৃঢ় ওপেনিং শুরু',
      descriptionBn: 'খেলার শুরুতে প্রথম ১০ চালে তুমি খুব কম ভুল করছো।',
    });
  } else if (totalBlunders <= recentGames.length) {
    topStrengths.push({
      titleBn: 'ধীরস্থির চাল',
      descriptionBn: 'অযথা বড় ভুল না করে সতর্কভাবে খেলছো।',
    });
  } else {
    topStrengths.push({
      titleBn: 'লড়াই করার মানসিকতা',
      descriptionBn: 'কঠিন পজিশনেও শেষ পর্যন্ত একাগ্রতা বজায় রাখছো।',
    });
  }

  let overallSummaryBn = 'তুমি সঠিক পথে আছো! প্রতিদিন একটি করে দুর্বলতার ওপর কাজ করো।';
  if (topWeaknesses[0] && topWeaknesses[0].count > 0) {
    overallSummaryBn = `আজকের মূল লক্ষ্য: ${topWeaknesses[0].titleBn} এড়িয়ে চলা।`;
  }

  return {
    gamesAnalyzedCount: recentGames.length,
    totalUserMovesCount: totalMoves,
    topWeaknesses,
    topStrengths,
    overallSummaryBn,
  };
}

/**
 * Suggests an opening tailored to user rating and favorite color.
 */
export function getSuggestedOpening(
  rating: number,
  userColor: 'white' | 'black' = 'white'
): { id: string; nameBn: string; reasonBn: string } {
  if (userColor === 'white') {
    if (rating < 900) {
      return {
        id: 'italian-game',
        nameBn: 'ইতালিয়ান গেম (Italian Game)',
        reasonBn: 'সহজ কেন্দ্র দখল ও দ্রুত রাজার নিরাপত্তা নিশ্চিত করার জন্য সবচেয়ে সেরা ওপেনিং।',
      };
    } else if (rating < 1300) {
      return {
        id: 'london-system',
        nameBn: 'লন্ডন সিস্টেম (London System)',
        reasonBn: 'নিরাপদ সলিড পিরামিড কাঠামো, যেখানে মুখস্থ না করেও চমৎকার খেলা যায়।',
      };
    } else {
      return {
        id: 'queens-gambit',
        nameBn: 'কুইন্স গ্যাম্বিট (Queen’s Gambit)',
        reasonBn: 'পজিশনাল আধিপত্য ও শক্তিশালী সেন্ট্রাল নিয়ন্ত্রণ প্রতিষ্ঠার ক্লাসিক্যাল পছন্দ।',
      };
    }
  } else {
    // Black
    if (rating < 900) {
      return {
        id: 'caro-kann',
        nameBn: 'কারো-কান ডিফেন্স (Caro-Kann)',
        reasonBn: 'সলিড কাঠামো এবং কোনো দুর্বলতা ছাড়া নিরাপদে খেলার সবচেয়ে আরামদায়ক পথ।',
      };
    } else if (rating < 1300) {
      return {
        id: 'french-defense',
        nameBn: 'ফ্রেঞ্চ ডিফেন্স (French Defense)',
        reasonBn: 'কাউন্টার-অ্যাটাকিং চেইন ও শক্তিশালী পজিশনাল চাপের জন্য দারুণ কার্যকর।',
      };
    } else {
      return {
        id: 'sicilian-defense',
        nameBn: 'সিসিলিয়ান ডিফেন্স (Sicilian Defense)',
        reasonBn: 'কালো দিয়ে জয়ের লক্ষ্য নিয়ে খেলার জন্য সবচেয়ে আগ্রাসী ও গতিশীল অস্ত্র।',
      };
    }
  }
}
