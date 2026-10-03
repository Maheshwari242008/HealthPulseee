import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { queryKeys } from '@/lib/queryClient';
import { getTrend } from '@/services/trendService';
import type { TrendPoint } from '@/types/cell';

function mockTrend(days: number): TrendPoint[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - 1 - i) * 86_400_000);
    return { stat_date: d.toISOString().slice(0, 10), cases: Math.max(0, Math.round(1 + i * 0.35 + (i % 3))) };
  });
}

export function useTrend(areaId: number | null, disease: string | null, days: number = CONFIG.DEFAULT_TREND_DAYS) {
  return useQuery({
    queryKey: queryKeys.trend(areaId ?? -1, disease ?? '', days),
    queryFn: () =>
      CONFIG.USE_MOCK ? Promise.resolve(mockTrend(days)) : getTrend(areaId as number, disease as string, days),
    enabled: areaId != null && disease != null,
  });
}
