import { Request, Response, NextFunction } from 'express';
import { Feedback } from '../models/Feedback';
import { Feedback as FeedbackType, ApiResponse } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class FeedbackController {
  submitFeedback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const feedbackData: FeedbackType = req.body;
      
      if (!this.validateFeedbackInput(feedbackData)) {
        throw createError('無効なフィードバックデータです', 400);
      }

      logger.info('Feedback submission received', { 
        recipeId: feedbackData.recipeId,
        reasons: feedbackData.reasons,
        futureInterest: feedbackData.futureInterest 
      });

      const feedback = new Feedback({
        recipeId: feedbackData.recipeId,
        reasons: feedbackData.reasons,
        comment: feedbackData.comment,
        futureInterest: feedbackData.futureInterest,
        rating: feedbackData.rating,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip,
      });

      await feedback.save();

      logger.info('Feedback saved successfully', { 
        feedbackId: feedback._id,
        recipeId: feedbackData.recipeId 
      });

      const response: ApiResponse<{ id: string }> = {
        success: true,
        data: { id: (feedback._id as any).toString() },
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  private validateFeedbackInput(feedback: FeedbackType): boolean {
    if (!feedback.recipeId || typeof feedback.recipeId !== 'string') {
      return false;
    }

    if (!Array.isArray(feedback.reasons) || feedback.reasons.length === 0) {
      return false;
    }

    if (!['interested', 'notInterested', 'requestChange'].includes(feedback.futureInterest)) {
      return false;
    }

    if (feedback.rating !== undefined && (feedback.rating < 1 || feedback.rating > 5)) {
      return false;
    }

    if (feedback.comment && typeof feedback.comment !== 'string') {
      return false;
    }

    return true;
  }
}