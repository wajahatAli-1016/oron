/**
 * Realtime alerts transport.
 *
 * Vercel serverless cannot host Socket.IO (no persistent connections).
 * Production builds default to HTTP polling unless VITE_WS_URL / socket mode is set.
 */
export type RealtimeMode = 'socket' | 'polling' | 'auto';

/** Poll interval when using HTTP polling (Vercel-safe). */
export const ALERTS_POLL_INTERVAL_MS = 10_000;

export const getConfiguredRealtimeMode = (): RealtimeMode => {
  const raw = import.meta.env.VITE_REALTIME_MODE?.trim().toLowerCase();
  if (raw === 'socket' || raw === 'polling' || raw === 'auto') return raw;
  return 'auto';
};

export const getRealtimeTransport = (): 'socket' | 'polling' => {
  const mode = getConfiguredRealtimeMode();
  if (mode === 'socket') return 'socket';
  if (mode === 'polling') return 'polling';

  // auto: explicit WS URL → dedicated socket host (e.g. Railway API)
  if (import.meta.env.VITE_WS_URL?.trim()) return 'socket';
  // auto: local dev → Socket.IO via Vite proxy
  if (import.meta.env.DEV) return 'socket';
  // auto: production (Vercel frontend + serverless API) → polling
  return 'polling';
};

export const isAlertsPollingMode = (): boolean =>
  getRealtimeTransport() === 'polling';

export const getAlertsPollingInterval = (): number =>
  isAlertsPollingMode() ? ALERTS_POLL_INTERVAL_MS : 0;
