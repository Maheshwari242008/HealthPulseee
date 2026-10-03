import { useQuery } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { mockCells } from '@/constants/mockData';
import { queryKeys } from '@/lib/queryClient';
import { getCells } from '@/services/cellsService';

/** Risk cells for the map and home screen. Pass null for all diseases. */
export function useCells(disease: string | null) {
  return useQuery({
    queryKey: queryKeys.cells(disease, null),
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve(mockCells(disease)) : getCells(disease)),
  });
}
