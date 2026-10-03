import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { RiskPill } from "@/components/RiskPill";
import { LoadingView } from "@/components/StateViews";
import { Button } from "@/components/ui";
import { CONFIG } from "@/constants/config";
import { DISEASES } from "@/constants/diseases";
import { RISK_MAP_COLORS } from "@/constants/riskLevels";
import { theme } from "@/constants/theme";
import { useAdminDashboard } from "@/hooks/useAdmin";
import { growthLabel } from "@/lib/format";

const HALF = CONFIG.CELL_STEP / 2;
const SPAN = (CONFIG.GRID_SIZE - 1) * CONFIG.CELL_STEP;
const REGION = {
  latitude: CONFIG.GRID_ORIGIN_LAT + SPAN / 2,
  longitude: CONFIG.GRID_ORIGIN_LON + SPAN / 2,
  latitudeDelta: CONFIG.GRID_SIZE * CONFIG.CELL_STEP * 1.7,
  longitudeDelta: CONFIG.GRID_SIZE * CONFIG.CELL_STEP * 1.7,
};

export default function AdminMapScreen() {
  const router = useRouter();
  const [disease, setDisease] = useState("dengue");
  const [selected, setSelected] = useState<number | null>(null);
  const q = useAdminDashboard();
  const cells = useMemo(() => (q.data ?? []).filter((c) => c.disease === disease), [q.data, disease]);
  const sel = cells.find((c) => c.area_id === selected) ?? null;

  if (q.isLoading) return <LoadingView />;

  return (
    <View style={styles.screen}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={REGION} toolbarEnabled={false}>
        {cells.map((c) => (
          <Polygon
            key={c.area_id}
            coordinates={[
              { latitude: c.cell_lat - HALF, longitude: c.cell_lon - HALF },
              { latitude: c.cell_lat - HALF, longitude: c.cell_lon + HALF },
              { latitude: c.cell_lat + HALF, longitude: c.cell_lon + HALF },
              { latitude: c.cell_lat + HALF, longitude: c.cell_lon - HALF },
            ]}
            fillColor={`${RISK_MAP_COLORS[c.level]}${c.level === "NONE" ? "1F" : "88"}`}
            strokeColor={`${RISK_MAP_COLORS[c.level]}${c.level === "NONE" ? "55" : "FF"}`}
            strokeWidth={c.area_id === selected ? 3 : 1}
            tappable
            onPress={() => setSelected(c.area_id)}
          />
        ))}
      </MapView>
      <SafeAreaView edges={["top"]} style={styles.top} pointerEvents="box-none">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {DISEASES.map((d) => (
            <Pressable key={d.name} style={[styles.chip, d.name === disease && styles.chipOn]} onPress={() => { setDisease(d.name); setSelected(null); }}>
              <Text style={[styles.chipText, d.name === disease && { color: theme.colors.primaryText }]}>{d.label}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
      <View style={styles.panel}>
        {sel ? (
          <>
            <View style={styles.head}>
              <Text style={styles.title}>{sel.area_name ?? `${Number(sel.cell_lat).toFixed(2)}, ${Number(sel.cell_lon).toFixed(2)}`}</Text>
              <RiskPill level={sel.level} />
            </View>
            <Text style={styles.text}>
              Recent {sel.recent} · Prior {sel.prior} · Change {growthLabel(sel.growth_pct)} · Neighbours {sel.neighbor_cases} cases in {sel.neighbors_affected} areas
            </Text>
            <Button label="Area detail" onPress={() => router.push({ pathname: "/ward/[id]", params: { id: String(sel.area_id), disease } })} />
          </>
        ) : (
          <Text style={styles.text}>Tap a square to see the real (un-suppressed) counts.</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  top: { position: "absolute", top: 0, left: 0, right: 0 },
  chips: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  chip: { backgroundColor: theme.colors.surface, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 999, borderWidth: 1, borderColor: theme.colors.border },
  chipOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { fontSize: 14, fontWeight: "600", color: theme.colors.text },
  panel: { position: "absolute", left: 12, right: 12, bottom: 12, backgroundColor: theme.colors.card, borderRadius: theme.radius.card, borderWidth: 1, borderColor: theme.colors.border, padding: 18, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  title: { flexShrink: 1, fontFamily: theme.fonts.heading, fontSize: 20, fontWeight: "700", color: theme.colors.primary },
  text: { fontSize: 14, lineHeight: 20, color: theme.colors.muted },
});
