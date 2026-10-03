import { useRouter, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { RiskPill } from "@/components/RiskPill";
import { EmptyView, ErrorView, LoadingView } from "@/components/StateViews";
import { TrendChart } from "@/components/TrendChart";
import { Button, Card, Chip, Page, SectionTitle, Stat } from "@/components/ui";
import { DISEASES } from "@/constants/diseases";
import { theme } from "@/constants/theme";
import { useAreas } from "@/hooks/useArea";
import { useAreaAlerts } from "@/hooks/useAreaAlerts";
import { useCells } from "@/hooks/useCells";
import { useTrend } from "@/hooks/useTrend";
import { areaSubtitle, areaTitle, capitalize, growthLabel, timeAgo } from "@/lib/format";

export default function AreaDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ areaId?: string; disease?: string }>();
  const areaId = params.areaId ? Number(params.areaId) : null;
  const [disease, setDisease] = useState<string>(params.disease ?? "dengue");
  const { width } = useWindowDimensions();

  const areasQuery = useAreas();
  const cellsQuery = useCells(null);
  const trendQuery = useTrend(areaId, disease);
  const alertsQuery = useAreaAlerts(areaId);

  const area = useMemo(() => areasQuery.data?.find((a) => a.id === areaId) ?? null, [areasQuery.data, areaId]);
  const cell = useMemo(
    () => (cellsQuery.data ?? []).find((c) => c.area_id === areaId && c.disease === disease) ?? null,
    [cellsQuery.data, areaId, disease]
  );

  if (areaId == null) return <EmptyView title="No area selected" text="Open an area from the risk map." />;
  if (areasQuery.isLoading || cellsQuery.isLoading) return <LoadingView />;
  if (areasQuery.error || cellsQuery.error) {
    return (
      <ErrorView
        message={(areasQuery.error ?? cellsQuery.error) instanceof Error ? (areasQuery.error ?? cellsQuery.error)!.message : undefined}
        onRetry={() => {
          areasQuery.refetch();
          cellsQuery.refetch();
        }}
      />
    );
  }

  const nearbyAlerts = alertsQuery.data ?? [];

  return (
    <Page title={area ? areaTitle(area) : "Area"} subtitle={area ? areaSubtitle(area) : undefined} back>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {DISEASES.map((d) => (
          <Chip key={d.name} label={d.label} active={d.name === disease} onPress={() => setDisease(d.name)} />
        ))}
      </ScrollView>

      <Card>
        <View style={styles.top}>
          <SectionTitle>{capitalize(disease)}</SectionTitle>
          <RiskPill level={cell?.level ?? "NONE"} />
        </View>
        {cell && cell.level !== "NONE" ? (
          <View style={styles.stats}>
            <Stat label="Recent cases" value={cell.recent ?? "—"} />
            <Stat label="Change" value={growthLabel(cell.growth_pct)} />
            <Stat label="Nearby areas" value={cell.neighbors_affected ?? "—"} />
          </View>
        ) : (
          <Text style={styles.muted}>Too few reported cases to show details. Counts under 3 are hidden to protect privacy.</Text>
        )}
      </Card>

      <Card>
        <SectionTitle>Last 14 days</SectionTitle>
        {trendQuery.isLoading ? <Text style={styles.muted}>Loading…</Text> : <TrendChart data={trendQuery.data ?? []} width={Math.min(width - 68, 420)} />}
      </Card>

      <Card>
        <SectionTitle>Active alerts here and nearby</SectionTitle>
        {nearbyAlerts.length === 0 ? (
          <Text style={styles.muted}>No active alerts.</Text>
        ) : (
          nearbyAlerts.map((a) => (
            <View key={a.alert_id} style={styles.alertRow}>
              <RiskPill level={a.severity} />
              <Text style={styles.alertTitle}>{capitalize(a.title)}</Text>
              <Text style={styles.muted}>
                {a.is_nearby ? "Nearby area · " : ""}
                {timeAgo(a.created_at)}
              </Text>
            </View>
          ))
        )}
      </Card>

      <Button label="Prevention tips" variant="outline" onPress={() => router.push("/user/prevention-tips")} />
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stats: { flexDirection: "row", gap: 12 },
  muted: { fontSize: 14, lineHeight: 20, color: theme.colors.muted },
  alertRow: { gap: 4, paddingVertical: 4 },
  alertTitle: { fontSize: 16, fontWeight: "600", color: theme.colors.text },
});
