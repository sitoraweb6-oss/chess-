/**
 * Shared Chess Evaluator & Background Evaluation Service
 * "দাবা শিক্ষক" - Daba Shikkhok
 *
 * Provides:
 * 1. Safe evaluation of FENs with chess.js terminal checks (checkmate / draw)
 * 2. In-memory evaluation cache to avoid duplicate calculations
 * 3. Priority background evaluation queue for active games that yields immediately
 *    when the bot needs to calculate a move.
 */

import { Chess } from 'chess.js';
import { stockfishEngine, EvaluationResult } from './index.ts';

// In-memory cache for evaluated positions
const evaluationCache = new Map<string, EvaluationResult>();

/**
 * Checks if a FEN is terminal according to chess rules.
 * Checkmate: side to move has mate 0 against them.
 * Draw / Stalemate: cp 0.
 */
export function checkTerminalPosition(fen: string): EvaluationResult | null {
  try {
    const chess = new Chess(fen);
    if (chess.isCheckmate()) {
      return {
        mate: 0,
        cp: undefined,
        bestMove: '',
        pv: '',
      };
    }
    if (
      chess.isStalemate() ||
      chess.isDraw() ||
      chess.isInsufficientMaterial() ||
      chess.isThreefoldRepetition()
    ) {
      return {
        cp: 0,
        mate: undefined,
        bestMove: '',
        pv: '',
      };
    }
  } catch (err) {
    console.warn('[Evaluator] Chess.js parse warning for FEN:', fen, err);
  }
  return null;
}

/**
 * Evaluates a FEN safely:
 * 1. Checks memory cache.
 * 2. Checks terminal rules (never sends mated positions to Stockfish).
 * 3. Evaluates with Stockfish (300ms movetime, Skill Level 20).
 * 4. Retries once on transient failure.
 */
export async function evaluateFenSafe(
  fen: string,
  options: { movetime?: number } = {}
): Promise<EvaluationResult> {
  // Check cache
  const cached = evaluationCache.get(fen);
  if (cached) {
    return cached;
  }

  // Check terminal game-over position
  const terminal = checkTerminalPosition(fen);
  if (terminal) {
    evaluationCache.set(fen, terminal);
    return terminal;
  }

  // Call engine with 1 retry
  try {
    const result = await stockfishEngine.evaluate(fen, {
      movetime: options.movetime || 300,
    });
    evaluationCache.set(fen, result);
    return result;
  } catch (err1) {
    console.warn(`[Evaluator] Attempt 1 failed for FEN: ${fen}, retrying...`, err1);
    try {
      const result = await stockfishEngine.evaluate(fen, {
        movetime: options.movetime || 300,
      });
      evaluationCache.set(fen, result);
      return result;
    } catch (err2) {
      console.error(`[Evaluator] Attempt 2 failed for FEN: ${fen}`, err2);
      throw err2;
    }
  }
}

/**
 * Pre-populates evaluation cache (e.g. from saved GameRecord)
 */
export function seedEvaluationCache(evals: Record<string, EvaluationResult>): void {
  for (const [f, res] of Object.entries(evals)) {
    if (res && typeof res === 'object') {
      evaluationCache.set(f, res);
    }
  }
}

/**
 * Background evaluation controller for PlayScreen.
 * Ensures the bot's move search ALWAYS takes priority over background evaluations.
 */
class BackgroundEvaluatorService {
  private queue: string[] = [];
  private isRunning = false;
  private isPaused = false;
  private onEvalCompleteCallback?: (fen: string, result: EvaluationResult) => void;

  public setOnEvalComplete(callback: (fen: string, result: EvaluationResult) => void): void {
    this.onEvalCompleteCallback = callback;
  }

  /**
   * Adds a FEN to the background queue
   */
  public enqueue(fen: string): void {
    if (evaluationCache.has(fen)) {
      const cached = evaluationCache.get(fen)!;
      if (this.onEvalCompleteCallback) {
        this.onEvalCompleteCallback(fen, cached);
      }
      return;
    }

    if (!this.queue.includes(fen)) {
      this.queue.push(fen);
    }
    this.processQueue();
  }

  /**
   * Pauses background evaluations when the bot is thinking.
   */
  public pause(): void {
    this.isPaused = true;
  }

  /**
   * Resumes background evaluations when user is thinking.
   */
  public resume(): void {
    this.isPaused = false;
    this.processQueue();
  }

  /**
   * Clears pending queue
   */
  public clear(): void {
    this.queue = [];
    this.isRunning = false;
    this.isPaused = false;
  }

  private async processQueue(): Promise<void> {
    if (this.isRunning || this.isPaused || this.queue.length === 0) {
      return;
    }

    this.isRunning = true;
    const nextFen = this.queue.shift();

    if (nextFen) {
      try {
        if (!this.isPaused) {
          const result = await evaluateFenSafe(nextFen, { movetime: 250 });
          if (this.onEvalCompleteCallback) {
            this.onEvalCompleteCallback(nextFen, result);
          }
        }
      } catch (err) {
        console.warn('[BackgroundEvaluator] Background eval error:', err);
      }
    }

    this.isRunning = false;
    if (!this.isPaused && this.queue.length > 0) {
      // Small pause between evaluations to keep UI responsive
      setTimeout(() => this.processQueue(), 50);
    }
  }
}

export const backgroundEvaluator = new BackgroundEvaluatorService();
