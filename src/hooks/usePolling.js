import { useEffect, useRef } from 'react';

/** Default refresh interval for live dashboard tables (ms). */
export const POLL_INTERVAL_MS = 5000;

/**
 * CDR / failed SMS / SMS numbers — tight interval; silent polls use `live=true` to bypass Redis list cache.
 */
export const LIVE_TABLE_POLL_MS = 5000;

/**
 * Home dashboard (`/sms/dashboard`) — 100% near-realtime cadence. API cache TTL
 * is 1s and CRUD writes bump version counters that invalidate the snapshot
 * immediately. Worst-case visible latency: ~1-2s. CDR ingestion bumps via
 * `ListViewCacheInvalidationBridge.onCdrPersisted`, so SMS counters update
 * within one poll cycle of the engine writing the row.
 */
export const DASHBOARD_POLL_MS = 1000;

/** Failed SMS list — same cadence as {@link LIVE_TABLE_POLL_MS}. */
export const FAILED_SMS_POLL_MS = LIVE_TABLE_POLL_MS;

/**
 * Calls callback every intervalMs while `enabled` is true.
 * Uses a ref so the latest callback runs without resetting the interval each render.
 *
 * The polling callback should only refresh **table/query** state from your list endpoint.
 * Do **not** tie loading of filter dropdowns (providers, ranges, clients, etc.) to React state
 * that updates every poll tick (e.g. `data` / `cdrData` arrays). Those loaders belong in
 * {@link useScopeStableEffect} with dependencies like `companyId`, `resourceId`, or filter scope —
 * never the polled row array reference.
 */
export function usePolling(callback, intervalMs = POLL_INTERVAL_MS, enabled = true) {
  const ref = useRef(callback);
  ref.current = callback;
  const runningRef = useRef(false);

  useEffect(() => {
    if (!enabled) return undefined;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
      return undefined;
    }
    const id = window.setInterval(() => {
      if (runningRef.current) return;
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
      runningRef.current = true;
      Promise.resolve()
        .then(() => ref.current())
        .finally(() => {
          runningRef.current = false;
        });
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
}

/**
 * For effects that load filter dropdowns, lookup lists, or other metadata when **scope** changes.
 * Keep `deps` to stable scope keys only — not table rows refreshed by {@link usePolling}.
 */
export function useScopeStableEffect(effect, deps) {
  useEffect(effect, deps);
}
