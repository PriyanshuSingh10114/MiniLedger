import { Request, Response, NextFunction } from 'express';
import { loansService } from './loans.service.js';

export class LoansController {
  async createLoan(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loan = await loansService.createLoan(userId, req.body);
      res.status(201).json({
        success: true,
        data: loan,
      });
    } catch (err) {
      next(err);
    }
  }

  async getLoans(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await loansService.getLoans(userId, req.query as any);
      res.status(200).json({
        success: true,
        data: result.items,
        meta: {
          pagination: result.pagination,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  async getLoanById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loanId = req.params.id;
      const loan = await loansService.getLoanById(userId, loanId);
      res.status(200).json({
        success: true,
        data: loan,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const loansController = new LoansController();
