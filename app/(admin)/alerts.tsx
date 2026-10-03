import { useEffect, useState } from 'react';
import { getAdminAlerts } from '@/services/adminAlertsService';
import { subscribeToAlerts } from '@/services/alertsService';
import type { LatestAlert } from '@/types/admin';
import AlertsView from '@/components/admin/AlertsView';

export default function Alerts() {
  const [alerts, setAlerts] = useState<LatestAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () =>
    getAdminAlerts()
      .then((result) => {
        setAlerts(result);
        setError('');
      })
      .catch((e) => {
        setError(e instanceof Error ? e.message : 'Failed to load alerts');
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    let active = true;

    const refresh = () =>
      getAdminAlerts()
        .then((result) => {
          if (!active) return;
          setAlerts(result);
          setError('');
        })
        .catch((e) => {
          if (active) setError(e instanceof Error ? e.message : 'Failed to load alerts');
        })
        .finally(() => {
          if (active) setLoading(false);
        });

    refresh();
    const unsubscribe = subscribeToAlerts(refresh); // live refresh when an alert is created
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return (
    <AlertsView
      isLoading={loading}
      error={error || null}
      onReload={load}
      alerts={alerts.map((a) => ({
        id: String(a.id),
        title: a.title,
        subtitle: `${a.area_name ?? 'Unknown area'}${a.disease ? ' - ' + a.disease : ''}`,
        severity: String(a.severity),
        time: new Date(a.created_at).toLocaleString(),
      }))}
    />
  );
}