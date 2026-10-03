import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import DashboardView, { Activity } from '@/components/admin/DashboardView';

export default function Dashboard() {
  const { data, isLoading, error, reload } = useAdminDashboard();

  return (
    <DashboardView
      isLoading={isLoading}
      error={error?.message ?? null}
      activeAlerts={data?.activeAlerts ?? 0}
      highAlerts={data?.highAlerts ?? 0}
      affectedRegions={data?.affectedRegions ?? 0}
      reports={data?.reportsReceived ?? 0}
      cases={data?.casesReceived ?? 0}
      pendingActions={data?.pendingActions ?? null}
      activity={(data?.activity ?? null) as Activity | null}
      latestAlerts={(data?.latestAlerts ?? []).map((a) => ({
        id: String(a.id),
        title: a.title,
        area: a.area_name ?? 'Unknown area',
        severity: String(a.severity),
      }))}
      onReload={reload}
    />
  );
}