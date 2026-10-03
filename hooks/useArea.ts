import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { MOCK_AREAS } from '@/constants/mockData';
import { getAreas } from '@/services/areaService';

export function useAreas() {
  return useQuery({
    queryKey: ['areas'],
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve(MOCK_AREAS) : getAreas()),
    staleTime: Infinity, // the grid never changes while the app is open
  });
}
