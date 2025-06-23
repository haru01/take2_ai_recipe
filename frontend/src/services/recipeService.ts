import { apiService } from './api';
import { 
  Recipe, 
  RecipeDetail, 
  RecipeInput, 
  Feedback 
} from '../types/recipe.types';
import { 
  GenerateRecipesRequest, 
  GetRecipeDetailRequest, 
  SubmitFeedbackRequest 
} from '../types/api.types';

export class RecipeService {
  async generateRecipes(input: RecipeInput): Promise<Recipe[]> {
    const request: GenerateRecipesRequest = {
      theme: input.theme,
      cookingTime: input.cookingTime,
      difficulty: input.difficulty,
      specialRequests: input.specialRequests,
      avoidIngredients: input.avoidIngredients,
      priority: input.priority,
    };

    console.log('RecipeService: Making API request with:', request);
    
    try {
      const result = await apiService.post<Recipe[]>('/api/recipes/generate', request);
      console.log('RecipeService: API response:', result);
      return result;
    } catch (error) {
      console.error('RecipeService: API error:', error);
      throw error;
    }
  }

  async getRecipeDetail(id: string): Promise<RecipeDetail> {
    console.log('RecipeService: Getting recipe detail for ID:', id);
    
    try {
      const result = await apiService.get<RecipeDetail>(`/api/recipes/${id}`);
      console.log('RecipeService: Recipe detail retrieved:', result);
      return result;
    } catch (error) {
      console.error('RecipeService: Failed to get recipe detail:', error);
      throw error;
    }
  }

  async submitFeedback(feedback: Feedback): Promise<{ id: string }> {
    const request: SubmitFeedbackRequest = {
      recipeId: feedback.recipeId,
      reasons: feedback.reasons,
      comment: feedback.comment,
      futureInterest: feedback.futureInterest,
      rating: feedback.rating,
    };

    return apiService.post<{ id: string }>('/api/feedback', request);
  }
}

export const recipeService = new RecipeService();