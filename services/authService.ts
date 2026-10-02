import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { UserRole, UserRoleRow } from '@/types/user';

export async function signUp(email: string, password: string, fullName: string) {
  // handle_new_user() trigger reads full_name from user metadata and creates profile + 'user' role
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function onAuthChange(callback: (session: Session | null) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

/** Own role rows (RLS only returns the caller's rows unless administrator). */
export async function getMyRoles(userId: string): Promise<UserRoleRow[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data ?? []) as UserRoleRow[];
}

/** Highest privilege wins: administrator > lab > user. */
export function pickPrimaryRole(roles: UserRoleRow[]): UserRole {
  if (roles.some((r) => r.role === 'administrator')) return 'administrator';
  if (roles.some((r) => r.role === 'lab')) return 'lab';
  return 'user';
}
