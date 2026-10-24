import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { Loan, LoanQueryParams } from '@miniledger/shared';

export function useLoans(params: Partial<LoanQueryParams> = {}) {
  const queryParams = new URLSearchParams();

  if (params.status && params.status !== 'ALL') {
    queryParams.append('status', params.status);
  }
  if (params.isOverdue !== undefined) {
    queryParams.append('isOverdue', String(params.isOverdue));
  }
  if (params.search) {
    queryParams.append('search', params.search);
  }
  if (params.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params.sortOrder) {
    queryParams.append('sortOrder', params.sortOrder);
  }
  if (params.page) {
    queryParams.append('page', String(params.page));
  }
  if (params.limit) {
    queryParams.append('limit', String(params.limit));
  }

  const queryString = queryParams.toString();
  const endpoint = `/loans${queryString ? `?${queryString}` : ''}`;

  return useQuery({
    queryKey: ['loans', params],
    queryFn: () => apiRequest<Loan[]>(endpoint),
  });
}
