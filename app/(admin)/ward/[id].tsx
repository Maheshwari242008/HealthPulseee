import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { RiskPill } from "@/components/RiskPill";
import { EmptyView, ErrorView, LoadingView } from "@/components/StateViews";
import { TrendChart } from "@/components/TrendChart";
import { Card, Chip, Page, SectionTitle, Stat } from "@/components/ui";
import { DISEASES } from "@/constants/diseases";
import { theme } from "@/constants/theme";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { useTrend } from "@/hooks/useTrend";
import { capitalize, growthLabel } from "@/lib/format";

/** Area ("ward") detail with real counts for all six diseases. */
export default function WardScreen() {
  const { id, disease: initial } = useLocalSearchParams<{ id: string; disease?: string }>();
  const areaId = Number(id);
  const [disease, setDisease] = useState(initial ?? "dengue");
  const { width } = useWindowDimensions();
  const q = useAdminDashboard();
  const trend = useTrend(Number.isFinite(areaId) ? areaId : null, disease);

  if (q.isLoading) return <LoadingView />;
  if (q.error) return <ErrorView message={q.error instanceof Error ? q.error.message : undefined} onRetry={q.refetch} />;

  const rows = (q.data ?? []).filter((c) => c.area_id === areaId);
  if (rows.length === 0) return <EmptyView title="Area not found" />;
  const cell = rows.find((r) => r.disease === disease) ?? rows[0];

  return (
    <Page title={cell.area_name ?? `${Number(cell.cell_lat).toFixed(2)}, ${Number(cell.cell_lon).toFixed(2)}`} subtitle="Real counts (administrators only)" back>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {DISEASES.map((d) => (
          <Chip key={d.name} label={d.label} active={d.name === disease} onPress={() => setDisease(d.name)} />
        ))}
      </ScrollView>
      <Card>
        <View style={styles.top}>
          <SectionTitle>{capitalize(cell.disease)}</SectionTitle>
          <RiskPill level={cell.level} />
        </View>
        <View style={styles.row}>
          <Stat label="Recent (7d)" value={cell.recent} />
          <Stat label="Prior (7d)" value={cell.prior} />
          <Stat label="Change" value={growthLabel(cell.growth_pct)} />
        </View>
        <View style={styles.row}>
          <Stat label="Score" value={cell.score ?? "—"} />
          <Stat label="Neighbour cases" value={cell.neighbor_cases} />
          <Stat label="Areas affected" value={cell.neighbors_affected} />
        </View>
      </Card>
      <Card>
        <SectionTitle>Last 14 days</SectionTitle>
        <TrendChart data={trend.data ?? []} width={Math.min(width - 68, 420)} />
      </Card>
      <Card>
        <SectionTitle>All diseases here</SectionTitle>
        {rows.map((r) => (
          <View key={r.disease} style={styles.top}>
            <Text style={styles.name}>{capitalize(r.disease)} · {r.recent}</Text>
            <RiskPill level={r.level} />
          </View>
        ))}
      </Card>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  row: { flexDirection: "row", gap: 12 },
  name: { fontSize: 16, color: theme.colors.text },
});
