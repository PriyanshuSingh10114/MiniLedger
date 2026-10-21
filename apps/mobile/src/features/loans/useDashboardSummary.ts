import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api.js';
import { DashboardSummary } from '@miniledger/shared';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => apiRequest<DashboardSummary>('/dashboard/summary'),
  });
}
