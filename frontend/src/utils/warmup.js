/**
 * Warm-up utility to keep serverless functions warm
 * Calls the warm endpoint periodically to prevent cold starts
 */

const WARMUP_INTERVAL = 8 * 60 * 1000; // 8 minutes (slightly less than cron interval)
const WARMUP_ENDPOINT = '/api/warm';

let warmupInterval = null;
let isWarming = false;

/**
 * Warm up the server by calling the warm endpoint
 */
export const warmUp = async () => {
  if (isWarming) return;
  
  try {
    isWarming = true;
    const response = await fetch(WARMUP_ENDPOINT, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (response.ok) {
      console.log('[Warmup] Server warmed successfully');
    }
  } catch (error) {
    // Silently fail - this is just a warm-up call
    console.debug('[Warmup] Failed to warm server:', error);
  } finally {
    isWarming = false;
  }
};

/**
 * Start automatic warm-up interval
 * This keeps the server warm while the user is on the site
 */
export const startWarmup = () => {
  if (warmupInterval) return; // Already running
  
  // Warm up immediately
  warmUp();
  
  // Then warm up every 8 minutes
  warmupInterval = setInterval(warmUp, WARMUP_INTERVAL);
  
  console.log('[Warmup] Started automatic warm-up interval');
};

/**
 * Stop automatic warm-up interval
 */
export const stopWarmup = () => {
  if (warmupInterval) {
    clearInterval(warmupInterval);
    warmupInterval = null;
    console.log('[Warmup] Stopped automatic warm-up interval');
  }
};

/**
 * Warm up on page visibility change (when user returns to tab)
 */
export const setupVisibilityWarmup = () => {
  if (typeof document === 'undefined') return;
  
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      // User returned to tab - warm up immediately
      warmUp();
    }
  });
};

