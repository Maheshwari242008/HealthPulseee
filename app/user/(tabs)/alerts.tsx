import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RiskPill } from "@/components/RiskPill";
import { EmptyView, ErrorView, LoadingView, MockBanner } from "@/components/StateViews";
import { CONFIG } from "@/constants/config";
import { theme } from "@/constants/theme";
import { useAreaAlerts } from "@/hooks/useAreaAlerts";
import { useHomeArea } from "@/hooks/useHomeArea";
import { areaTitle, capitalize, timeAgo, toLines } from "@/lib/format";
import type { Alert as AlertItem } from "@/types/alert";

function AlertCard({ alert }: { alert: AlertItem }) {
  const [open, setOpen] = useState(false);
  const precautions = toLines(alert.precautions);

  return (
    <Pressable style={styles.card} onPress={() => setOpen((v) => !v)}>
      <View style={styles.cardTop}>
        <RiskPill level={alert.severity} />
        {alert.is_nearby ? (
          <View style={styles.nearby}>
            <Text style={styles.nearbyText}>Nearby area</Text>
          </View>
        ) : null}
        <Text style={styles.time}>{timeAgo(alert.created_at)}</Text>
      </View>

      <Text style={styles.cardTitle}>{capitalize(alert.title)}</Text>
      <Text style={styles.message}>{alert.message}</Text>

      {open ? (
        <View style={styles.details}>
          {alert.symptoms ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Symptoms</Text>
              <Text style={styles.body}>{alert.symptoms}</Text>
            </View>
          ) : null}
          {precautions.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What you can do</Text>
              {precautions.map((p) => (
                <View key={p} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={[styles.body, { flex: 1 }]}>{p}</Text>
                </View>
              ))}
            </View>
          ) : null}
          {alert.when_to_seek_care ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>When to see a doctor</Text>
              <Text style={styles.body}>{alert.when_to_seek_care}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.toggle}>
        <Text style={styles.toggleText}>{open ? "Show less" : "Show precautions"}</Text>
        <Ionicons name={open ? "chevron-up" : "chevron-down"} size={16} color={theme.colors.primary} />
      </View>
    </Pressable>
  );
}

export default function AlertsScreen() {
  const { area, isLoading: areaLoading, error: areaError, refetch: refetchArea } = useHomeArea();
  const alertsQuery = useAreaAlerts(area?.id ?? null);

  if (areaLoading || (alertsQuery.isLoading && alertsQuery.fetchStatus !== "idle")) return <LoadingView />;

  const error = areaError ?? alertsQuery.error;
  if (error) {
    return (
      <ErrorView
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => {
          refetchArea();
          alertsQuery.refetch();
        }}
      />
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <FlatList
        data={alertsQuery.data ?? []}
        keyExtractor={(a) => String(a.alert_id)}
        renderItem={({ item }) => <AlertCard alert={item} />}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={alertsQuery.isRefetching}
            onRefresh={() => alertsQuery.refetch()}
            tintColor={theme.colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {CONFIG.USE_MOCK ? <MockBanner /> : null}
            <Text style={styles.title}>Alerts</Text>
            {area ? <Text style={styles.subtitle}>For {areaTitle(area)} and nearby areas</Text> : null}
          </View>
        }
        ListEmptyComponent={
          <EmptyView
            title="No active alerts"
            text="We will tell you here if disease activity rises in your area."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: 16, gap: 14, paddingBottom: 32, flexGrow: 1 },
  header: { gap: 6, marginBottom: 4 },
  title: { fontFamily: theme.fonts.heading, fontSize: 30, fontWeight: "800", color: theme.colors.primary },
  subtitle: { fontSize: 15, color: theme.colors.muted },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 10,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  nearby: { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  nearbyText: { fontSize: 12, color: theme.colors.muted, fontWeight: "600" },
  time: { marginLeft: "auto", fontSize: 12, color: theme.colors.muted },
  cardTitle: { fontFamily: theme.fonts.heading, fontSize: 21, fontWeight: "700", color: theme.colors.primary },
  message: { fontSize: 15, lineHeight: 22, color: theme.colors.text },
  details: { gap: 14, marginTop: 4 },
  section: { gap: 4 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: theme.colors.primary },
  body: { fontSize: 15, lineHeight: 22, color: theme.colors.text },
  bulletRow: { flexDirection: "row", gap: 8 },
  bullet: { fontSize: 15, lineHeight: 22, color: theme.colors.primary },
  toggle: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  toggleText: { fontSize: 14, fontWeight: "600", color: theme.colors.primary },
});
