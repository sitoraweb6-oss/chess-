/**
 * Pure domain logic for Rating and Elo calculations
 * "দাবা শিক্ষক" - Daba Shikkhok
 */

import { toBanglaNumeral } from '../i18n/bn.ts';

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

export interface SoloEloPreset {
  elo: number;
  labelBn: string;
  tierBn: string;
}

export const SOLO_ENGINE_ELO_PRESETS: SoloEloPreset[] = [
  { elo: 1000, labelBn: '১০০০ এলো', tierBn: 'সহজ / শিক্ষানবিস' },
  { elo: 1500, labelBn: '১৫০০ এলো', tierBn: 'মাঝারি / ক্লাব খেলোয়াড়' },
  { elo: 1800, labelBn: '১৮০০ এলো', tierBn: 'উন্নত / অভিজ্ঞ' },
  { elo: 2000, labelBn: '২০০০+ এলো', tierBn: 'মাস্টার স্তর' },
  { elo: 2500, labelBn: '২৫০০+ এলো', tierBn: 'গ্র্যান্ডমাস্টার (সর্বোচ্চ)' },
];

/**
 * Maps an ELO rating (800 - 2600) to Stockfish skill level (0 - 20)
 */
export function getSkillLevelFromElo(elo: number): number {
  if (elo >= 2400) return 20;
  if (elo <= 800) return 0;
  // Linear interpolation: 800 -> 0, 2400 -> 20
  return Math.max(0, Math.min(20, Math.round(((elo - 800) * 20) / 1600)));
}

/**
 * Move calculation time according to brain strength (250ms - 800ms)
 */
export function getMoveTimeFromElo(elo: number): number {
  if (elo >= 2400) return 700;
  if (elo >= 2000) return 550;
  if (elo >= 1500) return 400;
  return 250;
}

/**
 * User-facing title for engine brain level in Bangla
 */
export function getEloBrainTitleBn(elo: number): string {
  if (elo >= 2400) return '২৫০০+ এলো (গ্র্যান্ডমাস্টার)';
  if (elo >= 2000) return `${toBanglaNumeral(elo)}+ এলো (মাস্টার)`;
  if (elo >= 1700) return `${toBanglaNumeral(elo)} এলো (উন্নত)`;
  if (elo >= 1400) return `${toBanglaNumeral(elo)} এলো (ক্লাব)`;
  return `${toBanglaNumeral(elo)} এলো (সহজ)`;
}

/**
 * Friendly explanation of how this brain level plays
 */
export function getEloTierDescriptionBn(elo: number): string {
  if (elo >= 2400) {
    return 'গ্র্যান্ডমাস্টার ও সুপারকম্পিউটার নিখুঁত হিসাব; যেকোনো জটিল ট্যাকটিক্সে সেরা চাল বের করে।';
  }
  if (elo >= 2000) {
    return 'মাস্টার স্তরের গভীর পজিশনাল দৃষ্টিভঙ্গি ও সূক্ষ্ম কৌশলগত চালের পরামর্শ দেয়।';
  }
  if (elo >= 1700) {
    return 'অভিজ্ঞ ও আক্রমণাত্মক ক্লাব খেলোয়াড়ের মতো শক্তিশালী ও ব্যবহারিক চাল সুপারিশ করে।';
  }
  if (elo >= 1400) {
    return 'ক্লাব খেলোয়াড়দের উপযোগী স্বাভাবিক, বাস্তবসম্মত চাল ও মৌলিক ট্যাকটিক্স দেখায়।';
  }
  return 'নতুনদের উপযোগী সহজবোধ্য চাল ও সাধারণ ভুল বাঁচানোর প্রাথমিক পরামর্শ দেয়।';
}

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

