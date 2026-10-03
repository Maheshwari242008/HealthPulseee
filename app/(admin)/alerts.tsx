import { Alert, StyleSheet, Text, View } from "react-native";
import { RiskPill } from "@/components/RiskPill";
import { ErrorView, LoadingView } from "@/components/StateViews";
import { Button, Card, Page } from "@/components/ui";
import { theme } from "@/constants/theme";
import { useAdminAlerts, useDeleteAlert, useExpireAlert } from "@/hooks/useAdmin";
import { areaTitle, capitalize, timeAgo } from "@/lib/format";

export default function AdminAlertsScreen() {
  const q = useAdminAlerts();
  const expire = useExpireAlert();
  const remove = useDeleteAlert();

  if (q.isLoading) return <LoadingView />;
  if (q.error) return <ErrorView message={q.error instanceof Error ? q.error.message : undefined} onRetry={q.refetch} />;

  const fail = (e: unknown) => Alert.alert("Could not update", e instanceof Error ? e.message : "Try again.");

  return (
    <Page title="Active alerts" subtitle="Includes automatic and manual alerts" refreshing={q.isRefetching} onRefresh={() => q.refetch()}>
      {(q.data ?? []).length === 0 ? <Text style={styles.muted}>No active alerts.</Text> : null}
      {(q.data ?? []).map((a) => (
        <Card key={a.id}>
          <View style={styles.top}>
            <RiskPill level={a.severity} />
            <Text style={styles.muted}>{timeAgo(a.created_at)}</Text>
          </View>
          <Text style={styles.title}>{capitalize(a.title)}</Text>
          <Text style={styles.muted}>
            {capitalize(a.diseases?.name ?? "")} ·{" "}
            {a.areas ? areaTitle({ id: a.area_id, name: a.areas.name, district: null, state: null, cell_lat: a.areas.cell_lat, cell_lon: a.areas.cell_lon }) : `Area ${a.area_id}`}
          </Text>
          <Text style={styles.body}>{a.message}</Text>
          <View style={styles.actions}>
            <Button
              label="End now"
              variant="outline"
              style={{ flex: 1 }}
              onPress={() => expire.mutate(a.id, { onError: fail })}
              loading={expire.isPending && expire.variables === a.id}
            />
            <Button
              label="Delete"
              variant="danger"
              style={{ flex: 1 }}
              onPress={() =>
                Alert.alert("Delete alert", "This removes the alert permanently.", [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => remove.mutate(a.id, { onError: fail }) },
                ])
              }
            />
          </View>
        </Card>
      ))}
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontFamily: theme.fonts.heading, fontSize: 19, fontWeight: "700", color: theme.colors.primary },
  body: { fontSize: 15, lineHeight: 22, color: theme.colors.text },
  muted: { fontSize: 13, color: theme.colors.muted },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
});
