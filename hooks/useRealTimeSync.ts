import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CONFIG } from '@/constants/config';
import { subscribeToAlerts } from '@/services/alertsService';
import { subscribeToSync } from '@/services/cellsService';

/**
 * Subscribe ONCE (in the tabs layout) so Home, Map and Alerts all refresh when a lab report arrives.
 * Subscribing from several screens would reuse the same channel name and throw.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (CONFIG.USE_MOCK) return;
    const offSync = subscribeToSync(() => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
    });
    const offAlerts = subscribeToAlerts(() => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
    });
    return () => {
      offSync();
      offAlerts();
    };
  }, [queryClient]);
}
