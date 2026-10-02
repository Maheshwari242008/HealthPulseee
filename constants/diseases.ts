import type { DiseaseName } from '@/types/disease';

export interface DiseaseMeta {
  name: DiseaseName;
  label: string;
  emoji: string;
}

// Names must match diseases.name in database/seed.sql
export const DISEASES: DiseaseMeta[] = [
  { name: 'dengue', label: 'Dengue', emoji: '🦟' },
  { name: 'malaria', label: 'Malaria', emoji: '🦟' },
  { name: 'chikungunya', label: 'Chikungunya', emoji: '🦟' },
  { name: 'typhoid', label: 'Typhoid', emoji: '🌡️' },
  { name: 'cholera', label: 'Cholera', emoji: '💧' },
  { name: 'diarrhoea', label: 'Diarrhoea', emoji: '💧' },
];

export const getDiseaseMeta = (name: string): DiseaseMeta | undefined =>
  DISEASES.find((d) => d.name === name);

export const DISCLAIMER =
  'HealthPulse is a prototype indicator, not a diagnosis. See a doctor if you feel unwell.';
