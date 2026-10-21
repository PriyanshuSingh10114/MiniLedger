import { Router } from 'express';
import { loansController } from './loans.controller.js';
import { repaymentsController } from '../repayments/repayments.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { validateBody, validateQuery } from '../../middleware/validate.js';
import { createLoanSchema, loanQuerySchema, repayLoanSchema } from '@miniledger/shared';

export const loansRouter = Router();

// All loan routes require authentication
loansRouter.use(requireAuth);

loansRouter.post('/', validateBody(createLoanSchema), (req, res, next) =>
  loansController.createLoan(req, res, next),
);

loansRouter.get('/', validateQuery(loanQuerySchema), (req, res, next) =>
  loansController.getLoans(req, res, next),
);

loansRouter.get('/:id', (req, res, next) => loansController.getLoanById(req, res, next));

loansRouter.post('/:id/repayments', validateBody(repayLoanSchema), (req, res, next) =>
  repaymentsController.recordRepayment(req, res, next),
);

loansRouter.get('/:id/repayments', (req, res, next) =>
  repaymentsController.getRepayments(req, res, next),
);
