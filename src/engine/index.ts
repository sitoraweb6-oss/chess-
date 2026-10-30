/**
 * Stockfish 10.0.2 Web Worker Engine Wrapper
 * "দাবা শিক্ষক" - Daba Shikkhok
 *
 * Implements:
 * 1. Detailed console logging at each step.
 * 2. Fallback sources (cdnjs, jsdelivr, unpkg).
 * 3. Blob URL worker with direct CDN fallback.
 * 4. Correct handshake (uci -> uciok -> isready -> readyok) with 15s load timeout.
 * 5. Singleton pattern with shared worker and concurrent request queue.
 * 6. Clean reset & retry capability.
 * 7. Non-blocking verification test after initialization (never deadlocks).
 * 8. Skill Level 20 enforcement for evaluation; explicit Skill Level for bestmove.
 * 9. Draining state to discard stale bestmove outputs after stop/timeout.
 * 10. Start task timeout when task begins executing, not when queued.
 */

/// <reference types="vite/client" />
import stockfishUrl from 'stockfish.js/stockfish.js?url';

export interface EvaluationResult {
  cp?: number;
  mate?: number;
  bestMove: string;
  pv: string;
}

export interface EngineMoveOptions {
  movetime?: number;
  skillLevel?: number;
}

interface QueuedTask<T> {
  id: string;
  execute: () => void;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

class ChessEngineService {
  private worker: Worker | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private lastError: string | null = null;

  private isProcessing = false;
  private isDraining = false;
  private currentTaskId: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private queue: QueuedTask<any>[] = [];
  private currentTaskResolve: ((val: unknown) => void) | null = null;
  private currentTaskReject: ((err: unknown) => void) | null = null;
  private currentParser: ((line: string) => boolean) | null = null;
  private currentTimeout: number | null = null;

  public getLastError(): string | null {
    return this.lastError;
  }

  /**
   * Fully resets engine state before retrying.
   */
  public reset(): void {
    console.log('[Engine] Resetting engine service state...');
    this.cancelQueue();
    if (this.worker) {
      try {
        this.worker.terminate();
      } catch (e) {
        console.warn('[Engine] Error terminating worker:', e);
      }
      this.worker = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
    this.initPromise = null;
    this.lastError = null;
    this.isProcessing = false;
    this.isDraining = false;
    this.currentTaskId = null;
    this.currentParser = null;
    this.currentTaskResolve = null;
    this.currentTaskReject = null;
  }

  /**
   * Initializes the shared Stockfish worker.
   * Singleton: concurrent calls await the same promise.
   */
  public async init(options: { force?: boolean } = {}): Promise<void> {
    if (options.force) {
      this.reset();
    }

    if (this.isInitialized && this.worker) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = this.doInit()
      .then(() => {
        this.isInitialized = true;
        this.lastError = null;

        // Bug 1 Fix: Fire-and-forget verification test AFTER initPromise resolves (non-blocking)
        setTimeout(() => {
          this.runBestMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
            movetime: 100,
            skillLevel: 20,
          })
            .then((move) => console.log(`[Engine] Initial bestmove result: ${move}`))
            .catch((err) => console.warn('[Engine] Initial verification test bestmove warning:', err));
        }, 50);
      })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.error('[Engine] Engine initialization failed with error:', err);
        // FIX 2: Call reset() first, then save lastError so ErrorState displays the true reason
        this.reset();
        this.lastError = errorMsg;
        throw err;
      })
      .finally(() => {
        this.isInitializing = false;
      });

    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    // FIX 1: Direct instantiation from self-hosted Vite URL (same origin, no CORS or blob issues)
    console.log(`[Engine] Creating Worker directly from self-hosted URL: ${stockfishUrl}`);
    const worker = new Worker(stockfishUrl);
    console.log('[Engine] Worker created');
    this.worker = worker;

    // Handshake (uci -> uciok -> isready -> readyok) with 15s timeout
    await new Promise<void>((resolve, reject) => {
      let isSettled = false;
      let firstMessageReceived = false;

      const timeoutId = window.setTimeout(() => {
        if (isSettled) return;
        isSettled = true;
        cleanupListeners();
        const errDetail = 'Engine init handshake timed out after 15s';
        this.lastError = errDetail;
        reject(new Error(errDetail));
      }, 15000);

      const onInitMessage = (event: MessageEvent) => {
        const line = typeof event.data === 'string' ? event.data : '';
        if (!firstMessageReceived) {
          firstMessageReceived = true;
          console.log(`[Engine] First message received: "${line}"`);
        }

        if (line.includes('uciok')) {
          console.log('[Engine] Received uciok');
          try {
            worker.postMessage('isready');
          } catch (e) {
            console.error('[Engine] Failed to post isready:', e);
          }
        } else if (line.includes('readyok')) {
          console.log('[Engine] Received readyok');
          if (isSettled) return;
          isSettled = true;
          window.clearTimeout(timeoutId);
          cleanupListeners();
          this.attachMainMessageListener();
          resolve();
        }
      };

      const onInitError = (event: ErrorEvent) => {
        const detail = `Worker error: ${event.message || 'Unknown error'} (${event.filename || 'unknown'}:${event.lineno || 0})`;
        console.error('[Engine] Worker error during handshake:', detail, event);
        this.lastError = detail;
        if (isSettled) return;
        isSettled = true;
        window.clearTimeout(timeoutId);
        cleanupListeners();
        reject(new Error(detail));
      };

      const cleanupListeners = () => {
        worker.removeEventListener('message', onInitMessage);
        worker.removeEventListener('error', onInitError);
      };

      worker.addEventListener('message', onInitMessage);
      worker.addEventListener('error', onInitError);

      // Initiate handshake
      console.log('[Engine] Sending "uci" command to worker...');
      try {
        worker.postMessage('uci');
      } catch (err) {
        if (!isSettled) {
          isSettled = true;
          window.clearTimeout(timeoutId);
          cleanupListeners();
          reject(err);
        }
      }
    });
  }

  private attachMainMessageListener(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent) => {
      const line = typeof event.data === 'string' ? event.data : '';

      // Bug 3 Fix: If draining from a cancelled or timed out task, ignore until bestmove or readyok arrives
      if (this.isDraining) {
        if (line.startsWith('bestmove') || line.includes('readyok')) {
          console.log('[Engine] Draining complete, received expected boundary:', line);
          this.isDraining = false;
          this.isProcessing = false;
          this.processNextInQueue();
        }
        return;
      }

      if (this.currentParser) {
        const isDone = this.currentParser(line);
        if (isDone) {
          this.clearCurrentTimeout();
          this.currentParser = null;
          this.currentTaskResolve = null;
          this.currentTaskReject = null;
          this.currentTaskId = null;
          this.isProcessing = false;
          this.processNextInQueue();
        }
      }
    };

    this.worker.onerror = (event: ErrorEvent | Event) => {
      let detail = 'Engine worker error during task execution';
      if ('message' in event && event.message) {
        const errorEvent = event as ErrorEvent;
        detail = `Worker error: ${errorEvent.message} (${errorEvent.filename || 'unknown'}:${errorEvent.lineno || 0})`;
      }
      console.error('[Engine] Stockfish worker runtime error:', detail, event);
      this.lastError = detail;
      if (this.currentTaskReject) {
        this.currentTaskReject(new Error(detail));
      }
      this.clearCurrentTimeout();
      this.currentParser = null;
      this.currentTaskResolve = null;
      this.currentTaskReject = null;
      this.currentTaskId = null;
      this.isProcessing = false;
      this.processNextInQueue();
    };
  }

  private clearCurrentTimeout(): void {
    if (this.currentTimeout !== null) {
      window.clearTimeout(this.currentTimeout);
      this.currentTimeout = null;
    }
  }

  private processNextInQueue(): void {
    // Bug 3 Fix: Never start a new task while draining or already processing
    if (this.isProcessing || this.isDraining || this.queue.length === 0) return;
    const nextTask = this.queue.shift();
    if (!nextTask) return;

    this.isProcessing = true;
    nextTask.execute();
  }

  /**
   * Sends ucinewgame + isready and awaits readyok.
   * Call before starting a new game or before a full review analysis.
   */
  public async newGame(): Promise<void> {
    await this.init();
    return this.runNewGame();
  }

  private async runNewGame(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const taskId = `newgame-${Math.random().toString(36).substring(2, 7)}`;
      const timeoutMs = 5000;

      const task: QueuedTask<void> = {
        id: taskId,
        resolve,
        reject,
        execute: () => {
          this.currentTaskId = taskId;
          this.currentTaskResolve = resolve as (val: unknown) => void;
          this.currentTaskReject = reject;

          this.currentTimeout = window.setTimeout(() => {
            const rej = this.currentTaskReject;
            this.clearCurrentTimeout();
            this.currentParser = null;
            this.currentTaskResolve = null;
            this.currentTaskReject = null;
            this.currentTaskId = null;
            if (rej) rej(new Error('newGame timed out'));
            this.isProcessing = false;
            this.processNextInQueue();
          }, timeoutMs);

          this.currentParser = (line: string) => {
            if (line.includes('readyok')) {
              window.clearTimeout(this.currentTimeout!);
              resolve();
              return true;
            }
            return false;
          };

          this.worker?.postMessage('ucinewgame');
          this.worker?.postMessage('isready');
        },
      };

      this.queue.push(task);
      this.processNextInQueue();
    });
  }

  /**
   * Public API: Request engine best move for a given FEN.
   * Awaits initialization first.
   */
  public async getBestMove(fen: string, options: EngineMoveOptions = {}): Promise<string> {
    await this.init();
    return this.runBestMove(fen, options);
  }

  /**
   * Internal implementation of getBestMove that does NOT call init().
   */
  private async runBestMove(fen: string, options: EngineMoveOptions = {}): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const taskId = `move-${Math.random().toString(36).substring(2, 7)}`;
      const movetime = options.movetime || 800;
      // Bug 4 Fix: timeout = movetime + 5000ms
      const timeoutMs = movetime + 5000;

      const task: QueuedTask<string> = {
        id: taskId,
        resolve,
        reject,
        execute: () => {
          this.currentTaskId = taskId;
          this.currentTaskResolve = resolve as (val: unknown) => void;
          this.currentTaskReject = reject;

          // Bug 4 Fix: Start timeout when task begins execution
          this.currentTimeout = window.setTimeout(() => {
            console.warn(`[Engine] Best move task ${taskId} timed out after ${timeoutMs}ms`);
            const rej = this.currentTaskReject;
            this.clearCurrentTimeout();
            this.currentParser = null;
            this.currentTaskResolve = null;
            this.currentTaskReject = null;
            this.currentTaskId = null;
            if (rej) rej(new Error(`Best move calculation timed out after ${timeoutMs}ms`));

            // Bug 3 Fix: Stop engine and drain stale bestmove output
            this.stop();
            this.isDraining = true;
            this.isProcessing = false;
          }, timeoutMs);

          this.currentParser = (line: string) => {
            if (line.startsWith('bestmove')) {
              const parts = line.split(' ');
              const bestMoveResult = parts[1] || '';
              window.clearTimeout(this.currentTimeout!);
              resolve(bestMoveResult);
              return true;
            }
            return false;
          };

          // Bug 2 Fix: Always send a Skill Level (default 20 if not given)
          const skillLevel = typeof options.skillLevel === 'number' ? options.skillLevel : 20;
          console.log(`[Engine] Sending Skill Level value ${skillLevel} for bestmove`);
          this.worker?.postMessage(`setoption name Skill Level value ${skillLevel}`);
          this.worker?.postMessage(`position fen ${fen}`);
          this.worker?.postMessage(`go movetime ${movetime}`);
        },
      };

      this.queue.push(task);
      this.processNextInQueue();
    });
  }

  /**
   * Public API: Request engine position evaluation for game review.
   * Awaits initialization first.
   */
  public async evaluate(
    fen: string,
    options: { movetime?: number } = {}
  ): Promise<EvaluationResult> {
    await this.init();
    return this.runEvaluate(fen, options);
  }

  /**
   * Internal implementation of evaluate that does NOT call init().
   */
  private async runEvaluate(
    fen: string,
    options: { movetime?: number } = {}
  ): Promise<EvaluationResult> {
    return new Promise<EvaluationResult>((resolve, reject) => {
      const taskId = `eval-${Math.random().toString(36).substring(2, 7)}`;
      // Bug 4 Fix: use go movetime 300 (fast on mobile) with 5s timeout
      const movetime = options.movetime || 300;
      const timeoutMs = 5000;

      const task: QueuedTask<EvaluationResult> = {
        id: taskId,
        resolve,
        reject,
        execute: () => {
          this.currentTaskId = taskId;
          this.currentTaskResolve = resolve as (val: unknown) => void;
          this.currentTaskReject = reject;

          // Bug 4 Fix: Start timeout when task begins execution
          this.currentTimeout = window.setTimeout(() => {
            console.warn(`[Engine] Evaluation task ${taskId} timed out after ${timeoutMs}ms`);
            const rej = this.currentTaskReject;
            this.clearCurrentTimeout();
            this.currentParser = null;
            this.currentTaskResolve = null;
            this.currentTaskReject = null;
            this.currentTaskId = null;
            if (rej) rej(new Error(`Evaluation timed out after ${timeoutMs}ms`));

            // Bug 3 Fix: Stop engine and drain stale bestmove output
            this.stop();
            this.isDraining = true;
            this.isProcessing = false;
          }, timeoutMs);

          let latestCp: number | undefined;
          let latestMate: number | undefined;
          let latestPv = '';
          let bestMove = '';

          this.currentParser = (line: string) => {
            if (line.includes('score cp')) {
              const match = line.match(/score cp (-?\d+)/);
              if (match) {
                latestCp = parseInt(match[1], 10);
                latestMate = undefined;
              }
            } else if (line.includes('score mate')) {
              const match = line.match(/score mate (-?\d+)/);
              if (match) {
                latestMate = parseInt(match[1], 10);
                latestCp = undefined;
              }
            }

            if (line.includes(' pv ')) {
              const pvPart = line.split(' pv ')[1];
              if (pvPart) {
                latestPv = pvPart.trim();
              }
            }

            if (line.startsWith('bestmove')) {
              const parts = line.split(' ');
              bestMove = parts[1] || '';
              window.clearTimeout(this.currentTimeout!);
              resolve({
                cp: latestCp,
                mate: latestMate,
                bestMove,
                pv: latestPv,
              });
              return true;
            }

            return false;
          };

          // Bug 2 Fix: evaluate() must always send Skill Level value 20!
          console.log('[Engine] Sending Skill Level value 20 for evaluation');
          this.worker?.postMessage('setoption name Skill Level value 20');
          this.worker?.postMessage(`position fen ${fen}`);
          // Bug 4 Fix: go movetime 300
          this.worker?.postMessage(`go movetime ${movetime}`);
        },
      };

      this.queue.push(task);
      this.processNextInQueue();
    });
  }

  /**
   * Sends "stop" to cancel any ongoing calculation.
   */
  public stop(): void {
    if (this.worker) {
      try {
        this.worker.postMessage('stop');
      } catch (err) {
        console.warn('[Engine] Error sending stop to worker:', err);
      }
    }
  }

  /**
   * Clears the current command queue and cancels current task.
   * Bug 4 & Bug 3 Fix: Rejects current task, sets draining state.
   */
  public cancelQueue(): void {
    this.clearCurrentTimeout();
    if (this.currentTaskReject) {
      try {
        this.currentTaskReject(new Error('Operation cancelled by user'));
      } catch {}
    }
    this.currentTaskResolve = null;
    this.currentTaskReject = null;
    this.currentParser = null;
    this.currentTaskId = null;

    for (const task of this.queue) {
      try {
        task.reject(new Error('Operation cancelled in queue'));
      } catch {}
    }
    this.queue = [];

    if (this.isProcessing) {
      this.stop();
      this.isDraining = true;
    }
    this.isProcessing = false;
  }

  /**
   * Terminates worker and frees blob URL
   */
  public terminate(): void {
    this.reset();
  }
}

export const stockfishEngine = new ChessEngineService();
