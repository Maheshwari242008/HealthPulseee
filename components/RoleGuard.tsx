import { Redirect, useSegments } from 'expo-router';
import type { ReactNode } from 'react';
import { LoadingView } from '@/components/StateViews';
import { CONFIG } from '@/constants/config';
import { useRole } from '@/hooks/useRole';
import type { UserRole } from '@/types/user';

interface Props {
  /** Roles allowed to see the children. */
  allow: UserRole[];
  /** Last path segments that stay public (login / landing screens inside the guarded folder). */
  publicRoutes?: string[];
  children: ReactNode;
}

/** Wrap a layout's navigator. Signed-out -> /login. Wrong role -> "/" (which routes by role). */
export function RoleGuard({ allow, publicRoutes = [], children }: Props) {
  const segments = useSegments();
  const { session, role, loading } = useRole();
  const last = String(segments[segments.length - 1] ?? '');

  if (CONFIG.USE_MOCK || publicRoutes.includes(last)) return <>{children}</>;
  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/login" />;
  if (!role || !allow.includes(role)) return <Redirect href="/" />;
  return <>{children}</>;
}
