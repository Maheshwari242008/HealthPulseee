import { Button, ScrollView, Text, View } from 'react-native';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';

// Plain data screen. The UI teammate restyles the JSX; the hook stays the same.
export default function Dashboard() {
  const { data, isLoading, error, reload } = useAdminDashboard();

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48, gap: 8 }}>
      <Text style={{ fontWeight: 'bold' }}>Dashboard</Text>
      <Button title="Reload" onPress={reload} />
      {isLoading && <Text>Loading...</Text>}
      {error && <Text>Error: {error.message}</Text>}
      {data && (
        <View style={{ gap: 4 }}>
          <Text>Active alerts: {data.activeAlerts} (high: {data.highAlerts})</Text>
          <Text>Affected regions: {data.affectedRegions}</Text>
          <Text>Reports received (7 days): {data.reportsReceived} ({data.casesReceived} cases)</Text>
          <Text>Pending actions: {data.pendingActions ?? 'n/a'}</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Disease activity (last 7 days)</Text>
          <Text selectable>{JSON.stringify(data.activity, null, 2)}</Text>
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>Latest alerts</Text>
          {data.latestAlerts.map((a) => (
            <Text key={a.id}>
              {a.title} - {a.area_name ?? 'unknown area'} ({a.severity})
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
