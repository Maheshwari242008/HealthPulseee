import { useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { Card, Group, ListRow, Page, SectionTitle, Stat } from "@/components/ui";
import { useAllReports } from "@/hooks/useAdmin";
import { theme } from "@/constants/theme";
import { shortDate } from "@/lib/date";
import { capitalize } from "@/lib/format";

/** Every lab report submitted (aggregate counts), newest first. */
export default function AdministrationScreen() {
  const q = useAllReports();
  const total = useMemo(() => (q.data ?? []).reduce((s, r) => s + r.case_count, 0), [q.data]);

  if (q.isLoading) return <LoadingView />;
  if (q.error) return <ErrorView message={q.error instanceof Error ? q.error.message : undefined} onRetry={q.refetch} />;

  return (
    <Page title="Lab reports" subtitle="Latest 200 submissions" back refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      <Card>
        <SectionTitle>Summary</SectionTitle>
        <Stat label="Reports" value={q.data?.length ?? 0} />
        <Stat label="Cases in these reports" value={total} />
      </Card>
      {(q.data ?? []).length === 0 ? <Text style={styles.muted}>No reports yet.</Text> : null}
      <Group>
        {(q.data ?? []).map((r) => (
          <ListRow
            key={r.id}
            label={`${capitalize(r.diseases?.name ?? "Disease")} · ${r.case_count}`}
            value={`${r.areas?.name ?? `${Number(r.areas?.cell_lat ?? 0).toFixed(2)}, ${Number(r.areas?.cell_lon ?? 0).toFixed(2)}`} · ${shortDate(r.report_date)}`}
          />
        ))}
      </Group>
    </Page>
  );
}

const styles = StyleSheet.create({ muted: { fontSize: 14, color: theme.colors.muted } });
