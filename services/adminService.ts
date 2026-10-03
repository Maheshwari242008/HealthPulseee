import { supabase } from '@/lib/supabase';
import { getAdminAlerts } from '@/services/adminAlertsService';
import type { AdminDashboard } from '@/types/admin';
import type { AdminCell } from '@/types/cell';

const WINDOW_DAYS = 7;

type ReportRow = {
  report_date: string;
  case_count: number;
  diseases: { name: string } | null;
};

function localDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

/** Every cell x disease with real counts. The database rejects non-administrators. */
export async function getAdminCells(): Promise<AdminCell[]> {
  const { data, error } = await supabase.rpc('admin_dashboard');
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminCell[];
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const dates = Array.from({ length: WINDOW_DAYS }, (_, i) => localDate(WINDOW_DAYS - 1 - i));

  const [cells, alerts, reportsRes] = await Promise.all([
    getAdminCells(),
    getAdminAlerts(),
    supabase
      .from('lab_reports')
      .select('report_date, case_count, diseases(name)')
      .gte('report_date', dates[0]),
  ]);

  if (reportsRes.error) throw new Error(reportsRes.error.message);
  const reports = (reportsRes.data ?? []) as unknown as ReportRow[];

  const affected = new Set(
    cells.filter((c) => c.level === 'MODERATE' || c.level === 'HIGH').map((c) => c.area_id),
  );

  const byDisease = new Map<string, number[]>();
  let casesReceived = 0;
  for (const row of reports) {
    casesReceived += row.case_count;
    const idx = dates.indexOf(row.report_date);
    if (idx < 0) continue;
    const name = row.diseases?.name ?? 'unknown';
    let series = byDisease.get(name);
    if (!series) {
      series = dates.map(() => 0);
      byDisease.set(name, series);
    }
    series[idx] += row.case_count;
  }

  return {
    activeAlerts: alerts.length,
    highAlerts: alerts.filter((a) => a.severity === 'HIGH').length,
    affectedRegions: affected.size,
    reportsReceived: reports.length,
    casesReceived,
    pendingActions: null,
    activity: {
      dates,
      series: Array.from(byDisease, ([disease, values]) => ({ disease, values })),
    },
    latestAlerts: alerts.slice(0, 5),
  };
}
