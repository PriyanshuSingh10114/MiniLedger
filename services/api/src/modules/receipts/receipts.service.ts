import { prisma } from '../../lib/prisma.js';
import { storageService, StoredFile } from '../../lib/storage.js';
import { AppError } from '../../middleware/error.js';

export class ReceiptsService {
  /**
   * Attaches a receipt image or PDF to a loan owned by authenticated user.
   */
  async attachReceipt(userId: string, loanId: string, file: Express.Multer.File) {
    // 1. Verify loan exists and belongs to authenticated user
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
      include: { receipt: true },
    });

    if (!loan) {
      throw new AppError('Loan not found', 404, 'NOT_FOUND');
    }

    // 2. If an existing receipt exists, remove it first
    if (loan.receipt) {
      await storageService.deleteFile(loan.receipt.storageKey).catch(() => {});
      await prisma.receipt.delete({ where: { id: loan.receipt.id } });
    }

    // 3. Save new file to private storage
    const stored: StoredFile = await storageService.saveFile(
      file.buffer,
      file.originalname,
      file.mimetype,
    );

    // 4. Record in database
    const receipt = await prisma.receipt.create({
      data: {
        loanId,
        storageKey: stored.storageKey,
        originalName: stored.originalName,
        contentType: stored.contentType,
        sizeBytes: stored.sizeBytes,
      },
    });

    return {
      id: receipt.id,
      loanId: receipt.loanId,
      originalName: receipt.originalName,
      contentType: receipt.contentType,
      sizeBytes: receipt.sizeBytes,
      createdAt: receipt.createdAt.toISOString(),
    };
  }

  /**
   * Retrieves stored file path for authenticated viewing.
   */
  async getReceiptFile(userId: string, loanId: string) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
      include: { receipt: true },
    });

    if (!loan || !loan.receipt) {
      throw new AppError('Receipt not found', 404, 'NOT_FOUND');
    }

    const filePath = storageService.getFilePath(loan.receipt.storageKey);

    return {
      filePath,
      contentType: loan.receipt.contentType,
      originalName: loan.receipt.originalName,
    };
  }

  /**
   * Removes receipt from a loan.
   */
  async deleteReceipt(userId: string, loanId: string) {
    const loan = await prisma.loan.findFirst({
      where: {
        id: loanId,
        userId,
      },
      include: { receipt: true },
    });

    if (!loan || !loan.receipt) {
      throw new AppError('Receipt not found', 404, 'NOT_FOUND');
    }

    await storageService.deleteFile(loan.receipt.storageKey).catch(() => {});
    await prisma.receipt.delete({ where: { id: loan.receipt.id } });

    return { message: 'Receipt deleted successfully' };
  }
}

export const receiptsService = new ReceiptsService();
