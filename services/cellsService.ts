import { supabase } from '@/lib/supabase';
import { SYNC_CHANNEL } from '@/constants/config';
import type { Cell } from '@/types/cell';

/**
 * Map cells. Pass asOf (YYYY-MM-DD) for the replay slider; omit for today.
 * Pass disease (e.g. 'dengue') to filter, or null for all diseases.
 */
export async function getCells(disease: string | null = null, asOf?: string): Promise<Cell[]> {
  const { data, error } = await supabase.rpc('get_cells', {
    p_disease: disease,
    ...(asOf ? { p_as_of: asOf } : {}),
  });
  if (error) throw error;
  return (data ?? []) as Cell[];
}

/** Calls back whenever the sync_ping row changes (a lab report arrived => refetch the map). */
export function subscribeToSync(onChange: () => void) {
  const channel = supabase
    .channel(SYNC_CHANNEL)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sync_ping' }, () => onChange())
    .subscribe();
  return () => {
    supabase.removeChannel(channel);
  };
}
