import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { RiskPill } from "@/components/RiskPill";
import { EmptyView, ErrorView, LoadingView } from "@/components/StateViews";
import { Card, Page, SectionTitle } from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAreaAlerts } from "@/hooks/useAreaAlerts";
import { useHomeArea } from "@/hooks/useHomeArea";
import { capitalize, timeAgo, toLines } from "@/lib/format";

export default function AlertDetailScreen() {
  const { alertId } = useLocalSearchParams<{ alertId?: string }>();
  const { area, isLoading: areaLoading } = useHomeArea();
  const alertsQuery = useAreaAlerts(area?.id ?? null);

  if (areaLoading || alertsQuery.isLoading) return <LoadingView />;
  if (alertsQuery.error) return <ErrorView message={alertsQuery.error instanceof Error ? alertsQuery.error.message : undefined} onRetry={alertsQuery.refetch} />;

  const alert = alertsQuery.data?.find((a) => String(a.alert_id) === alertId);
  if (!alert) return <EmptyView title="Alert not found" text="It may have expired." />;

  return (
    <Page title={capitalize(alert.title)} subtitle={timeAgo(alert.created_at)} back>
      <RiskPill level={alert.severity} />
      <Text style={styles.body}>{alert.message}</Text>
      {alert.symptoms ? (
        <Card>
          <SectionTitle>Symptoms</SectionTitle>
          <Text style={styles.body}>{alert.symptoms}</Text>
        </Card>
      ) : null}
      {toLines(alert.precautions).length ? (
        <Card>
          <SectionTitle>What to do</SectionTitle>
          {toLines(alert.precautions).map((p) => (
            <View key={p} style={styles.row}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.body}>{p}</Text>
            </View>
          ))}
        </Card>
      ) : null}
      {alert.when_to_seek_care ? (
        <Card>
          <SectionTitle>When to see a doctor</SectionTitle>
          <Text style={styles.body}>{alert.when_to_seek_care}</Text>
        </Card>
      ) : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 15, lineHeight: 22, color: theme.colors.primary },
  body: { flexShrink: 1, fontSize: 15, lineHeight: 22, color: theme.colors.text },
});
