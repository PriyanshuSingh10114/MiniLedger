import { Router } from 'express';
import multer from 'multer';
import { receiptsController } from './receipts.controller.js';
import { requireAuth } from '../../middleware/auth.js';
import { MAX_FILE_SIZE_BYTES } from '../../lib/storage.js';

export const receiptsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
});

receiptsRouter.use(requireAuth);

receiptsRouter.post('/:id/receipt', upload.single('receipt'), (req, res, next) =>
  receiptsController.uploadReceipt(req, res, next),
);

receiptsRouter.get('/:id/receipt', (req, res, next) =>
  receiptsController.getReceipt(req, res, next),
);

receiptsRouter.delete('/:id/receipt', (req, res, next) =>
  receiptsController.deleteReceipt(req, res, next),
);
