export type RiskLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH';

export interface Area {
  id: number;
  name: string | null;
  district: string | null;
  state: string | null;
  cell_lat: number;
  cell_lon: number;
}

/** One row of rpc('get_cells'). Numeric fields are null when level === 'NONE' (privacy gate). */
export interface Cell {
  area_id: number;
  cell_lat: number;
  cell_lon: number;
  disease: string;
  level: RiskLevel;
  score: number | null;
  recent: number | null;
  growth_pct: number | null;
  neighbor_cases: number | null;
  neighbors_affected: number | null;
}

/** One row of rpc('admin_dashboard') (administrators only, real counts). */
export interface AdminCell {
  area_id: number;
  area_name: string | null;
  cell_lat: number;
  cell_lon: number;
  disease: string;
  level: RiskLevel;
  score: number | null;
  recent: number;
  prior: number;
  growth_pct: number;
  neighbor_cases: number;
  neighbors_affected: number;
}

export interface TrendPoint {
  stat_date: string; // YYYY-MM-DD
  cases: number;
}
