import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { MOCK_ALERTS } from '@/constants/mockData';
import { queryKeys } from '@/lib/queryClient';
import { getAreaAlerts } from '@/services/alertsService';

/** Active alerts for an area and its neighbours. */
export function useAreaAlerts(areaId: number | null) {
  return useQuery({
    queryKey: queryKeys.areaAlerts(areaId ?? -1),
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve(MOCK_ALERTS) : getAreaAlerts(areaId as number)),
    enabled: areaId != null,
  });
}
