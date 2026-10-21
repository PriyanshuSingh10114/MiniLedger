import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller.js';
import { validateBody } from '../../middleware/validate.js';
import { requestOtpSchema, verifyOtpSchema, refreshTokenSchema } from '@miniledger/shared';

export const authRouter = Router();

// Rate limiter for requesting OTP (5 per 10 minutes)
const otpRequestLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many OTP requests. Please wait a few minutes before trying again.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for verifying OTP (10 per 10 minutes)
const otpVerifyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many OTP verification attempts. Please wait a few minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

authRouter.post(
  '/request-otp',
  otpRequestLimiter,
  validateBody(requestOtpSchema),
  (req, res, next) => authController.requestOtp(req, res, next),
);

authRouter.post('/verify-otp', otpVerifyLimiter, validateBody(verifyOtpSchema), (req, res, next) =>
  authController.verifyOtp(req, res, next),
);

authRouter.post('/refresh', validateBody(refreshTokenSchema), (req, res, next) =>
  authController.refresh(req, res, next),
);

authRouter.post('/logout', (req, res, next) => authController.logout(req, res, next));
