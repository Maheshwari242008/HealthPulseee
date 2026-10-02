import { supabase } from '@/lib/supabase';
import { ALERTS_CHANNEL } from '@/constants/config';
import type { Alert } from '@/types/alert';

/** Active alerts for a cell plus its 8 neighbours (own cell first). */
export async function getAreaAlerts(areaId: number): Promise<Alert[]> {
  const { data, error } = await supabase.rpc('get_area_alerts', { p_area: areaId });
  if (error) throw error;
  return (data ?? []) as Alert[];
}

/** Calls back on any new/changed alert so the UI can refetch. Returns an unsubscribe function. */
export function subscribeToAlerts(onChange: () => void) {
  const channel = supabase
    .channel(ALERTS_CHANNEL)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => onChange())
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
