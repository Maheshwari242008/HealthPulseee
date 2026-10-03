import { supabase } from '@/lib/supabase';
import type { Disease } from '@/types/disease';

/** All diseases with symptoms / precautions / when to seek care (readable by signed-in users). */
export async function getDiseases(): Promise<Disease[]> {
  const { data, error } = await supabase.from('diseases').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as Disease[];
}
