import { supabase } from '@/lib/supabase';
import type { Area } from '@/types/cell';

/** All grid cells (readable by any signed-in user). */
export async function getAreas(): Promise<Area[]> {
  const { data, error } = await supabase
    .from('areas')
    .select('*')
    .order('cell_lat', { ascending: false })
    .order('cell_lon', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Area[];
}
