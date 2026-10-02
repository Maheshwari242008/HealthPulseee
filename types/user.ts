export type UserRole = 'user' | 'lab' | 'administrator';

export interface Profile {
  id: string;
  full_name: string | null;
  home_area_id: number | null;
  notification_enabled: boolean;
  push_token: string | null;
  created_at: string;
}

/** Only these columns are updatable by the app (see GRANT in schema.sql). */
export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'home_area_id' | 'notification_enabled' | 'push_token'>
>;

export interface UserRoleRow {
  id: string;
  user_id: string;
  role: UserRole;
  lab_id: string | null;
  created_at: string;
}
