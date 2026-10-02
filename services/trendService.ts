import { supabase } from '@/lib/supabase';
import { CONFIG } from '@/constants/config';
import type { TrendPoint } from '@/types/cell';

/**
 * Daily case counts for the chart.
 * Returns an EMPTY array when the cell is suppressed (fewer than 3 recent cases),
 * so the UI should show "not enough data" instead of an empty chart.
 */
export async function getTrend(
  areaId: number,
  disease: string,
  days: number = CONFIG.DEFAULT_TREND_DAYS,
): Promise<TrendPoint[]> {
  const { data, error } = await supabase.rpc('get_trend', {
    p_area: areaId,
    p_disease: disease,
    p_days: days,
  });
  if (error) throw error;
  return (data ?? []) as TrendPoint[];
}
