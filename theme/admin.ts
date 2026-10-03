// Shared colours for the admin (City Administrator) screens.
export const C = {
  bg: '#F6F3E8',
  card: '#FFFFFF',
  teal: '#145C5A',
  mint: '#DCEFE6',
  ink: '#174B4A',
  muted: '#5F7B78',
  line: '#E3E8DF',
  high: '#C0392B',
  mod: '#D98E04',
  low: '#2E8B57',
};

export const DISEASE = ['#145C5A', '#D98E04', '#C0392B', '#3B82C4', '#7A5BB5', '#2E8B57'];

export type Level = 'HIGH' | 'MODERATE' | 'LOW';

export const LEVEL_COLOR: Record<Level, string> = {
  HIGH: C.high,
  MODERATE: C.mod,
  LOW: C.low,
};
