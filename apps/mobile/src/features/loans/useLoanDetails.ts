import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { Loan } from '@miniledger/shared';

export function useLoanDetails(loanId: string) {
  return useQuery({
    queryKey: ['loan', loanId],
    queryFn: () => apiRequest<Loan>(`/loans/${loanId}`),
    enabled: !!loanId,
  });
}
