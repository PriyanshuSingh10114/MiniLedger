import { prisma } from '../../lib/prisma.js';
import { AppError } from '../../middleware/error.js';
import { LOAN_STATUS, paiseToRupees, calculateIsOverdue, LoanStatus } from '@miniledger/shared';

export class RepaymentsService {
  /**
   * Records a full repayment in an atomic PostgreSQL transaction.
   * Enforces user ownership, prevents race conditions, and prevents duplicate repayments.
   */
  async recordFullRepayment(userId: string, loanId: string, idempotencyKey?: string) {
    return prisma.$transaction(async (tx: any) => {
      // 1. If idempotency key is supplied, check if already recorded
      if (idempotencyKey) {
        const existingRepayment = await tx.repayment.findUnique({
          where: { idempotencyKey },
          include: { loan: true },
        });

        if (existingRepayment) {
          if (existingRepayment.loan.userId !== userId) {
            throw new AppError('Loan not found', 404, 'NOT_FOUND');
          }
          return {
            repayment: {
              id: existingRepayment.id,
              loanId: existingRepayment.loanId,
              amount: Number(existingRepayment.amount),
              repaidAt: existingRepayment.repaidAt.toISOString(),
              createdAt: existingRepayment.createdAt.toISOString(),
              idempotencyKey: existingRepayment.idempotencyKey,
            },
            loan: {
              id: existingRepayment.loan.id,
              status: existingRepayment.loan.status,
              outstandingAmount: 0,
            },
            isIdempotentReplay: true,
          };
        }
      }

      // 2. Fetch loan and lock row for update inside transaction
      // Using queryRaw with FOR UPDATE ensures concurrent requests serialize and cannot double-repay
      const lockedLoans = await tx.$queryRaw<
        Array<{
          id: string;
          userId: string;
          status: string;
          amount: bigint;
        }>
      >`SELECT id, "userId", status, amount FROM loans WHERE id = ${loanId}::uuid AND "userId" = ${userId}::uuid FOR UPDATE`;

      if (!lockedLoans || lockedLoans.length === 0) {
        throw new AppError('Loan not found', 404, 'NOT_FOUND');
      }

      const loan = lockedLoans[0];

      if (loan.status === LOAN_STATUS.REPAID) {
        throw new AppError('Loan is already fully repaid', 400, 'ALREADY_REPAID');
      }

      // Calculate any previous partial repayments
      const previousRepayments = await tx.repayment.aggregate({
        where: { loanId },
        _sum: { amount: true },
      });

      const totalRepaidSoFar = previousRepayments._sum.amount || 0n;
      const remainingBalance = loan.amount - totalRepaidSoFar;

      if (remainingBalance <= 0n) {
        // Mark repaid if somehow status was not updated
        await tx.loan.update({
          where: { id: loanId },
          data: { status: LOAN_STATUS.REPAID },
        });
        throw new AppError('Loan has no outstanding balance', 400, 'ALREADY_REPAID');
      }

      // 3. Create repayment record for the remaining balance
      const repayment = await tx.repayment.create({
        data: {
          loanId,
          amount: remainingBalance,
          idempotencyKey: idempotencyKey || null,
        },
      });

      // 4. Atomically update loan status to REPAID
      const updatedLoan = await tx.loan.update({
        where: { id: loanId },
        data: {
          status: LOAN_STATUS.REPAID,
        },
        include: {
          repayments: true,
          receipt: true,
        },
      });

      const amountPaise = Number(updatedLoan.amount);
      const dueDateStr =
        updatedLoan.dueDate instanceof Date
          ? updatedLoan.dueDate.toISOString().slice(0, 10)
          : String(updatedLoan.dueDate).slice(0, 10);

      return {
        repayment: {
          id: repayment.id,
          loanId: repayment.loanId,
          amount: Number(repayment.amount),
          repaidAt: repayment.repaidAt.toISOString(),
          createdAt: repayment.createdAt.toISOString(),
          idempotencyKey: repayment.idempotencyKey,
        },
        loan: {
          id: updatedLoan.id,
          userId: updatedLoan.userId,
          friendName: updatedLoan.friendName,
          amount: amountPaise,
          amountInRupees: paiseToRupees(amountPaise),
          dueDate: dueDateStr,
          status: updatedLoan.status as LoanStatus,
          note: updatedLoan.note,
          isOverdue: false, // Repaid loans are never overdue
          outstandingAmount: 0,
          repaidAmount: amountPaise,
          createdAt: updatedLoan.createdAt.toISOString(),
          updatedAt: updatedLoan.updatedAt.toISOString(),
        },
        isIdempotentReplay: false,
      };
    });
  }

  /**
   * Retrieves repayment history for a loan belonging to authenticated user.
   */
  async getRepaymentsForLoan(userId: string, loanId: string) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404, 'NOT_FOUND');
    }

    const repayments = await prisma.repayment.findMany({
      where: { loanId },
      orderBy: { repaidAt: 'desc' },
    });

    return (repayments as any[]).map((r: any) => ({
      id: r.id,
      loanId: r.loanId,
      amount: Number(r.amount),
      repaidAt: r.repaidAt.toISOString(),
      createdAt: r.createdAt.toISOString(),
      idempotencyKey: r.idempotencyKey,
    }));
  }
}

export const repaymentsService = new RepaymentsService();
