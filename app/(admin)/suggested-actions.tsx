import { useRouter } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { RiskPill } from "@/components/RiskPill";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { Button, Card, Page } from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { buildSuggestions } from "@/lib/adminActions";
import { capitalize } from "@/lib/format";

export default function SuggestedActionsScreen() {
  const router = useRouter();
  const q = useAdminDashboard();
  const items = useMemo(() => buildSuggestions(q.data ?? []), [q.data]);

  if (q.isLoading) return <LoadingView />;
  if (q.error) return <ErrorView message={q.error instanceof Error ? q.error.message : undefined} onRetry={q.refetch} />;

  return (
    <Page title="Suggested actions" subtitle="Advisory only. Based on current risk levels." back>
      {items.length === 0 ? <Text style={styles.muted}>No Moderate or High areas right now.</Text> : null}
      {items.map((s) => (
        <Card key={s.key}>
          <RiskPill level={s.cell.level} />
          <Text style={styles.title}>{capitalize(s.title)}</Text>
          {s.steps.map((step) => (
            <View key={step} style={styles.row}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.body}>{step}</Text>
            </View>
          ))}
          <Button
            label="Create alert"
            variant="outline"
            onPress={() =>
              router.push({
                pathname: "/actions",
                params: { areaId: String(s.cell.area_id), disease: s.cell.disease, severity: s.alertSeverity },
              })
            }
          />
        </Card>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: theme.fonts.heading, fontSize: 19, fontWeight: "700", color: theme.colors.primary },
  row: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 15, lineHeight: 22, color: theme.colors.primary },
  body: { flex: 1, fontSize: 15, lineHeight: 22, color: theme.colors.text },
  muted: { fontSize: 14, color: theme.colors.muted },
});
