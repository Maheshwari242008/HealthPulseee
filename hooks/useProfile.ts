import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { MOCK_PROFILE } from '@/constants/mockData';
import { queryKeys } from '@/lib/queryClient';
import { getMyProfile, updateMyProfile } from '@/services/profileService';
import type { Profile, ProfileUpdate } from '@/types/user';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve(MOCK_PROFILE) : getMyProfile()),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (patch: ProfileUpdate): Promise<Profile> => {
      if (CONFIG.USE_MOCK) {
        const current = queryClient.getQueryData<Profile>(queryKeys.profile) ?? MOCK_PROFILE;
        return { ...current, ...patch };
      }
      return updateMyProfile(patch);
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(queryKeys.profile, profile);
    },
  });
}
