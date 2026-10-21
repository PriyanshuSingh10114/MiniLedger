import { LoanStatus } from './constants.js';

export interface User {
  id: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Repayment {
  id: string;
  loanId: string;
  amount: number; // in paise
  repaidAt: string;
  createdAt: string;
  idempotencyKey?: string | null;
}

export interface ReceiptMetadata {
  id: string;
  loanId: string;
  originalName: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl?: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  friendName: string;
  amount: number; // original amount in paise
  amountInRupees: number;
  dueDate: string; // YYYY-MM-DD
  status: LoanStatus;
  note?: string | null;
  isOverdue: boolean;
  outstandingAmount: number; // in paise
  repaidAmount: number; // in paise
  createdAt: string;
  updatedAt: string;
  repayments?: Repayment[];
  receipt?: ReceiptMetadata | null;
}

export interface DashboardSummary {
  totalLentPaise: number;
  totalRepaidPaise: number;
  totalOutstandingPaise: number;
  totalOverduePaise: number;
  activeLoansCount: number;
  overdueLoansCount: number;
  repaidLoansCount: number;
  totalLoansCount: number;
  recentLoans: Loan[];
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[] | unknown;
  };
}
