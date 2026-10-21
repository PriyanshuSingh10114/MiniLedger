import { Request, Response, NextFunction } from 'express';
import { receiptsService } from './receipts.service.js';
import { AppError } from '../../middleware/error.js';

export class ReceiptsController {
  async uploadReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loanId = req.params.id;
      const file = req.file;

      if (!file) {
        throw new AppError('File is required', 400, 'FILE_REQUIRED');
      }

      const receipt = await receiptsService.attachReceipt(userId, loanId, file);
      res.status(201).json({
        success: true,
        data: receipt,
      });
    } catch (err) {
      next(err);
    }
  }

  async getReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loanId = req.params.id;

      const { filePath, contentType, originalName } = await receiptsService.getReceiptFile(
        userId,
        loanId,
      );
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${originalName}"`);
      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  }

  async deleteReceipt(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const loanId = req.params.id;

      const result = await receiptsService.deleteReceipt(userId, loanId);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const receiptsController = new ReceiptsController();
