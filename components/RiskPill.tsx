import { StyleSheet, Text, View } from 'react-native';
import { RISK_LEVELS } from '@/constants/riskLevels';
import type { RiskLevel } from '@/types/cell';

export function RiskPill({ level, label }: { level: RiskLevel; label?: string }) {
  const style = RISK_LEVELS[level];
  return (
    <View style={[styles.pill, { backgroundColor: style.background }]}>
      <Text style={[styles.text, { color: style.color }]}>{(label ?? style.label).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: { fontSize: 12, fontWeight: '700', letterSpacing: 0.6 },
});
