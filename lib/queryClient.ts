import { QueryClient } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CONFIG.QUERY_STALE_MS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/** Central query keys so hooks and realtime invalidation stay in sync. */
export const queryKeys = {
  cells: (disease: string | null, asOf: string | null) => ['cells', disease, asOf] as const,
  areaAlerts: (areaId: number) => ['alerts', areaId] as const,
  trend: (areaId: number, disease: string, days: number) =>
    ['trend', areaId, disease, days] as const,
  profile: ['profile'] as const,
  roles: ['roles'] as const,
  myReports: ['reports', 'mine'] as const,
};
