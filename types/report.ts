/** Aggregate counts only. No patient data anywhere. */
export interface LabReport {
  id: number;
  lab_id: string;
  submitted_by: string | null;
  disease_id: number;
  area_id: number;
  report_date: string; // YYYY-MM-DD
  case_count: number; // 1..999
  created_at: string;
}

/** What the form collects. lab_id and submitted_by are filled in by reportsService. */
export interface NewLabReport {
  disease_id: number;
  area_id: number;
  report_date: string; // YYYY-MM-DD, today or up to 30 days back
  case_count: number;
}

/** LabReport with joined names, for history lists. */
export interface LabReportWithNames extends LabReport {
  diseases: { name: string } | null;
  areas: { name: string | null; cell_lat: number; cell_lon: number } | null;
}
