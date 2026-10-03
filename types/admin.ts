import type { AlertSeverity } from '@/types/alert';

export interface Lab {
  id: string;
  name: string;
  approved: boolean;
  created_at: string;
}

/** Row of the alerts table with joined names (administrators). */
export interface AdminAlert {
  id: number;
  area_id: number;
  disease_id: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  created_at: string;
  expires_at: string | null;
  diseases: { name: string } | null;
  areas: { name: string | null; cell_lat: number; cell_lon: number } | null;
}

export interface NewAlert {
  area_id: number;
  disease_id: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  expires_in_days: number;
}
