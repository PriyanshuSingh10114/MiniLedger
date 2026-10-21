import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api.js';

export function useRepayLoan(loanId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (idempotencyKey?: string) =>
      apiRequest<{ loan: any; repayment: any }>(`/loans/${loanId}/repayments`, {
        method: 'POST',
        body: JSON.stringify({ idempotencyKey }),
      }),
    onSuccess: () => {
      // Invalidate loan details, list, and dashboard
      queryClient.invalidateQueries({ queryKey: ['loan', loanId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });
}
