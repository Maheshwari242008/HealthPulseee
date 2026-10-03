import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, LEVEL_COLOR } from '@/theme/admin';

export type RiskCell = {
  id: string;
  cell: string;        // e.g. "17.67, 75.91"
  disease: string;     // e.g. "dengue"
  level: string;       // HIGH | MODERATE | LOW
  label?: string;      // e.g. "Moderate activity"
  score: number;       // 0..1
  recent: number;      // last 7 days
  previous: number;    // previous 7 days
  growthPct: number;   // e.g. 20 or -25
};

type Props = {
  cells: RiskCell[];
  isLoading?: boolean;
  error?: string | null;
  onReload?: () => void;
};

const DISEASES = ['ALL', 'DENGUE', 'MALARIA', 'CHIKUNGUNYA', 'TYPHOID', 'CHOLERA', 'DIARRHOEA'];
const colorFor = (lv: string) => (LEVEL_COLOR as Record<string, string>)[lv?.toUpperCase()] ?? C.muted;

function Mini({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <View style={s.mini}>
      <Text style={s.miniLabel}>{label}</Text>
      <Text style={[s.miniValue, tone ? { color: tone } : null]}>{value}</Text>
    </View>
  );
}

export default function RiskMapView({ cells, isLoading, error, onReload }: Props) {
  const [filter, setFilter] = useState('ALL');
  const shown = filter === 'ALL' ? cells : cells.filter((c) => c.disease?.toUpperCase() === filter);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.pad}>
        <View style={s.head}>
          <View>
            <Text style={s.title}>City Risk Map</Text>
            <Text style={s.sub}>{shown.length} {shown.length === 1 ? 'area' : 'areas'} at risk</Text>
          </View>
          {onReload ? (
            <Pressable onPress={onReload} style={s.reload}>
              <Text style={s.reloadTxt}>Reload</Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filters}>
          {DISEASES.map((d) => (
            <Pressable key={d} onPress={() => setFilter(d)} style={[s.chip, filter === d && s.chipOn]}>
              <Text style={[s.chipTxt, filter === d && s.chipTxtOn]}>{d}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? <ActivityIndicator color={C.teal} /> : null}
        {error ? <Text style={s.err}>Error: {error}</Text> : null}
        {!isLoading && shown.length === 0 ? <Text style={s.empty}>No areas at risk for this filter.</Text> : null}

        {shown.map((c) => {
          const tone = colorFor(c.level);
          const g = Math.round(c.growthPct);
          return (
            <View key={c.id} style={s.card}>
              <View style={s.row}>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle}>{c.disease}</Text>
                  <Text style={s.sub}>Cell {c.cell}</Text>
                </View>
                <View style={[s.pill, { backgroundColor: tone }]}>
                  <Text style={s.pillTxt}>{c.level?.toUpperCase()}</Text>
                </View>
              </View>

              <View style={s.track}>
                <View style={[s.fill, { width: `${Math.min(100, Math.max(4, c.score * 100))}%`, backgroundColor: tone }]} />
              </View>
              <Text style={s.score}>
                {c.label ? `${c.label} - ` : ''}score {c.score.toFixed(2)}
              </Text>

              <View style={s.minis}>
                <Mini label="Last 7 days" value={String(c.recent)} />
                <Mini label="Previous 7" value={String(c.previous)} />
                <Mini label="Growth" value={`${g > 0 ? '+' : ''}${g}%`} tone={g > 0 ? C.high : g < 0 ? C.low : C.ink} />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20, gap: 14 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: C.ink },
  sub: { color: C.muted, fontSize: 14, marginTop: 2 },
  reload: { borderWidth: 1.5, borderColor: C.teal, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  reloadTxt: { color: C.teal, fontWeight: '700' },
  filters: { gap: 8, paddingRight: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  chipOn: { backgroundColor: C.teal, borderColor: C.teal },
  chipTxt: { color: C.ink, fontWeight: '600', fontSize: 12 },
  chipTxtOn: { color: '#FFFFFF' },
  err: { color: C.high, fontWeight: '600' },
  empty: { color: C.muted, textAlign: 'center', marginTop: 24 },
  card: { backgroundColor: C.card, borderRadius: 20, borderWidth: 1, borderColor: C.line, padding: 16, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { color: C.ink, fontSize: 18, fontWeight: '700', textTransform: 'capitalize' },
  pill: { paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14 },
  pillTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
  track: { height: 8, borderRadius: 4, backgroundColor: C.mint, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
  score: { color: C.muted, fontSize: 13 },
  minis: { flexDirection: 'row', gap: 8 },
  mini: { flex: 1, backgroundColor: C.bg, borderRadius: 12, padding: 10 },
  miniLabel: { color: C.muted, fontSize: 11 },
  miniValue: { color: C.ink, fontSize: 18, fontWeight: '700', marginTop: 2 },
});
