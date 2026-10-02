import { supabase } from '@/lib/supabase';
import type { Profile, ProfileUpdate } from '@/types/user';

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw error ?? new Error('Not signed in');
  return data.user.id;
}

export async function getMyProfile(): Promise<Profile> {
  const id = await currentUserId();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Profile;
}

/** Only full_name, home_area_id, notification_enabled and push_token are allowed by the database. */
export async function updateMyProfile(patch: ProfileUpdate): Promise<Profile> {
  const id = await currentUserId();
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Profile;
}

export const setHomeArea = (areaId: number | null) => updateMyProfile({ home_area_id: areaId });
export const setPushToken = (token: string | null) => updateMyProfile({ push_token: token });
export const setNotificationsEnabled = (enabled: boolean) =>
  updateMyProfile({ notification_enabled: enabled });
