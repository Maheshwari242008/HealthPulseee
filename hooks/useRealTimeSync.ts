import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { CONFIG } from '@/constants/config';
import { subscribeToAlerts } from '@/services/alertsService';
import { subscribeToSync } from '@/services/cellsService';

/**
 * Subscribe ONCE (in the root layout) so Home, Map and Alerts all refresh when a lab report arrives.
 * Subscribing from several screens would reuse the same channel name and throw.
 * Pass enabled=false while signed out (RLS would block the events anyway).
 */
export function useRealtimeSync(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (CONFIG.USE_MOCK || !enabled) return;
    const offSync = subscribeToSync(() => {
      queryClient.invalidateQueries({ queryKey: ['cells'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['trend'] });
    });
    const offAlerts = subscribeToAlerts(() => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    });
    return () => {
      offSync();
      offAlerts();
    };
  }, [queryClient, enabled]);
}
