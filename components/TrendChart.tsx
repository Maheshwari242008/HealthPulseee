import { StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { shortDate } from '@/lib/date';
import type { TrendPoint } from '@/types/cell';

const H = 120;

/** Simple daily-cases bar chart. Shows a privacy message when the cell is suppressed (empty data). */
export function TrendChart({ data, width = 300 }: { data: TrendPoint[]; width?: number }) {
  if (data.length === 0) {
    return (
      <Text style={styles.empty}>
        Not enough reported cases to show a trend. Counts under 3 are hidden to protect privacy.
      </Text>
    );
  }
  const max = Math.max(1, ...data.map((d) => d.cases));
  const gap = 4;
  const barW = Math.max(4, (width - gap * (data.length - 1)) / data.length);

  return (
    <View style={{ gap: 6 }}>
      <Svg width={width} height={H}>
        {data.map((d, i) => {
          const h = Math.max(2, (d.cases / max) * (H - 8));
          return (
            <Rect
              key={d.stat_date}
              x={i * (barW + gap)}
              y={H - h}
              width={barW}
              height={h}
              rx={3}
              fill={theme.colors.primary}
              opacity={0.35 + 0.65 * (d.cases / max)}
            />
          );
        })}
      </Svg>
      <View style={styles.axis}>
        <Text style={styles.axisText}>{shortDate(data[0].stat_date)}</Text>
        <Text style={styles.axisText}>Peak {max}/day</Text>
        <Text style={styles.axisText}>{shortDate(data[data.length - 1].stat_date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { fontSize: 14, lineHeight: 20, color: theme.colors.muted },
  axis: { flexDirection: 'row', justifyContent: 'space-between' },
  axisText: { fontSize: 12, color: theme.colors.muted },
});
