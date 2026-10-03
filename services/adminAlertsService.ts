import { supabase } from '@/lib/supabase';
import type { AlertSeverity } from '@/types/alert';
import type { LatestAlert } from '@/types/admin';

type AlertRow = {
  id: number;
  severity: AlertSeverity;
  title: string;
  message: string;
  created_at: string;
  areas: { name: string | null } | null;
  diseases: { name: string } | null;
};

const ALERT_COLUMNS = 'id, severity, title, message, created_at, areas(name), diseases(name)';

function toLatestAlert(row: AlertRow): LatestAlert {
  return {
    id: row.id,
    severity: row.severity,
    title: row.title,
    message: row.message,
    created_at: row.created_at,
    area_name: row.areas?.name ?? null,
    disease: row.diseases?.name ?? null,
  };
}

/** All active alerts, newest first (expired alerts are already hidden by RLS).
 *  Pass a severity to filter on the server; leave it out to get everything. */
export async function getAdminAlerts(severity?: AlertSeverity): Promise<LatestAlert[]> {
  let query = supabase.from('alerts').select(ALERT_COLUMNS);
  if (severity) {
    query = query.eq('severity', severity);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw new Error(error.message);

  return ((data ?? []) as unknown as AlertRow[]).map(toLatestAlert);
}
