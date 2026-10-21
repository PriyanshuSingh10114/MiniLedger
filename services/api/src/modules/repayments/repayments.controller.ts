import { Request, Response, NextFunction } from 'express';
import { repaymentsService } from './repayments.service.js';

export class RepaymentsController {
  async recordRepayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loanId = req.params.id;
      const { idempotencyKey } = req.body || {};

      const result = await repaymentsService.recordFullRepayment(userId, loanId, idempotencyKey);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  async getRepayments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loanId = req.params.id;

      const repayments = await repaymentsService.getRepaymentsForLoan(userId, loanId);
      res.status(200).json({
        success: true,
        data: repayments,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const repaymentsController = new RepaymentsController();
