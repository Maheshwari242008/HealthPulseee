import { useMemo } from 'react';
import { CONFIG } from '@/constants/config';
import { useAreas } from '@/hooks/useArea';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import type { Area } from '@/types/cell';

function nearest(areas: Area[], lat: number, lon: number): Area | null {
  let best: Area | null = null;
  let bestDist = Infinity;
  for (const a of areas) {
    const d = (a.cell_lat - lat) ** 2 + (a.cell_lon - lon) ** 2;
    if (d < bestDist) {
      best = a;
      bestDist = d;
    }
  }
  return best;
}

/** The user's chosen area (profile.home_area_id), or the demo default if none chosen yet. */
export function useHomeArea() {
  const profileQuery = useProfile();
  const areasQuery = useAreas();
  const update = useUpdateProfile();

  const areas = areasQuery.data;
  const homeId = profileQuery.data?.home_area_id ?? null;

  const area = useMemo(() => {
    if (!areas || areas.length === 0) return null;
    const chosen = homeId != null ? areas.find((a) => a.id === homeId) : undefined;
    return chosen ?? nearest(areas, CONFIG.DEFAULT_AREA_LAT, CONFIG.DEFAULT_AREA_LON);
  }, [areas, homeId]);

  return {
    area,
    areas: areas ?? [],
    setArea: (id: number) => update.mutate({ home_area_id: id }),
    isSaving: update.isPending,
    isLoading: areasQuery.isLoading,
    error: areasQuery.error,
    refetch: () => areasQuery.refetch(),
  };
}
