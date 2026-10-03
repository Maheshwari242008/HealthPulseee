import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, LEVEL_COLOR } from '@/theme/admin';

export type AlertRow = {
  id: string;
  title: string;      // e.g. "dengue risk is MODERATE"
  subtitle?: string;  // e.g. "Cell 17.65, 75.93 - dengue"
  severity: string;   // HIGH | MODERATE | LOW
  time?: string;      // already formatted
};

type Props = {
  alerts: AlertRow[];
  isLoading?: boolean;
  error?: string | null;
  onReload?: () => void;
  onPressAlert?: (a: AlertRow) => void;
};

const FILTERS = ['ALL', 'HIGH', 'MODERATE', 'LOW'] as const;
type Filter = (typeof FILTERS)[number];
const colorFor = (sev: string) => (LEVEL_COLOR as Record<string, string>)[sev?.toUpperCase()] ?? C.muted;

export default function AlertsView({ alerts, isLoading, error, onReload, onPressAlert }: Props) {
  const [filter, setFilter] = useState<Filter>('ALL');
  const shown = filter === 'ALL' ? alerts : alerts.filter((a) => a.severity?.toUpperCase() === filter);

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.pad}>
        <View style={s.head}>
          <View>
            <Text style={s.title}>Alerts & Reports</Text>
            <Text style={s.sub}>{alerts.length} total</Text>
          </View>
          {onReload ? (
            <Pressable onPress={onReload} style={s.reload}>
              <Text style={s.reloadTxt}>Reload</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={s.filters}>
          {FILTERS.map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[s.chip, filter === f && s.chipOn]}>
              <Text style={[s.chipTxt, filter === f && s.chipTxtOn]}>{f}</Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? <ActivityIndicator color={C.teal} /> : null}
        {error ? <Text style={s.err}>Error: {error}</Text> : null}
        {!isLoading && shown.length === 0 ? <Text style={s.empty}>No alerts for this filter.</Text> : null}

        {shown.map((a) => (
          <Pressable key={a.id} onPress={() => onPressAlert?.(a)} style={s.card}>
            <View style={[s.bar, { backgroundColor: colorFor(a.severity) }]} />
            <View style={s.body}>
              <Text style={s.cardTitle}>{a.title}</Text>
              {a.subtitle ? <Text style={s.meta}>{a.subtitle}</Text> : null}
              {a.time ? <Text style={s.time}>{a.time}</Text> : null}
            </View>
            <View style={[s.pill, { backgroundColor: colorFor(a.severity) }]}>
              <Text style={s.pillTxt}>{a.severity?.toUpperCase()}</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20, gap: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: '700', color: C.ink },
  sub: { color: C.muted, fontSize: 14, marginTop: 2 },
  reload: { borderWidth: 1.5, borderColor: C.teal, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  reloadTxt: { color: C.teal, fontWeight: '700' },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.line },
  chipOn: { backgroundColor: C.teal, borderColor: C.teal },
  chipTxt: { color: C.ink, fontWeight: '600', fontSize: 12 },
  chipTxtOn: { color: '#FFFFFF' },
  err: { color: C.high, fontWeight: '600' },
  empty: { color: C.muted, textAlign: 'center', marginTop: 24 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  bar: { width: 6, alignSelf: 'stretch' },
  body: { flex: 1, padding: 14, gap: 2 },
  cardTitle: { color: C.ink, fontSize: 15, fontWeight: '700', textTransform: 'capitalize' },
  meta: { color: C.muted, fontSize: 13 },
  time: { color: C.muted, fontSize: 12 },
  pill: { marginRight: 14, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 14 },
  pillTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
