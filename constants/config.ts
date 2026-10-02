export const CONFIG = {
  // 6 x 6 demo grid (matches database/seed.sql)
  GRID_ORIGIN_LAT: 17.65,
  GRID_ORIGIN_LON: 75.89,
  GRID_SIZE: 6,
  CELL_STEP: 0.01, // ~1 km

  DEFAULT_TREND_DAYS: 14,
  REPLAY_DAYS: 14,

  // Mirrors the lab_reports constraints / RLS policy
  MIN_CASE_COUNT: 1,
  MAX_CASE_COUNT: 999,
  MAX_BACKDATE_DAYS: 30,

  // Privacy gate: fewer than this many recent cases => level NONE
  PRIVACY_MIN_CASES: 3,

  QUERY_STALE_MS: 30_000,
} as const;

export const SYNC_CHANNEL = 'sync_ping_channel';
export const ALERTS_CHANNEL = 'alerts_channel';
