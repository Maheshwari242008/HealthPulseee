import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, DISEASE, LEVEL_COLOR } from '@/theme/admin';

export type Activity = {
  dates: string[];
  series: { disease: string; values: number[] }[];
};

export type LatestAlert = { id: string; title: string; area: string; severity: string };

type Props = {
  area?: string;
  isLoading?: boolean;
  error?: string | null;
  activeAlerts: number;
  highAlerts: number;
  affectedRegions: number;
  reports: number;
  cases: number;
  pendingActions: number | null;
  activity: Activity | null;
  latestAlerts?: LatestAlert[];
  onReload: () => void;
};

const colorFor = (sev: string) => (LEVEL_COLOR as Record<string, string>)[sev?.toUpperCase()] ?? C.muted;

function Stat({ label, value, note, tone }: { label: string; value: string | number; note?: string; tone?: string }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, tone ? { color: tone } : null]}>{value}</Text>
      {note ? <Text style={s.statNote}>{note}</Text> : null}
    </View>
  );
}

export default function DashboardView(p: Props) {
  const a = p.activity;
  const totals = a ? a.dates.map((_, i) => a.series.reduce((t, x) => t + (x.values[i] ?? 0), 0)) : [];
  const max = Math.max(1, ...totals);
  const H = 130;

  return (
    <SafeAreaView style={s.screen} edges={['top']}>
      <ScrollView contentContainerStyle={s.pad}>
        <View style={s.head}>
          <View>
            <Text style={s.title}>Dashboard</Text>
            <Text style={s.sub}>{p.area ?? 'Solapur City, Maharashtra'}</Text>
          </View>
          <Pressable onPress={p.onReload} style={s.reload}>
            <Text style={s.reloadTxt}>Reload</Text>
          </Pressable>
        </View>

        {p.isLoading ? <ActivityIndicator color={C.teal} /> : null}
        {p.error ? <Text style={s.err}>Error: {p.error}</Text> : null}

        <View style={s.grid}>
          <Stat label="Active alerts" value={p.activeAlerts} note={`${p.highAlerts} high`} tone={p.highAlerts > 0 ? C.high : C.teal} />
          <Stat label="Affected regions" value={p.affectedRegions} />
          <Stat label="Reports (7 days)" value={p.reports} note={`${p.cases} cases`} />
          <Stat label="Pending actions" value={p.pendingActions ?? '-'} />
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Disease activity, last 7 days</Text>
          {a && a.dates.length > 0 ? (
            <>
              <View style={[s.bars, { height: H + 20 }]}>
                {a.dates.map((d, i) => (
                  <View key={d} style={s.col}>
                    <View style={{ height: H, width: '70%', justifyContent: 'flex-end' }}>
                      {a.series.map((x, k) => {
                        const v = x.values[i] ?? 0;
                        return v > 0 ? (
                          <View key={x.disease} style={{ height: (v / max) * H, backgroundColor: DISEASE[k % DISEASE.length] }} />
                        ) : null;
                      })}
                    </View>
                    <Text style={s.day}>{d.slice(8)}</Text>
                  </View>
                ))}
              </View>
              <View style={s.legend}>
                {a.series.map((x, k) => (
                  <View key={x.disease} style={s.leg}>
                    <View style={[s.dot, { backgroundColor: DISEASE[k % DISEASE.length] }]} />
                    <Text style={s.legTxt}>{x.disease}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text style={s.sub}>No reports in the last 7 days.</Text>
          )}
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Latest alerts</Text>
          {(p.latestAlerts ?? []).length === 0 ? <Text style={s.sub}>No alerts yet.</Text> : null}
          {(p.latestAlerts ?? []).map((x) => (
            <View key={x.id} style={s.alertRow}>
              <View style={[s.alertBar, { backgroundColor: colorFor(x.severity) }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.alertTitle}>{x.title}</Text>
                <Text style={s.sub}>{x.area}</Text>
              </View>
              <View style={[s.pill, { backgroundColor: colorFor(x.severity) }]}>
                <Text style={s.pillTxt}>{x.severity.toUpperCase()}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  pad: { padding: 20, gap: 16 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '700', color: C.ink },
  sub: { color: C.muted, fontSize: 14, marginTop: 2 },
  err: { color: C.high, fontWeight: '600' },
  reload: { borderWidth: 1.5, borderColor: C.teal, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16 },
  reloadTxt: { color: C.teal, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  stat: { width: '48%', flexGrow: 1, backgroundColor: C.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line },
  statLabel: { color: C.muted, fontSize: 13 },
  statValue: { color: C.teal, fontSize: 30, fontWeight: '700', marginTop: 4 },
  statNote: { color: C.muted, fontSize: 13, marginTop: 2 },
  card: { backgroundColor: C.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: C.line, gap: 12 },
  cardTitle: { color: C.ink, fontSize: 16, fontWeight: '700' },
  bars: { flexDirection: 'row', gap: 8, alignItems: 'flex-end' },
  col: { flex: 1, alignItems: 'center', gap: 6 },
  day: { color: C.muted, fontSize: 11 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  leg: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legTxt: { color: C.ink, fontSize: 12, textTransform: 'capitalize' },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  alertBar: { width: 5, alignSelf: 'stretch', borderRadius: 3 },
  alertTitle: { color: C.ink, fontWeight: '700', fontSize: 15 },
  pill: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 14 },
  pillTxt: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});
