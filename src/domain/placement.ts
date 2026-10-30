/**
 * Placement Game Pure Domain Logic
 * "দাবা শিক্ষক" - Daba Shikkhok
 *
 * Implements:
 * 1. Adaptive bot difficulty during placement game (starts level 4, adjusts +/-1 every 5 user moves).
 * 2. Pure rating estimation function based on game accuracy, blunders, mistakes, bot level, and result.
 * 3. Bangla feedback summary with strengths and weaknesses.
 */

export interface PlacementRatingResult {
  estimatedRating: number;
  botLevelReached: number;
  topStrengthBn: string;
  topWeaknessBn: string;
  summaryBn: string;
}

/**
 * Calculates adaptive bot level change during placement game.
 * Evaluated every 5 user moves based on average win percentage drop.
 * Range: 1 to 8.
 */
export function getAdaptiveBotLevel(
  currentLevel: number,
  avgWinDropLast5Moves: number
): number {
  let newLevel = currentLevel;
  // If player is playing very accurately (win drop < 7%), challenge them with higher level
  if (avgWinDropLast5Moves < 7) {
    newLevel += 1;
  }
  // If player is struggling (win drop > 18%), soften the opponent
  else if (avgWinDropLast5Moves > 18) {
    newLevel -= 1;
  }

  return Math.max(1, Math.min(8, newLevel));
}

/**
 * Pure function to estimate user rating from placement game metrics.
 *
 * Bands:
 * accuracy < 40  → 400 - 600
 * 40 - 55        → 600 - 900
 * 55 - 70        → 900 - 1200
 * 70 - 82        → 1200 - 1500
 * > 82           → 1500 - 1800
 *
 * Adjusted by result and final bot level reached.
 */
export function estimatePlacementRating(params: {
  accuracy: number;
  blunderCount: number;
  mistakeCount: number;
  movesCount: number;
  finalBotLevel: number;
  result: 'win' | 'loss' | 'draw';
}): PlacementRatingResult {
  const { accuracy, blunderCount, mistakeCount, movesCount, finalBotLevel, result } = params;

  // Base rating from accuracy
  let base = 600;
  if (accuracy < 40) {
    base = 450 + (accuracy / 40) * 150; // 450 - 600
  } else if (accuracy < 55) {
    base = 600 + ((accuracy - 40) / 15) * 300; // 600 - 900
  } else if (accuracy < 70) {
    base = 900 + ((accuracy - 55) / 15) * 300; // 900 - 1200
  } else if (accuracy < 82) {
    base = 1200 + ((accuracy - 70) / 12) * 300; // 1200 - 1500
  } else {
    base = 1500 + Math.min(300, ((accuracy - 82) / 18) * 300); // 1500 - 1800
  }

  // Adjustment by bot level (base level 4)
  const botLevelAdjustment = (finalBotLevel - 4) * 35;

  // Adjustment by game outcome
  let outcomeAdjustment = 0;
  if (result === 'win') outcomeAdjustment = 60;
  else if (result === 'draw') outcomeAdjustment = 20;
  else outcomeAdjustment = -40;

  // Adjustment for blunder rate per move
  const totalUserMoves = Math.max(1, Math.round(movesCount / 2));
  const blundersPerMove = blunderCount / totalUserMoves;
  const blunderPenalty = Math.round(blundersPerMove * 100);

  const rawRating = Math.round(base + botLevelAdjustment + outcomeAdjustment - blunderPenalty);
  const estimatedRating = Math.max(400, Math.min(2000, Math.round(rawRating / 25) * 25));

  // Determine strengths & weaknesses
  let topStrengthBn = 'ধৈর্যশীল খেলা ও আত্মরক্ষা';
  let topWeaknessBn = 'অসাবধানতাবশত ঘুঁটি হারানো';

  if (blunderCount === 0) {
    topStrengthBn = 'অসাধারণ একাগ্রতা—একটিও বড় ব্লান্ডার করেননি!';
  } else if (accuracy >= 75) {
    topStrengthBn = 'চমৎকার পজিশনাল নির্ভুলতা ও আক্রমণ!';
  } else if (result === 'win') {
    topStrengthBn = 'সুযোগ কাজে লাগিয়ে জয় ছিনিয়ে নেওয়ার দক্ষতা';
  } else {
    topStrengthBn = 'শুরু থেকে বোর্ড নিয়ন্ত্রণের সুন্দর চেষ্টা';
  }

  if (blunderCount >= 3) {
    topWeaknessBn = 'ঘুঁটি অরক্ষিত রেখে দেওয়া (Hanging pieces)';
  } else if (mistakeCount >= 4) {
    topWeaknessBn = 'আক্রমণের মুখে সঠিক ঘর বেছে নেওয়ার দ্বিধা';
  } else if (accuracy < 50) {
    topWeaknessBn = 'প্রতিপক্ষের ঘুঁটির আক্রমণের দিকে নজর রাখা';
  } else {
    topWeaknessBn = 'খেলায় দ্রুত সিদ্ধান্ত না নিয়ে গভীর পরিকল্পনা করা';
  }

  let summaryBn = '';
  if (estimatedRating < 700) {
    summaryBn =
      'দারুণ শুরু! দাবার নিয়ম ও ঘুঁটি বাঁচিয়ে খেলার মূল কৌশলগুলো আমরা ধাপে ধাপে একসাথে শিখব।';
  } else if (estimatedRating < 1100) {
    summaryBn =
      'তোমার খেলার ভিত্তি চমৎকার! কিছু ছোট ভুল ও ব্লান্ডার এড়িয়ে চললে তোমার রেটিং দ্রুত বৃদ্ধি পাবে।';
  } else if (estimatedRating < 1400) {
    summaryBn =
      'খুব সুন্দর বুদ্ধিমত্তা ও খেলা! এখন উন্নত কৌশল, ফর্ক ও পিন ট্যাকটিক্সে গভীর মনোযোগ দেওয়ার সময়।';
  } else {
    summaryBn =
      'অসাধারণ পারফরম্যান্স! তোমার চালগুলো অত্যন্ত শক্তিশালী ও পরিপক্ক। নিয়মিত অনুশীলনে তুমি মাস্টার স্তরে পৌঁছাবে!';
  }

  return {
    estimatedRating,
    botLevelReached: finalBotLevel,
    topStrengthBn,
    topWeaknessBn,
    summaryBn,
  };
}
