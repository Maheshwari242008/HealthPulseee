import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { RiskPill } from "@/components/RiskPill";
import { CONFIG } from "@/constants/config";
import { DISEASES } from "@/constants/diseases";
import { RISK_LEVELS, RISK_MAP_COLORS, RISK_ORDER } from "@/constants/riskLevels";
import { theme } from "@/constants/theme";
import { useAreas } from "@/hooks/useArea";
import { useCells } from "@/hooks/useCells";
import { areaTitle, growthLabel } from "@/lib/format";
import type { Cell } from "@/types/cell";

const HALF = CONFIG.CELL_STEP / 2;
const SPAN = (CONFIG.GRID_SIZE - 1) * CONFIG.CELL_STEP;

const INITIAL_REGION = {
  latitude: CONFIG.GRID_ORIGIN_LAT + SPAN / 2,
  longitude: CONFIG.GRID_ORIGIN_LON + SPAN / 2,
  latitudeDelta: CONFIG.GRID_SIZE * CONFIG.CELL_STEP * 1.7,
  longitudeDelta: CONFIG.GRID_SIZE * CONFIG.CELL_STEP * 1.7,
};

const fillFor = (cell: Cell) => `${RISK_MAP_COLORS[cell.level]}${cell.level === "NONE" ? "1F" : "88"}`;
const strokeFor = (cell: Cell) => `${RISK_MAP_COLORS[cell.level]}${cell.level === "NONE" ? "55" : "FF"}`;

export default function RiskMapScreen() {
  const router = useRouter();
  const [disease, setDisease] = useState<string>("dengue");
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);

  const cellsQuery = useCells(disease);
  const areasQuery = useAreas();

  const cells = useMemo(() => cellsQuery.data ?? [], [cellsQuery.data]);
  const selected = useMemo(
    () => cells.find((c) => c.area_id === selectedAreaId) ?? null,
    [cells, selectedAreaId]
  );
  const selectedArea = useMemo(
    () => areasQuery.data?.find((a) => a.id === selectedAreaId) ?? null,
    [areasQuery.data, selectedAreaId]
  );

  return (
    <View style={styles.screen}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={INITIAL_REGION} toolbarEnabled={false}>
        {cells.map((cell) => (
          <Polygon
            key={`${cell.area_id}-${cell.disease}`}
            coordinates={[
              { latitude: cell.cell_lat - HALF, longitude: cell.cell_lon - HALF },
              { latitude: cell.cell_lat - HALF, longitude: cell.cell_lon + HALF },
              { latitude: cell.cell_lat + HALF, longitude: cell.cell_lon + HALF },
              { latitude: cell.cell_lat + HALF, longitude: cell.cell_lon - HALF },
            ]}
            fillColor={fillFor(cell)}
            strokeColor={strokeFor(cell)}
            strokeWidth={cell.area_id === selectedAreaId ? 3 : 1}
            tappable
            onPress={() => setSelectedAreaId(cell.area_id)}
          />
        ))}
      </MapView>

      <SafeAreaView edges={["top"]} style={styles.topOverlay}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {DISEASES.map((d) => {
            const active = d.name === disease;
            return (
              <Pressable
                key={d.name}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  setDisease(d.name);
                  setSelectedAreaId(null);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {cellsQuery.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : null}

      <View style={styles.panel}>
        {cellsQuery.error ? (
          <>
            <Text style={styles.panelTitle}>Could not load the map</Text>
            <Text style={styles.hint}>Check your connection and sign-in, then try again.</Text>
            <Pressable style={styles.button} onPress={() => cellsQuery.refetch()}>
              <Text style={styles.buttonText}>Try again</Text>
            </Pressable>
          </>
        ) : selected ? (
          <>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle} numberOfLines={1}>
                {selectedArea ? areaTitle(selectedArea) : "Selected area"}
              </Text>
              <RiskPill level={selected.level} />
            </View>
            {selected.level === "NONE" ? (
              <Text style={styles.hint}>
                Too few reported cases to show details. Counts under 3 are hidden to protect privacy.
              </Text>
            ) : (
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Recent</Text>
                  <Text style={styles.statValue}>{selected.recent ?? "—"}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Change</Text>
                  <Text style={styles.statValue}>{growthLabel(selected.growth_pct)}</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statLabel}>Nearby areas</Text>
                  <Text style={styles.statValue}>{selected.neighbors_affected ?? "—"}</Text>
                </View>
              </View>
            )}
            <Pressable
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: "/user/area-details",
                  params: { areaId: String(selected.area_id), disease },
                })
              }
            >
              <Text style={styles.buttonText}>Area details</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.hint}>Tap a square on the map to see details.</Text>
            <View style={styles.legend}>
              {RISK_ORDER.map((level) => (
                <View key={level} style={styles.legendItem}>
                  <View style={[styles.dot, { backgroundColor: RISK_MAP_COLORS[level] }]} />
                  <Text style={styles.legendText}>{RISK_LEVELS[level].label}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  topOverlay: { position: "absolute", top: 0, left: 0, right: 0, pointerEvents: "box-none" },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
  chipTextActive: { color: theme.colors.primaryText },
  loading: { position: "absolute", top: 110, alignSelf: "center" },
  panel: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 18,
    gap: 12,
  },
  panelHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  panelTitle: { flexShrink: 1, fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: "700", color: theme.colors.primary },
  hint: { fontSize: 14, lineHeight: 20, color: theme.colors.muted },
  statsRow: { flexDirection: "row", gap: 12 },
  stat: { flex: 1, gap: 2 },
  statLabel: { fontSize: 13, color: theme.colors.muted },
  statValue: { fontFamily: theme.fonts.heading, fontSize: 24, fontWeight: "800", color: theme.colors.primary },
  button: { backgroundColor: theme.colors.primary, borderRadius: theme.radius.small, paddingVertical: 14, alignItems: "center" },
  buttonText: { color: theme.colors.primaryText, fontSize: 16, fontWeight: "700" },
  legend: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 13, color: theme.colors.text },
});
