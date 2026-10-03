import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { RiskPill } from "@/components/RiskPill";
import { ErrorView, LoadingView, MockBanner } from "@/components/StateViews";
import { Card, Page, SectionTitle, Stat } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useAdminAlerts, useAdminDashboard } from "@/hooks/useAdmin";
import { capitalize, growthLabel } from "@/lib/format";

export default function AdminDashboardScreen() {
  const router = useRouter();
  const q = useAdminDashboard();
  const alerts = useAdminAlerts();

  const summary = useMemo(() => {
    const cells = q.data ?? [];
    return {
      high: cells.filter((c) => c.level === "HIGH").length,
      moderate: cells.filter((c) => c.level === "MODERATE").length,
      cases: cells.reduce((s, c) => s + c.recent, 0),
      top: [...cells].filter((c) => c.level !== "NONE").sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 8),
    };
  }, [q.data]);

  if (q.isLoading) return <LoadingView />;
  if (q.error) return <ErrorView message={q.error instanceof Error ? q.error.message : undefined} onRetry={q.refetch} />;

  return (
    <Page title="Overview" subtitle="Real counts. Administrators only." refreshing={q.isRefetching} onRefresh={() => { q.refetch(); alerts.refetch(); }}>
      {CONFIG.USE_MOCK ? <MockBanner /> : null}
      <Card>
        <View style={styles.stats}>
          <Stat label="High cells" value={summary.high} />
          <Stat label="Moderate cells" value={summary.moderate} />
        </View>
        <View style={styles.stats}>
          <Stat label="Cases (7 days)" value={summary.cases} />
          <Stat label="Active alerts" value={alerts.data?.filter((a) => !a.expires_at || new Date(a.expires_at) > new Date()).length ?? "—"} />
        </View>
      </Card>

      <SectionTitle>Highest risk areas</SectionTitle>
      {summary.top.length === 0 ? (
        <Text style={styles.muted}>No areas above the privacy threshold right now.</Text>
      ) : (
        summary.top.map((c) => (
          <Pressable key={`${c.area_id}-${c.disease}`} onPress={() => router.push({ pathname: "/ward/[id]", params: { id: String(c.area_id), disease: c.disease } })}>
            <Card>
              <View style={styles.top}>
                <Text style={styles.name}>{capitalize(c.disease)}</Text>
                <RiskPill level={c.level} />
              </View>
              <Text style={styles.muted}>{c.area_name ?? `${Number(c.cell_lat).toFixed(2)}, ${Number(c.cell_lon).toFixed(2)}`}</Text>
              <View style={styles.stats}>
                <Stat label="Recent" value={c.recent} />
                <Stat label="Prior week" value={c.prior} />
                <Stat label="Change" value={growthLabel(c.growth_pct)} />
              </View>
            </Card>
          </Pressable>
        ))
      )}
      <Pressable onPress={() => router.push("/suggested-actions")}>
        <Text style={styles.link}>See suggested actions →</Text>
      </Pressable>
    </Page>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 12 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: "700", color: theme.colors.primary },
  muted: { fontSize: 14, color: theme.colors.muted },
  link: { color: theme.colors.primary, fontWeight: "700", fontSize: 15, textAlign: "center", marginTop: 4 },
});
