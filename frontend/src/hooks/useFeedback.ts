import { useState, useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import { Feedback } from '../types/recipe.types';
import { useFeedbackStore } from '../store/recipeStore';

export const useFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { submitFeedback: storeFeedback } = useFeedbackStore();

  const submitFeedback = useCallback(async (feedback: Feedback) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting feedback:', feedback);
      const result = await recipeService.submitFeedback(feedback);
      console.log('Feedback submitted successfully:', result);
      
      // Store feedback in local state
      storeFeedback(feedback.recipeId, feedback);
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'フィードバックの送信に失敗しました';
      console.error('Feedback submission error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeFeedback]);

  return { 
    loading, 
    error, 
    submitFeedback 
  };
};