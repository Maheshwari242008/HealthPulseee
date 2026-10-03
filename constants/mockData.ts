import { DISEASES } from '@/constants/diseases';
import type { Alert } from '@/types/alert';
import type { Area, Cell, RiskLevel } from '@/types/cell';
import type { Profile } from '@/types/user';

// Sample data that mirrors database/seed.sql. Only used when EXPO_PUBLIC_USE_MOCK=true.

const r2 = (n: number) => Math.round(n * 100) / 100;

export const MOCK_AREAS: Area[] = [];
for (let i = 0; i < 6; i++) {
  for (let j = 0; j < 6; j++) {
    const lat = r2(17.65 + i * 0.01);
    const lon = r2(75.89 + j * 0.01);
    MOCK_AREAS.push({
      id: i * 6 + j + 1,
      name: lat === 17.67 && lon === 75.91 ? 'Solapur Central' : `Cell ${lat}, ${lon}`,
      district: 'Solapur',
      state: 'Maharashtra',
      cell_lat: lat,
      cell_lon: lon,
    });
  }
}

interface Override {
  level: RiskLevel;
  score: number;
  recent: number;
  growth_pct: number;
  neighbor_cases: number;
  neighbors_affected: number;
}

const OVERRIDES: Record<string, Override> = {
  'dengue|17.67|75.91': { level: 'MODERATE', score: 0.363, recent: 7, growth_pct: 75, neighbor_cases: 7, neighbors_affected: 2 },
  'malaria|17.67|75.91': { level: 'LOW', score: 0.1, recent: 3, growth_pct: 0, neighbor_cases: 0, neighbors_affected: 0 },
  'chikungunya|17.67|75.91': { level: 'LOW', score: 0.1, recent: 3, growth_pct: 0, neighbor_cases: 0, neighbors_affected: 0 },
  'malaria|17.69|75.94': { level: 'LOW', score: 0.183, recent: 4, growth_pct: 33, neighbor_cases: 0, neighbors_affected: 0 },
};

export function mockCells(disease: string | null): Cell[] {
  const cells: Cell[] = [];
  for (const a of MOCK_AREAS) {
    for (const d of DISEASES) {
      if (disease && d.name !== disease) continue;
      const o = OVERRIDES[`${d.name}|${a.cell_lat}|${a.cell_lon}`];
      cells.push({
        area_id: a.id,
        cell_lat: a.cell_lat,
        cell_lon: a.cell_lon,
        disease: d.name,
        level: o?.level ?? 'NONE',
        score: o?.score ?? null,
        recent: o?.recent ?? null,
        growth_pct: o?.growth_pct ?? null,
        neighbor_cases: o?.neighbor_cases ?? null,
        neighbors_affected: o?.neighbors_affected ?? null,
      });
    }
  }
  return cells;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

export const MOCK_ALERTS: Alert[] = [
  {
    alert_id: 1,
    area_id: 15,
    disease: 'dengue',
    severity: 'MODERATE',
    title: 'dengue risk is MODERATE',
    message:
      'Increased dengue activity has been detected in your area. This is a prototype indicator, not a diagnosis.',
    created_at: hoursAgo(3),
    is_nearby: false,
    symptoms: 'High fever, severe headache, pain behind the eyes, joint and muscle pain, rash',
    precautions:
      'Remove standing water around your home\nUse mosquito repellent and nets\nWear long sleeves, especially at dawn and dusk\nKeep water containers covered',
    when_to_seek_care: 'Seek care for fever lasting over 2 days, severe stomach pain, bleeding, or persistent vomiting',
  },
  {
    alert_id: 2,
    area_id: 21,
    disease: 'malaria',
    severity: 'MODERATE',
    title: 'malaria risk is MODERATE',
    message:
      'Increased malaria activity has been detected in a nearby area. This is a prototype indicator, not a diagnosis.',
    created_at: hoursAgo(26),
    is_nearby: true,
    symptoms: 'Fever with chills, sweating, headache, nausea',
    precautions: 'Sleep under a mosquito net\nUse repellent\nDrain stagnant water\nComplete any prescribed treatment',
    when_to_seek_care: 'Seek care for any fever after mosquito exposure, especially with chills',
  },
];

export const MOCK_PROFILE: Profile = {
  id: 'mock-user',
  full_name: 'Demo User',
  home_area_id: 15,
  notification_enabled: true,
  push_token: null,
  created_at: new Date().toISOString(),
};
