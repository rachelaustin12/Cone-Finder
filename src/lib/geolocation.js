// Robust, accurate geolocation helper with retry + fallback.
// Browser geolocation accuracy depends on device GPS + permissions.
// This first tries high-accuracy GPS, then falls back to a faster
// low-power read if the first attempt times out.

/**
 * Get the current position with best-effort accuracy.
 * @returns {Promise<{ latitude: number, longitude: number, accuracy: number }>}
 */
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({ code: 0, message: 'Geolocation is not supported by this device' });
      return;
    }

    // Optional: surface current permission state to the caller
    let settled = false;

    const highAccuracyAttempt = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return;
          settled = true;
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          if (settled) return;
          // Permission denied (code 1) — don't retry, just surface the error
          if (err.code === 1) {
            settled = true;
            reject(err);
            return;
          }
          // Timeout or position unavailable — fall back to a faster, lower-power read
          fallbackAttempt();
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    };

    const fallbackAttempt = () => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (settled) return;
          settled = true;
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          if (settled) return;
          settled = true;
          reject(err);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 }
      );
    };

    highAccuracyAttempt();
  });
}

/**
 * Get the current geolocation permission state if the Permissions API is available.
 * @returns {Promise<'granted'|'denied'|'prompt'|'unsupported'>}
 */
export async function getPermissionState() {
  try {
    if (!navigator.permissions) return 'unsupported';
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state; // 'granted' | 'denied' | 'prompt'
  } catch {
    return 'unsupported';
  }
}