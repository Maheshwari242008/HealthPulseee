import { supabase } from '@/lib/supabase';
import type { AdminCell } from '@/types/cell';
import type { AdminAlert, Lab, NewAlert } from '@/types/admin';

/** Real (un-suppressed) counts for every cell. Administrators only. */
export async function getAdminDashboard(asOf?: string): Promise<AdminCell[]> {
  const { data, error } = await supabase.rpc('admin_dashboard', asOf ? { p_as_of: asOf } : {});
  if (error) throw error;
  return (data ?? []) as AdminCell[];
}

export async function getAllAlerts(): Promise<AdminAlert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*, diseases(name), areas(name, cell_lat, cell_lon)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as AdminAlert[];
}

export async function createAlert(a: NewAlert): Promise<void> {
  const expires = new Date(Date.now() + a.expires_in_days * 86_400_000).toISOString();
  const { error } = await supabase.from('alerts').insert({
    area_id: a.area_id,
    disease_id: a.disease_id,
    severity: a.severity,
    title: a.title.trim(),
    message: a.message.trim(),
    expires_at: expires,
  });
  if (error) throw error;
}

/** Ends an alert now (it disappears from the public feed). */
export async function expireAlert(id: number): Promise<void> {
  const { error } = await supabase
    .from('alerts')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteAlert(id: number): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) throw error;
}

export async function getLabs(): Promise<Lab[]> {
  const { data, error } = await supabase.from('labs').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Lab[];
}

/** Needs database/migrations/002_app_features.sql. */
export async function setLabApproval(labId: string, approved: boolean): Promise<void> {
  const { error } = await supabase.rpc('admin_set_lab_approval', { p_lab: labId, p_approved: approved });
  if (error) throw error;
}

/** Needs database/migrations/002_app_features.sql. */
export async function createLab(name: string, approved = true): Promise<string> {
  const { data, error } = await supabase.rpc('admin_create_lab', { p_name: name.trim(), p_approved: approved });
  if (error) throw error;
  return data as string;
}
