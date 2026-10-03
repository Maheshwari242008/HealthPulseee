import { useQuery } from '@tanstack/react-query';
import { getDiseases } from '@/services/diseaseService';

export function useDiseases() {
  return useQuery({
    queryKey: ['diseases'],
    queryFn: getDiseases,
    staleTime: Infinity,
  });
}
