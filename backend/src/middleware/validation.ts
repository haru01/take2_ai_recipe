import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { createError } from './errorHandler';

export const recipeGenerationLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10'),
  message: {
    success: false,
    error: {
      message: 'レシピ生成のリクエストが多すぎます。しばらく待ってから再試行してください。',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const feedbackLimiter = rateLimit({
  windowMs: 60000,
  max: 5,
  message: {
    success: false,
    error: {
      message: 'フィードバックの送信が多すぎます。1分後に再試行してください。',
      code: 'FEEDBACK_RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const validateContentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return next(createError('Content-Type must be application/json', 400));
  }
  next();
};

export const validateRequestSize = (req: Request, res: Response, next: NextFunction) => {
  const maxSize = 1024 * 1024;
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return next(createError('リクエストサイズが大きすぎます', 413));
  }
  
  next();
};