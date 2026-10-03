import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';
import { RISK_LEVELS } from '@/constants/riskLevels';
import { getAdminCells } from '@/services/adminService';
import type { AdminCell } from '@/types/cell';
import { C } from '@/theme/admin';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE, UrlTile } from 'react-native-maps';

const DISEASES = ['all', 'dengue', 'malaria', 'chikungunya', 'typhoid', 'cholera', 'diarrhoea'];
const SOLAPUR = { latitude: 17.67, longitude: 75.91 };
const HALF = 0.005; // a cell is 0.01 degrees, about 1.1 km

// Find the cell centre: use lat/lon fields if they exist, else read "Cell 17.67, 75.91" from the name.
function coords(c: AdminCell): { lat: number; lon: number } | null {
  const x = c as unknown as Record<string, unknown>;
  const lat = Number(x.cell_lat ?? x.lat ?? x.latitude);
  const lon = Number(x.cell_lon ?? x.lon ?? x.lng ?? x.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  const m = /(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/.exec(c.area_name ?? '');
  return m ? { lat: Number(m[1]), lon: Number(m[2]) } : null;
}

const alpha = (hex: string, a: string) => (/^#[0-9a-f]{6}$/i.test(hex) ? hex + a : hex);

export default function RiskMap() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [cells, setCells] = useState<AdminCell[]>([]);
  const [disease, setDisease] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getAdminCells()
      .then((r) => {
        setCells(r);
        setError('');
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load map'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const shown = useMemo(
    () => cells.filter((c) => c.level !== 'NONE').filter((c) => disease === 'all' || c.disease === disease),
    [cells, disease],
  );

  const points = useMemo(
    () => shown.map((c) => ({ c, p: coords(c) })).filter((x): x is { c: AdminCell; p: { lat: number; lon: number } } => x.p !== null),
    [shown],
  );

  // Zoom the map to fit all shown cells
  useEffect(() => {
    if (points.length === 0) return;
    const t = setTimeout(() => {
      mapRef.current?.fitToCoordinates(
        points.map(({ p }) => ({ latitude: p.lat, longitude: p.lon })),
        { edgePadding: { top: 60, right: 60, bottom: 60, left: 60 }, animated: true },
      );
    }, 400);
    return () => clearTimeout(t);
  }, [points]);

  const openWard = (c: AdminCell) => router.push(`/(admin)/ward/${c.area_id}` as Href);
  const focus = (lat: number, lon: number) =>
    mapRef.current?.animateToRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.03, longitudeDelta: 0.03 }, 500);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.pad}>
        <View style={s.head}>
          <View>
            <Text style={s.title}>City Risk Map</Text>
            <Text style={s.sub}>
              {shown.length} {shown.length === 1 ? 'area' : 'areas'} at risk
            </Text>
          </View>
          <Pressable onPress={load} style={s.reload}>
            <Text style={s.reloadTxt}>Reload</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {DISEASES.map((d) => (
            <Pressable key={d} onPress={() => setDisease(d)} style={[s.chip, disease === d && s.chipOn]}>
              <Text style={[s.chipTxt, disease === d && s.chipTxtOn]}>{d.toUpperCase()}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={s.mapBox}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            initialRegion={{ ...SOLAPUR, latitudeDelta: 0.12, longitudeDelta: 0.12 }}
            showsUserLocation
            showsMyLocationButton
          >
            {points.map(({ c, p }) => {
              const color = RISK_LEVELS[c.level].color;
              return (
                <View key={`${c.area_id}-${c.disease}`}>
                  <Polygon
                    coordinates={[
                      { latitude: p.lat - HALF, longitude: p.lon - HALF },
                      { latitude: p.lat - HALF, longitude: p.lon + HALF },
                      { latitude: p.lat + HALF, longitude: p.lon + HALF },
                      { latitude: p.lat + HALF, longitude: p.lon - HALF },
                    ]}
                    fillColor={alpha(color, '66')}
                    strokeColor={color}
                    strokeWidth={2}
                  />
                  <Marker
                    coordinate={{ latitude: p.lat, longitude: p.lon }}
                    pinColor={color}
                    title={`${c.area_name ?? `Area ${c.area_id}`} - ${c.disease}`}
                    description={`Risk: ${RISK_LEVELS[c.level].label}. Tap to open details`}
                    onCalloutPress={() => openWard(c)}
                  />
                </View>
              );
            })}
          </MapView>
        </View>

        <View style={s.legend}>
          {(['LOW', 'MODERATE', 'HIGH'] as const).map((k) => (
            <View key={k} style={s.leg}>
              <View style={[s.dot, { backgroundColor: RISK_LEVELS[k].color }]} />
              <Text style={s.legTxt}>{RISK_LEVELS[k].label}</Text>
            </View>
          ))}
        </View>

        {loading ? <ActivityIndicator color={C.teal} /> : null}
        {error ? <Text style={s.err}>Error: {error}</Text> : null}
        {!loading && shown.length === 0 ? <Text style={s.empty}>No areas at risk for this filter.</Text> : null}

        {shown.map((c) => {
          const lv = RISK_LEVELS[c.level];
          const p = coords(c);
          const g = Math.round(Number(c.growth_pct ?? 0));
          return (
            <Pressable key={`${c.area_id}-${c.disease}`} onPress={() => openWard(c)} style={s.card}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{c.disease}</Text>
                  <Text style={s.sub}>{c.area_name ?? `Area ${c.area_id}`}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: lv.color }]}>
                  <Text style={s.pillTxt}>{lv.label.toUpperCase()}</Text>
                </View>
              </View>

              <View style={s.track}>
                <View style={[s.fill, { width: `${Math.min(100, Math.max(4, (c.score ?? 0) * 100))}%`, backgroundColor: lv.color }]} />
              </View>
              <Text style={s.sub}>Score {c.score?.toFixed(2) ?? '-'}</Text>

              <View style={s.minis}>
                <Mini label="Last 7 days" value={String(c.recent)} />
                <Mini label="Previous 7" value={String(c.prior)} />
                <Mini label="Growth" value={`${g > 0 ? '+' : ''}${g}%`} tone={g > 0 ? C.high : g < 0 ? C.low : C.ink} />
              </View>

              {p ? (
                <Pressable onPress={() => focus(p.lat, p.lon)} hitSlop={8}>
                  <Text style={s.link}>Show on map</Text>
                </Pressable>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={s.mini}>
      <Text style={s.miniLabel}>{label}</Text>
      <Text style={[s.miniValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20, gap: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: C.ink },
  sub: { color: C.muted, fontSize: 13, marginTop: 2 },
  reload: { borderWidth: 1.5, borderColor: C.teal, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  reloadTxt: { color: C.teal, fontWeight: '700' },
  filters: { gap: 8, paddingRight: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  chipOn: { backgroundColor: C.teal, borderColor: C.teal },
  chipTxt: { color: C.ink, fontWeight: '600', fontSize: 12 },
  chipTxtOn: { color: '#FFFFFF' },
  mapBox: { height: 320, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  legend: { flexDirection: 'row', gap: 16, justifyContent: 'center' },
  leg: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legTxt: { color: C.ink, fontSize: 12 },
  err: { color: C.high, fontWeight: '600' },
  empty: { color: C.muted, textAlign: 'center', marginTop: 12 },
  card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: C.ink, fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
  pill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14 },
  pillTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, backgroundColor: C.mint, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  minis: { flexDirection: 'row', gap: 8 },
  mini: { flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 10 },
  miniLabel: { color: C.muted, fontSize: 11 },
  miniValue: { color: C.ink, fontSize: 18, fontWeight: '700', marginTop: 2 },
  link: { color: C.teal, fontWeight: '700', fontSize: 13 },
});