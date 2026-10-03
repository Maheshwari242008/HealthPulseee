import { useCallback, useEffect, useState } from 'react';
import { getAdminDashboard } from '@/services/adminService';
import type { AdminDashboard } from '@/types/admin';

export function useAdminDashboard() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((result) => {
        if (!active) return;
        setData(result);
        setError(null);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e : new Error('Failed to load dashboard'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return { data, isLoading, error, reload };
}
