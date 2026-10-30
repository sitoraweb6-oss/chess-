/**
 * Versioned localStorage storage layer for "দাবা শিক্ষক"
 * Validates schemas, provides fallback defaults on corruption,
 * handles migrations (v1 -> v2 -> v3), and provides safe accessors.
 */

import { EvaluationResult } from '../engine/index.ts';
import { PersonalPuzzle, getNextDueDate } from '../domain/puzzles.ts';

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  level: UserLevel;
  createdAt: string;
  placementCompleted: boolean;
}

export interface RatingHistoryEntry {
  date: string;
  rating: number;
  gameId: string;
  change: number;
}

export type MoveClassification = 'brilliant' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export interface ReviewedMove {
  ply: number;
  san: string;
  uci: string;
  fenBefore: string;
  fenAfter: string;
  isUser: boolean;
  classification?: MoveClassification;
  evalBefore?: { cp?: number; mate?: number; bestMove?: string; pv?: string };
  evalAfter?: { cp?: number; mate?: number; bestMove?: string; pv?: string };
  winDrop?: number;
  accuracy?: number;
  explanation?: string;
  bestMoveSan?: string;
  bestLine?: string[];
}

export interface GameAnalysis {
  accuracy: number;
  brilliantCount: number;
  goodCount: number;
  inaccuracyCount: number;
  mistakeCount: number;
  blunderCount: number;
  moves: ReviewedMove[];
}

export interface GameRecord {
  id: string;
  pgn: string;
  fen: string;
  userColor: 'white' | 'black';
  botLevel: number;
  date: string;
  result: 'win' | 'loss' | 'draw';
  resultReason: string;
  accuracy: number;
  movesCount: number;
  analysis?: GameAnalysis;
  evaluationsByFen?: Record<string, EvaluationResult>;
  isPlacement?: boolean;
}

export interface UserSettings {
  sound: boolean;
  showLegalMoves: boolean;
  showCoordinates: boolean;
  appTheme: 'light' | 'dark' | 'paper';
  boardTheme: 'classic' | 'wood' | 'blue' | 'slate' | 'purple' | 'coral';
  pieceSet: 'standard' | 'modern';
  animationSpeed: 'fast' | 'normal' | 'slow';
}

export interface ActiveGameState {
  fen: string;
  pgn: string;
  userColor: 'white' | 'black';
  botLevel: number;
  hintsUsed: number;
  undosUsed: number;
  history: string[];
  evaluationsByFen?: Record<string, EvaluationResult>;
  isPlacement?: boolean;
}

export interface OpeningProgressRecord {
  completedLesson: boolean;
  practiceScore: number;
  attempts: number;
  lastPracticed?: string;
}

export interface StorageData {
  version: 3;
  profile: UserProfile;
  rating: number;
  ratingHistory: RatingHistoryEntry[];
  games: GameRecord[];
  settings: UserSettings;
  activeGame?: ActiveGameState | null;
  openingProgress: Record<string, OpeningProgressRecord>;
  puzzles: PersonalPuzzle[];
}

const STORAGE_KEY = 'dabaShikkhok:v1';
const CURRENT_VERSION = 3;

export const DEFAULT_SETTINGS: UserSettings = {
  sound: true,
  showLegalMoves: true,
  showCoordinates: true,
  appTheme: 'light',
  boardTheme: 'classic',
  pieceSet: 'standard',
  animationSpeed: 'normal',
};

export const DEFAULT_STORAGE_DATA: StorageData = {
  version: CURRENT_VERSION,
  profile: {
    level: 'beginner',
    createdAt: new Date().toISOString(),
    placementCompleted: false,
  },
  rating: 600,
  ratingHistory: [
    {
      date: new Date().toISOString(),
      rating: 600,
      gameId: 'init',
      change: 0,
    },
  ],
  games: [],
  settings: DEFAULT_SETTINGS,
  activeGame: null,
  openingProgress: {},
  puzzles: [],
};

function isValidObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function validateAndMigrateData(data: unknown): StorageData {
  if (!isValidObject(data)) {
    return { ...DEFAULT_STORAGE_DATA };
  }

  // Validate openingProgress
  const rawOpeningProgress = isValidObject(data.openingProgress) ? data.openingProgress : {};
  const openingProgress: Record<string, OpeningProgressRecord> = {};

  for (const [key, val] of Object.entries(rawOpeningProgress)) {
    if (isValidObject(val)) {
      openingProgress[key] = {
        completedLesson: typeof val.completedLesson === 'boolean' ? val.completedLesson : false,
        practiceScore: typeof val.practiceScore === 'number' ? val.practiceScore : 0,
        attempts: typeof val.attempts === 'number' ? val.attempts : 0,
        lastPracticed: typeof val.lastPracticed === 'string' ? val.lastPracticed : undefined,
      };
    }
  }

  // Validate profile
  let profile = DEFAULT_STORAGE_DATA.profile;
  if (isValidObject(data.profile)) {
    const rawLevel = data.profile.level;
    const level: UserLevel =
      rawLevel === 'beginner' || rawLevel === 'intermediate' || rawLevel === 'advanced'
        ? rawLevel
        : 'beginner';
    const createdAt =
      typeof data.profile.createdAt === 'string'
        ? data.profile.createdAt
        : new Date().toISOString();
    const placementCompleted =
      typeof data.profile.placementCompleted === 'boolean'
        ? data.profile.placementCompleted
        : false;
    profile = { level, createdAt, placementCompleted };
  }

  // Validate rating
  const rating =
    typeof data.rating === 'number' && !isNaN(data.rating) && data.rating > 0
      ? Math.round(data.rating)
      : 600;

  // Validate ratingHistory
  const ratingHistory: RatingHistoryEntry[] = Array.isArray(data.ratingHistory)
    ? data.ratingHistory.filter((item): item is RatingHistoryEntry => {
        return (
          isValidObject(item) &&
          typeof item.date === 'string' &&
          typeof item.rating === 'number' &&
          typeof item.change === 'number'
        );
      })
    : DEFAULT_STORAGE_DATA.ratingHistory;

  // Validate games
  const games: GameRecord[] = Array.isArray(data.games)
    ? data.games.filter((g): g is GameRecord => {
        return (
          isValidObject(g) &&
          typeof g.id === 'string' &&
          typeof g.pgn === 'string' &&
          (g.result === 'win' || g.result === 'loss' || g.result === 'draw')
        );
      })
    : [];

  // Validate settings
  const rawSettings = isValidObject(data.settings) ? data.settings : {};
  const validBoardThemes = ['classic', 'wood', 'blue', 'slate', 'purple', 'coral'];
  const validAppThemes = ['light', 'dark', 'paper'];
  const validPieceSets = ['standard', 'modern'];
  const validSpeed = ['fast', 'normal', 'slow'];

  const settings: UserSettings = {
    sound: typeof rawSettings.sound === 'boolean' ? rawSettings.sound : true,
    showLegalMoves:
      typeof rawSettings.showLegalMoves === 'boolean' ? rawSettings.showLegalMoves : true,
    showCoordinates:
      typeof rawSettings.showCoordinates === 'boolean' ? rawSettings.showCoordinates : true,
    appTheme: validAppThemes.includes(rawSettings.appTheme as string)
      ? (rawSettings.appTheme as UserSettings['appTheme'])
      : 'light',
    boardTheme: validBoardThemes.includes(rawSettings.boardTheme as string)
      ? (rawSettings.boardTheme as UserSettings['boardTheme'])
      : 'classic',
    pieceSet: validPieceSets.includes(rawSettings.pieceSet as string)
      ? (rawSettings.pieceSet as UserSettings['pieceSet'])
      : 'standard',
    animationSpeed: validSpeed.includes(rawSettings.animationSpeed as string)
      ? (rawSettings.animationSpeed as UserSettings['animationSpeed'])
      : 'normal',
  };

  // Validate active game
  let activeGame: ActiveGameState | null = null;
  if (isValidObject(data.activeGame)) {
    if (
      typeof data.activeGame.fen === 'string' &&
      typeof data.activeGame.pgn === 'string' &&
      (data.activeGame.userColor === 'white' || data.activeGame.userColor === 'black')
    ) {
      activeGame = {
        fen: data.activeGame.fen,
        pgn: data.activeGame.pgn,
        userColor: data.activeGame.userColor,
        botLevel: typeof data.activeGame.botLevel === 'number' ? data.activeGame.botLevel : 1,
        hintsUsed: typeof data.activeGame.hintsUsed === 'number' ? data.activeGame.hintsUsed : 0,
        undosUsed: typeof data.activeGame.undosUsed === 'number' ? data.activeGame.undosUsed : 0,
        history: Array.isArray(data.activeGame.history) ? data.activeGame.history : [],
        evaluationsByFen: isValidObject(data.activeGame.evaluationsByFen)
          ? (data.activeGame.evaluationsByFen as Record<string, EvaluationResult>)
          : undefined,
        isPlacement: typeof data.activeGame.isPlacement === 'boolean' ? data.activeGame.isPlacement : false,
      };
    }
  }

  // Validate puzzles
  const puzzles: PersonalPuzzle[] = Array.isArray(data.puzzles)
    ? data.puzzles.filter((p): p is PersonalPuzzle => {
        return (
          isValidObject(p) &&
          typeof p.id === 'string' &&
          typeof p.fenBefore === 'string' &&
          typeof p.bestMoveSan === 'string'
        );
      })
    : [];

  return {
    version: CURRENT_VERSION,
    profile,
    rating,
    ratingHistory,
    games: games.slice(0, 50),
    settings,
    activeGame,
    openingProgress,
    puzzles,
  };
}

export function getStorageData(): StorageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_STORAGE_DATA };
    }
    const parsed = JSON.parse(raw);
    return validateAndMigrateData(parsed);
  } catch {
    return { ...DEFAULT_STORAGE_DATA };
  }
}

export function saveStorageData(data: StorageData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function updateStorageProfile(
  level: UserLevel,
  startingRating: number,
  placementCompleted: boolean = false
): StorageData {
  const current = getStorageData();
  const updated: StorageData = {
    ...current,
    profile: {
      level,
      createdAt: new Date().toISOString(),
      placementCompleted,
    },
    rating: startingRating,
    ratingHistory: [
      {
        date: new Date().toISOString(),
        rating: startingRating,
        gameId: 'onboarding',
        change: 0,
      },
    ],
  };
  saveStorageData(updated);
  return updated;
}

export const SETTINGS_CHANGE_EVENT = 'daba:settings-changed';

export function updateUserSettings(settings: Partial<UserSettings>): StorageData {
  const current = getStorageData();
  const updated: StorageData = {
    ...current,
    settings: {
      ...current.settings,
      ...settings,
    },
  };
  saveStorageData(updated);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT, { detail: updated.settings }));
  }
  return updated;
}

export function saveCompletedGame(
  gameRecord: GameRecord,
  ratingChange: number,
  newRating: number
): StorageData {
  const current = getStorageData();
  const updatedGames = [gameRecord, ...current.games].slice(0, 50);
  const updatedRatingHistory: RatingHistoryEntry[] = [
    ...current.ratingHistory,
    {
      date: new Date().toISOString(),
      rating: newRating,
      gameId: gameRecord.id,
      change: ratingChange,
    },
  ];

  const updated: StorageData = {
    ...current,
    rating: newRating,
    ratingHistory: updatedRatingHistory,
    games: updatedGames,
    activeGame: null, // clear active game when game finishes
  };
  saveStorageData(updated);
  return updated;
}

export function cacheGameAnalysis(gameId: string, analysis: GameAnalysis): StorageData {
  const current = getStorageData();
  const updatedGames = current.games.map((g) => {
    if (g.id === gameId) {
      return {
        ...g,
        accuracy: analysis.accuracy,
        analysis,
      };
    }
    return g;
  });

  const updated: StorageData = {
    ...current,
    games: updatedGames,
  };
  saveStorageData(updated);
  return updated;
}

export function saveActiveGame(active: ActiveGameState | null): void {
  const current = getStorageData();
  saveStorageData({
    ...current,
    activeGame: active,
  });
}

export function getActiveGame(): ActiveGameState | null {
  const data = getStorageData();
  return data.activeGame ?? null;
}

export function clearActiveGame(): void {
  saveActiveGame(null);
}

export function resetAllStorage(): StorageData {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to reset storage:', err);
  }
  return { ...DEFAULT_STORAGE_DATA };
}

export function getOpeningProgress(openingId: string): OpeningProgressRecord {
  const data = getStorageData();
  return (
    data.openingProgress[openingId] || {
      completedLesson: false,
      practiceScore: 0,
      attempts: 0,
    }
  );
}

export function updateOpeningProgress(
  openingId: string,
  progress: Partial<OpeningProgressRecord>
): StorageData {
  const current = getStorageData();
  const existing = current.openingProgress[openingId] || {
    completedLesson: false,
    practiceScore: 0,
    attempts: 0,
  };

  const updatedProgress: OpeningProgressRecord = {
    ...existing,
    ...progress,
    practiceScore:
      typeof progress.practiceScore === 'number'
        ? Math.max(existing.practiceScore, progress.practiceScore)
        : existing.practiceScore,
    attempts: existing.attempts + (progress.attempts ? progress.attempts : 1),
    lastPracticed: new Date().toISOString(),
  };

  const updated: StorageData = {
    ...current,
    openingProgress: {
      ...current.openingProgress,
      [openingId]: updatedProgress,
    },
  };
  saveStorageData(updated);
  return updated;
}

export function getTotalOpeningsProgress(totalOpeningsCount: number = 18): {
  completedCount: number;
  totalCount: number;
  avgPracticeScore: number;
} {
  const data = getStorageData();
  const values = Object.values(data.openingProgress);
  const completedCount = values.filter((v) => v.completedLesson).length;
  const scored = values.filter((v) => v.practiceScore > 0);
  const avgPracticeScore =
    scored.length > 0
      ? Math.round(scored.reduce((acc, v) => acc + v.practiceScore, 0) / scored.length)
      : 0;

  return {
    completedCount,
    totalCount: totalOpeningsCount,
    avgPracticeScore,
  };
}

/**
 * Adds new mistake puzzles to storage, avoiding duplicates by puzzle.id
 */
export function addPersonalPuzzles(newPuzzles: PersonalPuzzle[]): StorageData {
  const current = getStorageData();
  const existingMap = new Map(current.puzzles.map((p) => [p.id, p]));

  for (const p of newPuzzles) {
    if (!existingMap.has(p.id)) {
      existingMap.set(p.id, p);
    }
  }

  // Keep up to 100 most recent puzzles
  const updatedPuzzles = Array.from(existingMap.values()).slice(-100);

  const updated: StorageData = {
    ...current,
    puzzles: updatedPuzzles,
  };
  saveStorageData(updated);
  return updated;
}

/**
 * Updates a personal puzzle with user result (spaced repetition progression)
 */
export function updatePersonalPuzzle(puzzleId: string, isSolved: boolean): StorageData {
  const current = getStorageData();
  const updatedPuzzles = current.puzzles.map((p) => {
    if (p.id !== puzzleId) return p;

    if (isSolved) {
      const nextBox = Math.min(4, p.box + 1);
      return {
        ...p,
        box: nextBox,
        dueDate: getNextDueDate(nextBox),
        solvedCount: p.solvedCount + 1,
        lastPracticed: new Date().toISOString(),
      };
    } else {
      // Failed: reset to box 0, due tomorrow
      return {
        ...p,
        box: 0,
        dueDate: getNextDueDate(0),
        failedCount: p.failedCount + 1,
        lastPracticed: new Date().toISOString(),
      };
    }
  });

  const updated: StorageData = {
    ...current,
    puzzles: updatedPuzzles,
  };
  saveStorageData(updated);
  return updated;
}

/**
 * Retrieves all personal puzzles that are currently due for review
 */
export function getDuePersonalPuzzles(): PersonalPuzzle[] {
  const data = getStorageData();
  const now = Date.now();
  return data.puzzles.filter((p) => {
    if (!p.dueDate) return true;
    return new Date(p.dueDate).getTime() <= now;
  });
}

export function hasCompletedOnboarding(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.profile?.createdAt && parsed?.rating);
  } catch {
    return false;
  }
}
