import { supabase } from '@/lib/supabase';
import { CONFIG } from '@/constants/config';
import type { LabReportWithNames, NewLabReport } from '@/types/report';

const toISODate = (d: Date) => d.toISOString().slice(0, 10);

/** Client-side check that mirrors the database rules, for friendlier errors. */
export function validateReport(r: NewLabReport): string | null {
  if (!Number.isInteger(r.case_count) || r.case_count < CONFIG.MIN_CASE_COUNT || r.case_count > CONFIG.MAX_CASE_COUNT) {
    return `Case count must be between ${CONFIG.MIN_CASE_COUNT} and ${CONFIG.MAX_CASE_COUNT}.`;
  }
  const today = toISODate(new Date());
  const oldest = toISODate(new Date(Date.now() - CONFIG.MAX_BACKDATE_DAYS * 86_400_000));
  if (r.report_date > today) return 'Report date cannot be in the future.';
  if (r.report_date < oldest) return `Report date cannot be older than ${CONFIG.MAX_BACKDATE_DAYS} days.`;
  return null;
}

/** The approved lab the logged-in user belongs to (null if none). */
export async function getMyLabId(): Promise<string | null> {
  const { data, error } = await supabase.rpc('my_lab_id');
  if (error) throw error;
  return (data as string | null) ?? null;
}

/**
 * Submit aggregate counts. The database trigger then updates daily stats,
 * risk results, alerts and the sync ping automatically.
 */
export async function submitReport(report: NewLabReport): Promise<void> {
  const problem = validateReport(report);
  if (problem) throw new Error(problem);

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError ?? new Error('Not signed in');

  const labId = await getMyLabId();
  if (!labId) throw new Error('Your account is not linked to an approved lab.');

  const { error } = await supabase.from('lab_reports').insert({
    lab_id: labId,
    submitted_by: userData.user.id,
    disease_id: report.disease_id,
    area_id: report.area_id,
    report_date: report.report_date,
    case_count: report.case_count,
  });
  if (error) throw error;
}

/** Reports visible to the caller (their own lab; administrators see all). */
export async function getMyReports(limit = 50): Promise<LabReportWithNames[]> {
  const { data, error } = await supabase
    .from('lab_reports')
    .select('*, diseases(name), areas(name, cell_lat, cell_lon)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as LabReportWithNames[];
}
