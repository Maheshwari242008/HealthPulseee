import type { AdminCell } from '@/types/cell';

export interface SuggestedAction {
  key: string;
  cell: AdminCell;
  priority: 1 | 2 | 3;
  title: string;
  steps: string[];
  alertSeverity: 'MODERATE' | 'HIGH';
}

const VECTOR = new Set(['dengue', 'malaria', 'chikungunya']);
const WATER = new Set(['cholera', 'typhoid', 'diarrhoea']);

/** Rule-based suggestions from real dashboard numbers. Advisory only: a human decides. */
export function buildSuggestions(cells: AdminCell[]): SuggestedAction[] {
  const out: SuggestedAction[] = [];
  for (const c of cells) {
    if (c.level !== 'MODERATE' && c.level !== 'HIGH') continue;
    const high = c.level === 'HIGH';
    const steps: string[] = [];
    if (VECTOR.has(c.disease)) {
      steps.push('Inspect and clear stagnant water in the cell and neighbours');
      steps.push(high ? 'Schedule fogging / larvicide this week' : 'Schedule larval source survey');
    } else if (WATER.has(c.disease)) {
      steps.push('Test drinking-water sources and chlorination levels');
      steps.push(high ? 'Distribute ORS and chlorine tablets' : 'Advise boiling / treating water');
    }
    if (c.growth_pct >= 50) steps.push(`Cases up ${c.growth_pct}% on the previous week: increase lab sampling`);
    if (c.neighbors_affected >= 2) steps.push(`${c.neighbors_affected} neighbouring areas also affected: treat as a cluster`);
    steps.push(high ? 'Issue a public HIGH alert and notify local clinics' : 'Issue a public MODERATE advisory');
    out.push({
      key: `${c.area_id}-${c.disease}`,
      cell: c,
      priority: high ? 1 : c.growth_pct >= 50 ? 2 : 3,
      title: `${c.disease} ${high ? 'outbreak risk' : 'rising'}: ${c.area_name ?? `${Number(c.cell_lat).toFixed(2)}, ${Number(c.cell_lon).toFixed(2)}`}`,
      steps,
      alertSeverity: high ? 'HIGH' : 'MODERATE',
    });
  }
  return out.sort((a, b) => a.priority - b.priority || (b.cell.score ?? 0) - (a.cell.score ?? 0));
}
