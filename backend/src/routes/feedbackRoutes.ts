import { Router } from 'express';
import { FeedbackController } from '../controllers/feedbackController';
import { feedbackLimiter, validateContentType, validateRequestSize } from '../middleware/validation';

const router = Router();
const feedbackController = new FeedbackController();

router.post('/', 
  feedbackLimiter, 
  validateContentType, 
  validateRequestSize, 
  feedbackController.submitFeedback
);

export default router;