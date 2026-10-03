import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { useSession } from '@/hooks/useSession';
import { queryKeys } from '@/lib/queryClient';
import { getMyRoles, pickPrimaryRole } from '@/services/authService';
import type { UserRole } from '@/types/user';

/** Session + highest role (administrator > lab > user). role is null while loading / signed out. */
export function useRole() {
  const { session, loading: sessionLoading } = useSession();
  const userId = session?.user.id;

  const query = useQuery({
    queryKey: [...queryKeys.roles, userId],
    queryFn: async (): Promise<UserRole> => pickPrimaryRole(await getMyRoles(userId as string)),
    enabled: !!userId && !CONFIG.USE_MOCK,
  });

  return {
    session,
    role: CONFIG.USE_MOCK ? ('user' as UserRole) : (query.data ?? null),
    loading: sessionLoading || (!!userId && query.isLoading),
  };
}
