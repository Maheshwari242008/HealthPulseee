import { supabase } from '@/lib/supabase';
import type { LabRecord, NewLabInput } from '@/types/admin';

// These call the functions in database/lab_authority.sql (run it in Supabase first).

export async function listLabs(): Promise<LabRecord[]> {
  const { data, error } = await supabase.rpc('admin_list_labs');
  if (error) throw new Error(error.message);
  return (data ?? []) as LabRecord[];
}

export async function createLab(input: NewLabInput): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_lab', {
    p_name: input.name,
    p_lab_code: input.labCode,
    p_email: input.email,
    p_city: input.city,
    p_state: input.state,
  });
  if (error) throw new Error(error.message);
  return data as string;
}

export async function setLabActive(labId: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_lab_active', { p_lab: labId, p_active: active });
  if (error) throw new Error(error.message);
}
