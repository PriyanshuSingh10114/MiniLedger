import { prisma } from '../../lib/prisma.js';
import {
  LOAN_STATUS,
  LoanStatus,
  paiseToRupees,
  calculateIsOverdue,
  getTodayDateString,
} from '@miniledger/shared';

export class DashboardService {
  /**
   * Calculates financial dashboard summary from persisted database records.
   */
  async getSummary(userId: string) {
    const todayStr = getTodayDateString();
    const todayDate = new Date(`${todayStr}T00:00:00.000Z`);

    // Fetch aggregates in parallel
    const [allLoans, recentLoansData] = await Promise.all([
      prisma.loan.findMany({
        where: { userId },
        include: {
          repayments: true,
          receipt: true,
        },
      }),
      prisma.loan.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          repayments: true,
          receipt: true,
        },
      }),
    ]);

    let totalLentPaise = 0;
    let totalRepaidPaise = 0;
    let totalOverduePaise = 0;
    let activeLoansCount = 0;
    let overdueLoansCount = 0;
    let repaidLoansCount = 0;

    for (const loan of allLoans) {
      const amountPaise = Number(loan.amount);
      totalLentPaise += amountPaise;

      const loanRepaidPaise = (loan.repayments as any[]).reduce(
        (sum: number, r: any) => sum + Number(r.amount),
        0,
      );
      totalRepaidPaise += loanRepaidPaise;

      const outstandingPaise = Math.max(0, amountPaise - loanRepaidPaise);

      const dueDateStr =
        loan.dueDate instanceof Date
          ? loan.dueDate.toISOString().slice(0, 10)
          : String(loan.dueDate).slice(0, 10);

      const isOverdue = calculateIsOverdue(dueDateStr, loan.status as LoanStatus);

      if (loan.status === LOAN_STATUS.REPAID) {
        repaidLoansCount++;
      } else {
        activeLoansCount++;
        if (isOverdue) {
          overdueLoansCount++;
          totalOverduePaise += outstandingPaise;
        }
      }
    }

    const totalOutstandingPaise = Math.max(0, totalLentPaise - totalRepaidPaise);

    const recentLoans = (recentLoansData as any[]).map((loan: any) => {
      const amountPaise = Number(loan.amount);
      const repaidPaise = (loan.repayments as any[]).reduce(
        (sum: number, r: any) => sum + Number(r.amount),
        0,
      );
      const outstandingPaise = Math.max(0, amountPaise - repaidPaise);
      const dueDateStr =
        loan.dueDate instanceof Date
          ? loan.dueDate.toISOString().slice(0, 10)
          : String(loan.dueDate).slice(0, 10);

      return {
        id: loan.id,
        userId: loan.userId,
        friendName: loan.friendName,
        amount: amountPaise,
        amountInRupees: paiseToRupees(amountPaise),
        dueDate: dueDateStr,
        status: loan.status as LoanStatus,
        note: loan.note,
        isOverdue: calculateIsOverdue(dueDateStr, loan.status as LoanStatus),
        outstandingAmount: outstandingPaise,
        repaidAmount: repaidPaise,
        createdAt: loan.createdAt.toISOString(),
        updatedAt: loan.updatedAt.toISOString(),
      };
    });

    return {
      totalLentPaise,
      totalRepaidPaise,
      totalOutstandingPaise,
      totalOverduePaise,
      activeLoansCount,
      overdueLoansCount,
      repaidLoansCount,
      totalLoansCount: allLoans.length,
      recentLoans,
    };
  }
}

export const dashboardService = new DashboardService();
