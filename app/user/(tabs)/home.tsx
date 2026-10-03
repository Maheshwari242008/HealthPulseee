import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AreaPickerModal } from "@/components/AreaPickerModel";
import { RiskPill } from "@/components/RiskPill";
import { ErrorView, LoadingView, MockBanner } from "@/components/StateViews";
import { CONFIG } from "@/constants/config";
import { DISCLAIMER, DISEASES, getDiseaseMeta } from "@/constants/diseases";
import { RISK_LEVELS } from "@/constants/riskLevels";
import { theme } from "@/constants/theme";
import { useCells } from "@/hooks/useCells";
import { useHomeArea } from "@/hooks/useHomeArea";
import { areaTitle, growthLabel } from "@/lib/format";
import type { Cell } from "@/types/cell";

/** Highest level first, then highest score. */
function pickTop(cells: Cell[]): Cell | null {
  if (cells.length === 0) return null;
  return [...cells].sort(
    (a, b) =>
      RISK_LEVELS[b.level].rank - RISK_LEVELS[a.level].rank || (b.score ?? 0) - (a.score ?? 0)
  )[0];
}

function headline(top: Cell | null): string {
  if (!top || top.level === "NONE") return "No unusual disease activity has been reported in your area.";
  const name = getDiseaseMeta(top.disease)?.label ?? top.disease;
  if (top.level === "LOW") return `${name} activity is low in your area. Keep up simple precautions.`;
  if (top.level === "MODERATE") return `${name} activity has increased in your area. Stay alert and take simple precautions.`;
  return `${name} activity is high in your area. Take precautions and see a doctor if you feel unwell.`;
}

export default function HomeScreen() {
  const router = useRouter();
  const { area, areas, setArea, isLoading: areaLoading, error: areaError, refetch: refetchAreas } = useHomeArea();
  const cellsQuery = useCells(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const areaCells = useMemo(
    () => (area ? (cellsQuery.data ?? []).filter((c) => c.area_id === area.id) : []),
    [cellsQuery.data, area]
  );
  const top = useMemo(() => pickTop(areaCells), [areaCells]);

  if (areaLoading || (cellsQuery.isLoading && !cellsQuery.data)) return <LoadingView />;

  const error = areaError ?? cellsQuery.error;
  if (error || !area) {
    return (
      <ErrorView
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => {
          refetchAreas();
          cellsQuery.refetch();
        }}
      />
    );
  }

  const level = top?.level ?? "NONE";
  const changeIsUp = (top?.growth_pct ?? 0) > 0;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={cellsQuery.isRefetching}
            onRefresh={() => cellsQuery.refetch()}
            tintColor={theme.colors.primary}
          />
        }
      >
        {CONFIG.USE_MOCK ? <MockBanner /> : null}

        <View style={styles.topRow}>
          <Pressable style={styles.areaChip} onPress={() => setPickerOpen(true)}>
            <Ionicons name="map-outline" size={18} color={theme.colors.primary} />
            <Text style={styles.areaChipText} numberOfLines={1}>
              {areaTitle(area)}
            </Text>
          </Pressable>
          <Pressable onPress={() => setPickerOpen(true)} hitSlop={10}>
            <Text style={styles.changeArea}>Change area</Text>
          </Pressable>
        </View>

        <View style={styles.mainCard}>
          <Text style={styles.label}>Your area</Text>
          <Text style={styles.mainTitle}>{RISK_LEVELS[level].label}</Text>
          <RiskPill level={level} />
          <Text style={styles.message}>{headline(top)}</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.label}>Recent activity</Text>
              <Text style={styles.statValue}>
                {top?.recent != null ? `${top.recent} cases` : "—"}
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.label}>Change</Text>
              <Text style={[styles.statValue, { color: changeIsUp ? theme.colors.danger : theme.colors.mintText }]}>
                {growthLabel(top?.growth_pct)}
              </Text>
            </View>
          </View>

          <View style={styles.stat}>
            <Text style={styles.label}>Nearby affected areas</Text>
            <Text style={styles.statValue}>{top?.neighbors_affected ?? "—"}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/user/risk-map")}>
              <Text style={styles.primaryButtonText}>View risk map</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/user/prevention-tips")} hitSlop={8}>
              <Text style={styles.link}>Prevention tips</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.grid}>
          {DISEASES.map((d) => {
            const cell = areaCells.find((c) => c.disease === d.name);
            return (
              <Pressable
                key={d.name}
                style={styles.diseaseCard}
                onPress={() => router.push({ pathname: "/user/disease-info", params: { name: d.name } })}
              >
                <Text style={styles.diseaseName}>{d.label}</Text>
                <RiskPill level={cell?.level ?? "NONE"} />
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.disclaimer}>{DISCLAIMER}</Text>
      </ScrollView>

      <AreaPickerModal
        visible={pickerOpen}
        areas={areas}
        selectedId={area.id}
        onSelect={setArea}
        onClose={() => setPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  areaChip: {
    flexShrink: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.colors.mint,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
  },
  areaChipText: { flexShrink: 1, fontSize: 15, color: theme.colors.text },
  changeArea: { fontSize: 15, color: theme.colors.primary, fontWeight: "500" },
  mainCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 22,
    gap: 12,
  },
  label: { fontSize: 15, color: theme.colors.muted },
  mainTitle: { fontFamily: theme.fonts.heading, fontSize: 30, fontWeight: "800", color: theme.colors.primary },
  message: { fontSize: 18, lineHeight: 27, color: theme.colors.text },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 6 },
  stat: { flex: 1, gap: 4 },
  statValue: { fontFamily: theme.fonts.heading, fontSize: 34, fontWeight: "800", color: theme.colors.primary },
  actions: { flexDirection: "row", alignItems: "center", gap: 18, marginTop: 8 },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 26,
    paddingVertical: 16,
    borderRadius: theme.radius.small,
  },
  primaryButtonText: { color: theme.colors.primaryText, fontSize: 18, fontWeight: "700" },
  link: { fontSize: 15, color: theme.colors.primary, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  diseaseCard: {
    width: "48%",
    flexGrow: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 12,
  },
  diseaseName: { fontFamily: theme.fonts.heading, fontSize: 22, fontWeight: "700", color: theme.colors.primary },
  disclaimer: { fontSize: 12, lineHeight: 18, color: theme.colors.muted, textAlign: "center", marginTop: 4 },
});
