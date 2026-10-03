import { useEffect, useState } from 'react';
import { Button, ScrollView, Text, View } from 'react-native';
import { getAdminAlerts } from '@/services/adminAlertsService';
import { subscribeToAlerts } from '@/services/alertsService';
import type { LatestAlert } from '@/types/admin';

const FILTERS = ['ALL', 'HIGH', 'MODERATE', 'LOW'] as const;
type Filter = (typeof FILTERS)[number];

export default function Alerts() {
  const [alerts, setAlerts] = useState<LatestAlert[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = () =>
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

    load();
    const unsubscribe = subscribeToAlerts(load); // live refresh when an alert is created
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const shown = filter === 'ALL' ? alerts : alerts.filter((a) => a.severity === filter);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Alerts & Reports ({alerts.length})</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {FILTERS.map((f) => (
          <Button key={f} title={f === filter ? `[${f}]` : f} onPress={() => setFilter(f)} />
        ))}
      </View>
      {loading && <Text>Loading...</Text>}
      {error ? <Text>Error: {error}</Text> : null}
      {shown.map((a) => (
        <View key={a.id} style={{ borderWidth: 1, padding: 10, marginBottom: 8 }}>
          <Text style={{ fontWeight: 'bold' }}>
            {a.title} ({a.severity})
          </Text>
          <Text>
            {a.area_name ?? 'Unknown area'} - {a.disease ?? ''}
          </Text>
          <Text>{new Date(a.created_at).toLocaleString()}</Text>
        </View>
      ))}
      {!loading && shown.length === 0 && <Text>No alerts.</Text>}
    </ScrollView>
  );
}
