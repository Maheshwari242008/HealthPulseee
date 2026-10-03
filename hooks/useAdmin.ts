import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CONFIG } from '@/constants/config';
import { mockCells } from '@/constants/mockData';
import {
  createAlert,
  createLab,
  deleteAlert,
  expireAlert,
  getAdminDashboard,
  getAllAlerts,
  getLabs,
  setLabApproval,
} from '@/services/adminService';
import { getMyReports } from '@/services/reportsService';
import type { AdminAlert, Lab } from '@/types/admin';
import type { AdminCell } from '@/types/cell';
import type { LabReportWithNames } from '@/types/report';

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: async (): Promise<AdminCell[]> => {
      if (CONFIG.USE_MOCK) {
        return mockCells(null).map((c) => ({
          area_id: c.area_id,
          area_name: null,
          cell_lat: c.cell_lat,
          cell_lon: c.cell_lon,
          disease: c.disease,
          level: c.level,
          score: c.score,
          recent: c.recent ?? 0,
          prior: 0,
          growth_pct: c.growth_pct ?? 0,
          neighbor_cases: c.neighbor_cases ?? 0,
          neighbors_affected: c.neighbors_affected ?? 0,
        }));
      }
      return getAdminDashboard();
    },
  });
}

export function useAdminAlerts() {
  return useQuery({
    queryKey: ['admin', 'alerts'],
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve([] as AdminAlert[]) : getAllAlerts()),
  });
}

export function useLabs() {
  return useQuery({
    queryKey: ['admin', 'labs'],
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve([] as Lab[]) : getLabs()),
  });
}

export function useAllReports(limit = 200) {
  return useQuery({
    queryKey: ['admin', 'reports', limit],
    queryFn: () => (CONFIG.USE_MOCK ? Promise.resolve([] as LabReportWithNames[]) : getMyReports(limit)),
  });
}

function useInvalidateAdmin() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['admin'] });
    qc.invalidateQueries({ queryKey: ['alerts'] });
  };
}

export function useCreateAlert() {
  const done = useInvalidateAdmin();
  return useMutation({ mutationFn: createAlert, onSuccess: done });
}
export function useExpireAlert() {
  const done = useInvalidateAdmin();
  return useMutation({ mutationFn: expireAlert, onSuccess: done });
}
export function useDeleteAlert() {
  const done = useInvalidateAdmin();
  return useMutation({ mutationFn: deleteAlert, onSuccess: done });
}
export function useSetLabApproval() {
  const done = useInvalidateAdmin();
  return useMutation({
    mutationFn: (v: { labId: string; approved: boolean }) => setLabApproval(v.labId, v.approved),
    onSuccess: done,
  });
}
export function useCreateLab() {
  const done = useInvalidateAdmin();
  return useMutation({ mutationFn: (name: string) => createLab(name), onSuccess: done });
}
