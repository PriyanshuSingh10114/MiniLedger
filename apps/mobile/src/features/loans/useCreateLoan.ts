import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { CreateLoanInput, Loan } from '@miniledger/shared';

export function useCreateLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateLoanInput) =>
      apiRequest<Loan>('/loans', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Refresh dependent queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    },
  });
}
