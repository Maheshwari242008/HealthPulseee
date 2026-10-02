export type AlertSeverity = 'LOW' | 'MODERATE' | 'HIGH';

/** One row of rpc('get_area_alerts'). */
export interface Alert {
  alert_id: number;
  area_id: number;
  disease: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  created_at: string;
  is_nearby: boolean; // true = alert is in a neighbouring cell, not the user's own
  precautions: string | null;
  symptoms: string | null;
  when_to_seek_care: string | null;
}
