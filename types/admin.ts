import type { AlertSeverity } from '@/types/alert';

// RiskLevel and AdminCell already exist in types/cell.ts - import them from there.

export interface LatestAlert {
  id: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  created_at: string;
  area_name: string | null;
  disease: string | null;
}

export interface ActivitySeries {
  disease: string;
  values: number[]; // one number per date in `dates`
}

export interface AdminDashboard {
  activeAlerts: number;
  highAlerts: number;
  affectedRegions: number; // areas at MODERATE or HIGH for at least one disease
  reportsReceived: number; // lab reports in the last 7 days
  casesReceived: number; // sum of case_count in the last 7 days
  pendingActions: number | null; // null until the gov_actions table exists
  activity: { dates: string[]; series: ActivitySeries[] };
  latestAlerts: LatestAlert[];
}

export interface LabRecord {
  id: string;
  name: string;
  lab_code: string | null;
  official_email: string | null;
  city: string | null;
  state: string | null;
  approved: boolean;
  claimed: boolean;
  created_at: string;
}

export interface NewLabInput {
  name: string;
  labCode: string;
  email: string;
  city: string;
  state: string;
}
