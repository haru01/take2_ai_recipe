export interface RecipeInput {
  theme: string;
  cookingTime: '30min' | '60min' | 'unlimited';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  specialRequests: string[];
  avoidIngredients: string;
  priority: 'appearance' | 'nutrition' | 'quick' | 'unique';
}

export interface Recipe {
  id: string;
  agentType: 'classic' | 'fusion' | 'healthy';
  title: string;
  description: string;
  cookingTime: number;
  mainIngredients: string[];
  features: string[];
  imageUrl?: string;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface CookingStep {
  stepNumber: number;
  instruction: string;
  duration?: number;
  temperature?: string;
  tips?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutritionInfo: NutritionInfo;
  tips: string[];
  servings: number;
  prepTime: number;
  totalTime: number;
}

export interface Feedback {
  recipeId: string;
  reasons: string[];
  comment?: string;
  futureInterest: 'interested' | 'notInterested' | 'requestChange';
  rating?: number;
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export type AgentType = 'classic' | 'fusion' | 'healthy';

export interface LLMGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}