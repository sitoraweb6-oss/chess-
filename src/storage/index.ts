/**
 * Versioned localStorage storage layer for "দাবা শিক্ষক"
 * Validates schemas, provides fallback defaults on corruption,
 * handles migrations, and provides safe accessors.
 */

export type UserLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  level: UserLevel;
  createdAt: string;
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
}

export interface UserSettings {
  sound: boolean;
  showLegalMoves: boolean;
  boardTheme: 'classic' | 'wood' | 'green';
}

export interface ActiveGameState {
  fen: string;
  pgn: string;
  userColor: 'white' | 'black';
  botLevel: number;
  hintsUsed: number;
  undosUsed: number;
  history: string[];
}

export interface OpeningProgressRecord {
  completedLesson: boolean;
  practiceScore: number;
  attempts: number;
  lastPracticed?: string;
}

export interface StorageData {
  version: 2;
  profile: UserProfile;
  rating: number;
  ratingHistory: RatingHistoryEntry[];
  games: GameRecord[];
  settings: UserSettings;
  activeGame?: ActiveGameState | null;
  openingProgress: Record<string, OpeningProgressRecord>;
}

const STORAGE_KEY = 'dabaShikkhok:v1';
const CURRENT_VERSION = 2;

export const DEFAULT_SETTINGS: UserSettings = {
  sound: true,
  showLegalMoves: true,
  boardTheme: 'classic',
};

export const DEFAULT_STORAGE_DATA: StorageData = {
  version: CURRENT_VERSION,
  profile: {
    level: 'beginner',
    createdAt: new Date().toISOString(),
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
};

function isValidObject(val: unknown): val is Record<string, unknown> {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function validateAndMigrateData(data: unknown): StorageData {
  if (!isValidObject(data)) {
    return { ...DEFAULT_STORAGE_DATA };
  }

  // Version 1 to 2 migration
  const version = typeof data.version === 'number' ? data.version : 1;
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
    profile = { level, createdAt };
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
  const settings: UserSettings = {
    sound: typeof rawSettings.sound === 'boolean' ? rawSettings.sound : true,
    showLegalMoves:
      typeof rawSettings.showLegalMoves === 'boolean' ? rawSettings.showLegalMoves : true,
    boardTheme:
      rawSettings.boardTheme === 'wood' || rawSettings.boardTheme === 'green'
        ? rawSettings.boardTheme
        : 'classic',
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
      };
    }
  }

  return {
    version: CURRENT_VERSION,
    profile,
    rating,
    ratingHistory,
    games: games.slice(-50), // keep last 50 games
    settings,
    activeGame,
    openingProgress,
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

export function updateStorageProfile(level: UserLevel, startingRating: number): StorageData {
  const current = getStorageData();
  const updated: StorageData = {
    ...current,
    profile: {
      level,
      createdAt: new Date().toISOString(),
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
    // Keep best practice score
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

export function getTotalOpeningsProgress(totalOpeningsCount: number = 8): {
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
