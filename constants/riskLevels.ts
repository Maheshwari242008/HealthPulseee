import type { RiskLevel } from '@/types/cell';

export interface RiskLevelStyle {
  label: string;
  color: string;
  background: string;
  rank: number;
}

// Labels follow the design: Normal / Low activity / Moderate activity / High activity.
// NONE means "fewer than 3 recent cases" (privacy gate), not a confirmed all-clear.
export const RISK_LEVELS: Record<RiskLevel, RiskLevelStyle> = {
  NONE: { label: 'Normal', color: '#1E6B4B', background: '#D9EFE6', rank: 0 },
  LOW: { label: 'Low activity', color: '#1E6B4B', background: '#D9EFE6', rank: 1 },
  MODERATE: { label: 'Moderate activity', color: '#8A5A00', background: '#FBE8B8', rank: 2 },
  HIGH: { label: 'High activity', color: '#B91C1C', background: '#FEE2E2', rank: 3 },
};

/** Map overlay colours per level (alpha is added by the map screen). */
export const RISK_MAP_COLORS: Record<RiskLevel, string> = {
  NONE: '#9CA3AF',
  LOW: '#16A34A',
  MODERATE: '#F59E0B',
  HIGH: '#DC2626',
};

/** Same thresholds as calc_risk() in schema.sql. Display only; the database decides the level. */
export const RISK_THRESHOLDS = {
  LOW_BELOW: 0.25,
  MODERATE_BELOW: 0.55,
} as const;

export const RISK_ORDER: RiskLevel[] = ['NONE', 'LOW', 'MODERATE', 'HIGH'];

export const riskRank = (level: RiskLevel): number => RISK_LEVELS[level].rank;
