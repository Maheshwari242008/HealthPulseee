import { useEffect, useMemo, useState } from 'react';
import { Button, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { RISK_LEVELS } from '@/constants/riskLevels';
import { getAdminCells } from '@/services/adminService';
import type { AdminCell } from '@/types/cell';

const DISEASES = ['all', 'dengue', 'malaria', 'chikungunya', 'typhoid', 'cholera', 'diarrhoea'];

// Plain list of at-risk areas. The UI teammate can draw the 6x6 grid from the same `cells` array.
export default function RiskMap() {
  const router = useRouter();
  const [cells, setCells] = useState<AdminCell[]>([]);
  const [disease, setDisease] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdminCells()
      .then(setCells)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load map'))
      .finally(() => setLoading(false));
  }, []);

  const shown = useMemo(
    () =>
      cells
        .filter((c) => c.level !== 'NONE')
        .filter((c) => disease === 'all' || c.disease === disease),
    [cells, disease],
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 48 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
        City Risk Map ({shown.length} areas at risk)
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {DISEASES.map((d) => (
          <Button key={d} title={d === disease ? `[${d}]` : d} onPress={() => setDisease(d)} />
        ))}
      </View>
      {loading && <Text>Loading...</Text>}
      {error ? <Text>Error: {error}</Text> : null}
      {shown.map((c) => (
        <Pressable
          key={`${c.area_id}-${c.disease}`}
          onPress={() => router.push(`/(admin)/ward/${c.area_id}` as Href)}
          style={{ borderWidth: 1, padding: 10, marginBottom: 8 }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            {c.area_name ?? `Area ${c.area_id}`} - {c.disease}
          </Text>
          <Text style={{ color: RISK_LEVELS[c.level].color }}>
            Risk: {RISK_LEVELS[c.level].label} (score {c.score?.toFixed(2) ?? '-'})
          </Text>
          <Text>
            Last 7 days: {c.recent} | Previous 7: {c.prior} | Growth: {c.growth_pct}%
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
