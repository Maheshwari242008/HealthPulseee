import type { RiskLevel } from '@/types/cell';

export interface RiskLevelStyle {
  label: string;
  color: string;
  background: string;
  rank: number;
}

export const RISK_LEVELS: Record<RiskLevel, RiskLevelStyle> = {
  NONE: { label: 'No data', color: '#6B7280', background: '#E5E7EB', rank: 0 },
  LOW: { label: 'Low', color: '#15803D', background: '#DCFCE7', rank: 1 },
  MODERATE: { label: 'Moderate', color: '#B45309', background: '#FEF3C7', rank: 2 },
  HIGH: { label: 'High', color: '#B91C1C', background: '#FEE2E2', rank: 3 },
};

/** Same thresholds as calc_risk() in schema.sql. Display only; the database decides the level. */
export const RISK_THRESHOLDS = {
  LOW_BELOW: 0.25,
  MODERATE_BELOW: 0.55,
} as const;

export const RISK_ORDER: RiskLevel[] = ['NONE', 'LOW', 'MODERATE', 'HIGH'];

export const riskRank = (level: RiskLevel): number => RISK_LEVELS[level].rank;
