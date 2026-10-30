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
 * 7. Technical error exposure for debugging.
 */

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
  command: () => void;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  timeoutId: number;
}

const FALLBACK_SOURCES = [
  'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js',
  'https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.js',
  'https://unpkg.com/stockfish.js@10.0.2/stockfish.js',
];

class ChessEngineService {
  private worker: Worker | null = null;
  private blobUrl: string | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private lastError: string | null = null;

  private isProcessing = false;
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
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }
    this.isInitialized = false;
    this.isInitializing = false;
    this.initPromise = null;
    this.lastError = null;
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
      })
      .catch((err) => {
        const errorMsg = err instanceof Error ? err.message : String(err);
        this.lastError = errorMsg;
        console.error('[Engine] Engine initialization failed with error:', err);
        this.reset();
        throw err;
      })
      .finally(() => {
        this.isInitializing = false;
      });

    return this.initPromise;
  }

  private async doInit(): Promise<void> {
    let scriptText = '';
    let successfulSource = '';

    // Step 1: Try fallback sources in order
    let lastFetchError: Error | null = null;
    for (const url of FALLBACK_SOURCES) {
      try {
        console.log(`[Engine] Fetch start: ${url}`);
        const response = await fetch(url);
        console.log(`[Engine] HTTP status: ${response.status} from ${url}`);

        if (response.ok) {
          const text = await response.text();
          console.log(`[Engine] Script size: ${text.length} bytes from ${url}`);
          if (text && text.trim().length > 1000) {
            scriptText = text;
            successfulSource = url;
            break;
          } else {
            console.warn(`[Engine] Script from ${url} was empty or too small (${text.length} bytes)`);
          }
        }
      } catch (err) {
        lastFetchError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[Engine] Fetch failed for ${url}:`, err);
      }
    }

    // Step 2: Create worker (Try Blob URL first, fallback to CDN URL)
    let worker: Worker | null = null;
    let workerCreationMode = '';

    if (scriptText) {
      try {
        const blob = new Blob([scriptText], { type: 'application/javascript' });
        this.blobUrl = URL.createObjectURL(blob);
        worker = new Worker(this.blobUrl);
        workerCreationMode = 'Blob URL';
        console.log('[Engine] Worker created via Blob URL');
      } catch (blobErr) {
        console.warn('[Engine] Worker creation from Blob failed, trying CDN URL:', blobErr);
      }
    }

    if (!worker && successfulSource) {
      try {
        worker = new Worker(successfulSource);
        workerCreationMode = `Direct CDN URL (${successfulSource})`;
        console.log(`[Engine] Worker created via direct CDN URL: ${successfulSource}`);
      } catch (directErr) {
        console.warn('[Engine] Worker creation directly from CDN URL failed, trying importScripts wrapper:', directErr);
        try {
          const wrapperBlob = new Blob([`importScripts("${successfulSource}");`], {
            type: 'application/javascript',
          });
          this.blobUrl = URL.createObjectURL(wrapperBlob);
          worker = new Worker(this.blobUrl);
          workerCreationMode = 'importScripts wrapper Blob';
          console.log('[Engine] Worker created via importScripts wrapper Blob');
        } catch (wrapperErr) {
          console.error('[Engine] All worker creation strategies failed:', wrapperErr);
        }
      }
    }

    if (!worker) {
      const reason = lastFetchError ? lastFetchError.message : 'Failed to create Web Worker from all sources';
      throw new Error(`Worker creation failed: ${reason}`);
    }

    this.worker = worker;

    // Step 3: Handshake (uci -> uciok -> isready -> readyok) with 15s timeout
    await new Promise<void>((resolve, reject) => {
      let isSettled = false;
      let firstMessageReceived = false;

      const timeoutId = window.setTimeout(() => {
        if (isSettled) return;
        isSettled = true;
        cleanupListeners();
        reject(
          new Error(
            `Engine init handshake timed out after 15s (mode: ${workerCreationMode})`
          )
        );
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
            worker?.postMessage('isready');
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
        console.error('[Engine] Worker error during handshake:', event);
        if (isSettled) return;
        isSettled = true;
        window.clearTimeout(timeoutId);
        cleanupListeners();
        reject(new Error(event.message || 'Worker runtime error during initialization'));
      };

      const cleanupListeners = () => {
        worker?.removeEventListener('message', onInitMessage);
        worker?.removeEventListener('error', onInitError);
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

    // Step 4: Run a verification bestmove test from startpos
    try {
      console.log('[Engine] Running initial verification bestmove on startpos...');
      const testMove = await this.getBestMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', {
        movetime: 200,
      });
      console.log(`[Engine] Initial bestmove result: ${testMove}`);
    } catch (testErr) {
      console.warn('[Engine] Initial verification test bestmove warning:', testErr);
    }
  }

  private attachMainMessageListener(): void {
    if (!this.worker) return;

    this.worker.onmessage = (event: MessageEvent) => {
      const line = typeof event.data === 'string' ? event.data : '';
      if (this.currentParser) {
        const isDone = this.currentParser(line);
        if (isDone) {
          this.clearCurrentTimeout();
          this.currentParser = null;
          this.currentTaskResolve = null;
          this.currentTaskReject = null;
          this.isProcessing = false;
          this.processNextInQueue();
        }
      }
    };

    this.worker.onerror = (err) => {
      console.error('[Engine] Stockfish worker runtime error:', err);
      if (this.currentTaskReject) {
        this.currentTaskReject(new Error('Engine worker error during task execution'));
      }
      this.clearCurrentTimeout();
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
    if (this.isProcessing || this.queue.length === 0) return;
    const nextTask = this.queue.shift();
    if (!nextTask) return;

    this.isProcessing = true;
    nextTask.command();
  }

  /**
   * Request engine best move for a given FEN
   */
  public async getBestMove(fen: string, options: EngineMoveOptions = {}): Promise<string> {
    await this.init();

    return new Promise<string>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.stop();
        reject(new Error('Best move calculation timed out'));
      }, 10000);

      const task: QueuedTask<string> = {
        id: Math.random().toString(36).substring(2, 9),
        timeoutId,
        resolve,
        reject,
        command: () => {
          this.currentTaskResolve = resolve as (val: unknown) => void;
          this.currentTaskReject = reject;
          this.currentTimeout = timeoutId;

          let bestMoveResult = '';

          this.currentParser = (line: string) => {
            if (line.startsWith('bestmove')) {
              const parts = line.split(' ');
              bestMoveResult = parts[1] || '';
              window.clearTimeout(timeoutId);
              resolve(bestMoveResult);
              return true;
            }
            return false;
          };

          if (typeof options.skillLevel === 'number') {
            this.worker?.postMessage(`setoption name Skill Level value ${options.skillLevel}`);
          }
          this.worker?.postMessage(`position fen ${fen}`);
          const movetime = options.movetime || 800;
          this.worker?.postMessage(`go movetime ${movetime}`);
        },
      };

      this.queue.push(task);
      this.processNextInQueue();
    });
  }

  /**
   * Request engine position evaluation for game review
   */
  public async evaluate(fen: string, depth: number = 12): Promise<EvaluationResult> {
    await this.init();

    return new Promise<EvaluationResult>((resolve, reject) => {
      const timeoutId = window.setTimeout(() => {
        this.stop();
        reject(new Error('Evaluation timed out'));
      }, 10000);

      const task: QueuedTask<EvaluationResult> = {
        id: Math.random().toString(36).substring(2, 9),
        timeoutId,
        resolve,
        reject,
        command: () => {
          this.currentTaskResolve = resolve as (val: unknown) => void;
          this.currentTaskReject = reject;
          this.currentTimeout = timeoutId;

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
              window.clearTimeout(timeoutId);
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

          this.worker?.postMessage(`position fen ${fen}`);
          this.worker?.postMessage(`go depth ${depth}`);
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
   * Clears the current command queue and stops current calculation.
   */
  public cancelQueue(): void {
    this.stop();
    this.clearCurrentTimeout();
    for (const task of this.queue) {
      window.clearTimeout(task.timeoutId);
      task.reject(new Error('Operation cancelled by user'));
    }
    this.queue = [];
    this.isProcessing = false;
    this.currentParser = null;
    this.currentTaskResolve = null;
    this.currentTaskReject = null;
  }

  /**
   * Terminates worker and frees blob URL
   */
  public terminate(): void {
    this.reset();
  }
}

export const stockfishEngine = new ChessEngineService();
