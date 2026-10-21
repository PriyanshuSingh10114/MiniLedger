import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import {
  rupeesToPaise,
  paiseToRupees,
  calculateIsOverdue,
  LOAN_STATUS,
  LoanStatus,
  LoanQueryParams,
  toISODateString,
  getTodayDateString,
} from '@miniledger/shared';

export class LoansService {
  /**
   * Helper to format a Prisma loan record into domain model.
   */
  private formatLoan(loan: any) {
    const amountPaise = Number(loan.amount);
    const repaidPaise = loan.repayments
      ? loan.repayments.reduce((acc: number, r: any) => acc + Number(r.amount), 0)
      : loan.status === LOAN_STATUS.REPAID
        ? amountPaise
        : 0;
    const outstandingPaise = Math.max(0, amountPaise - repaidPaise);

    const dueDateStr =
      loan.dueDate instanceof Date
        ? loan.dueDate.toISOString().slice(0, 10)
        : String(loan.dueDate).slice(0, 10);

    const isOverdue = calculateIsOverdue(dueDateStr, loan.status as LoanStatus);

    return {
      id: loan.id,
      userId: loan.userId,
      friendName: loan.friendName,
      amount: amountPaise,
      amountInRupees: paiseToRupees(amountPaise),
      dueDate: dueDateStr,
      status: loan.status as LoanStatus,
      note: loan.note,
      isOverdue,
      outstandingAmount: outstandingPaise,
      repaidAmount: repaidPaise,
      createdAt: loan.createdAt.toISOString(),
      updatedAt: loan.updatedAt.toISOString(),
      repayments: loan.repayments?.map((r: any) => ({
        id: r.id,
        loanId: r.loanId,
        amount: Number(r.amount),
        repaidAt: r.repaidAt.toISOString(),
        createdAt: r.createdAt.toISOString(),
        idempotencyKey: r.idempotencyKey,
      })),
      receipt: loan.receipt
        ? {
            id: loan.receipt.id,
            loanId: loan.receipt.loanId,
            originalName: loan.receipt.originalName,
            contentType: loan.receipt.contentType,
            sizeBytes: loan.receipt.sizeBytes,
            createdAt: loan.receipt.createdAt.toISOString(),
          }
        : null,
    };
  }

  /**
   * Creates a new loan for authenticated user.
   */
  async createLoan(
    userId: string,
    data: {
      friendName: string;
      amount: number | string;
      dueDate: string;
      note?: string;
    },
  ) {
    const amountPaise = rupeesToPaise(data.amount);

    // Validate due date
    const dueDateObj = new Date(data.dueDate);
    if (isNaN(dueDateObj.getTime())) {
      throw new AppError('Invalid due date format', 400, 'INVALID_DATE');
    }

    const todayStr = getTodayDateString();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    const tenYearsAhead = new Date();
    tenYearsAhead.setFullYear(tenYearsAhead.getFullYear() + 10);

    if (dueDateObj < tenYearsAgo || dueDateObj > tenYearsAhead) {
      throw new AppError(
        'Due date must be within 10 years of current date',
        400,
        'INVALID_DATE_RANGE',
      );
    }

    // Persist to database
    const loan = await prisma.loan.create({
      data: {
        userId,
        friendName: data.friendName.trim(),
        amount: BigInt(amountPaise),
        dueDate: dueDateObj,
        status: LOAN_STATUS.OUTSTANDING,
        note: data.note?.trim() || null,
      },
      include: {
        repayments: true,
        receipt: true,
      },
    });

    return this.formatLoan(loan);
  }

  /**
   * Lists loans for authenticated user with pagination, search, status, and overdue filtering.
   */
  async getLoans(userId: string, query: LoanQueryParams) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.search) {
      where.friendName = {
        contains: query.search.trim(),
        mode: 'insensitive',
      };
    }

    const todayStr = getTodayDateString();
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    if (query.isOverdue === true) {
      where.status = LOAN_STATUS.OUTSTANDING;
      where.dueDate = {
        lt: todayDate,
      };
    } else if (query.isOverdue === false) {
      where.OR = [
        { status: LOAN_STATUS.REPAID },
        {
          status: LOAN_STATUS.OUTSTANDING,
          dueDate: { gte: todayDate },
        },
      ];
    }

    const orderBy: any = {};
    const sortField = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder || 'desc';

    orderBy[sortField] = sortOrder;

    const [loans, total] = await Promise.all([
      prisma.loan.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          repayments: true,
          receipt: true,
        },
      }),
      prisma.loan.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: loans.map((l) => this.formatLoan(l)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Retrieves single loan by ID enforcing user ownership.
   */
  async getLoanById(userId: string, loanId: string) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId, // Strictly scoped to user
      },
      include: {
        repayments: {
          orderBy: { repaidAt: 'desc' },
        },
        receipt: true,
      },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404, 'NOT_FOUND');
    }

    return this.formatLoan(loan);
  }
}

export const loansService = new LoansService();
