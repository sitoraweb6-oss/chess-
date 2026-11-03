/**
 * Client-Side Cryptographic Passcode Protection & Privacy Guard
 * "দাবা শিক্ষক" - Daba Shikkhok
 *
 * Security & Anti-Tracking Features:
 * 1. Passcode is stored EXCLUSIVELY as a one-way SHA-256 cryptographic digest.
 *    The plaintext code never exists in the codebase.
 * 2. Compares hash via window.crypto.subtle.digest (Web Crypto standard).
 * 3. Session-based unlock state to protect sandbox / solo analysis.
 * 4. Zero external network telemetry, zero trackers, zero third-party calls.
 */

// Cryptographic SHA-256 hash of the authorization passcode
const SOLO_PASSCODE_SHA256_HASH = '078d2590d8d5d3615d6b15fd5576715afbb4431b22336a93ce5c2b2ba1ed5b6e';

const SOLO_UNLOCKED_STORAGE_KEY = 'dabaShikkhok:soloAuthorizedSession:v1';

/**
 * Computes SHA-256 hash of any input string using standard Web Crypto API
 */
export async function computeSha256Hex(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies user-entered PIN against the pre-computed cryptographic digest
 */
export async function verifySoloPasscode(enteredPin: string): Promise<boolean> {
  if (!enteredPin || enteredPin.trim().length === 0) {
    return false;
  }

  try {
    const computedHash = await computeSha256Hex(enteredPin.trim());
    return computedHash.toLowerCase() === SOLO_PASSCODE_SHA256_HASH.toLowerCase();
  } catch (err) {
    console.warn('[Security] Crypto digest failed:', err);
    return false;
  }
}

/**
 * Checks if the current browser session has unlocked Solo Analysis
 */
export function isSoloFeatureUnlocked(): boolean {
  try {
    const sessionVal = sessionStorage.getItem(SOLO_UNLOCKED_STORAGE_KEY);
    return sessionVal === 'granted';
  } catch {
    return false;
  }
}

/**
 * Marks Solo Analysis as unlocked for this session or revokes authorization
 */
export function setSoloFeatureUnlocked(unlocked: boolean): void {
  try {
    if (unlocked) {
      sessionStorage.setItem(SOLO_UNLOCKED_STORAGE_KEY, 'granted');
    } else {
      sessionStorage.removeItem(SOLO_UNLOCKED_STORAGE_KEY);
    }
  } catch (err) {
    console.warn('[Security] Could not persist unlock session:', err);
  }
}
