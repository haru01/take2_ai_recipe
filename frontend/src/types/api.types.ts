export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface GenerateRecipesRequest {
  theme: string;
  cookingTime: '30min' | '60min' | 'unlimited';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  specialRequests: string[];
  avoidIngredients: string;
  priority: 'appearance' | 'nutrition' | 'quick' | 'unique';
}

export interface GetRecipeDetailRequest {
  id: string;
  title?: string;
  agentType?: 'classic' | 'fusion' | 'healthy';
}

export interface SubmitFeedbackRequest {
  recipeId: string;
  reasons: string[];
  comment?: string;
  futureInterest: 'interested' | 'notInterested' | 'requestChange';
  rating?: number;
}