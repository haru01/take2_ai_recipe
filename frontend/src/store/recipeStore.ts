import { create } from 'zustand';
import { Recipe, RecipeDetail, RecipeInput, Feedback } from '../types/recipe.types';

interface RecipeState {
  recipes: Recipe[];
  selectedRecipe: Recipe | null;
  recipeDetail: RecipeDetail | null;
  loading: boolean;
  error: string | null;
  
  setRecipes: (recipes: Recipe[]) => void;
  setSelectedRecipe: (recipe: Recipe | null) => void;
  setRecipeDetail: (detail: RecipeDetail | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

export const useRecipeStore = create<RecipeState>((set) => ({
  recipes: [],
  selectedRecipe: null,
  recipeDetail: null,
  loading: false,
  error: null,

  setRecipes: (recipes) => set({ recipes }),
  setSelectedRecipe: (recipe) => set({ selectedRecipe: recipe }),
  setRecipeDetail: (detail) => set({ recipeDetail: detail }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearState: () => set({ 
    recipes: [], 
    selectedRecipe: null, 
    recipeDetail: null, 
    loading: false, 
    error: null 
  }),
}));

interface FeedbackState {
  submittedFeedback: Record<string, Feedback>;
  submitFeedback: (recipeId: string, feedback: Feedback) => void;
  getFeedback: (recipeId: string) => Feedback | null;
}

export const useFeedbackStore = create<FeedbackState>((set, get) => ({
  submittedFeedback: {},

  submitFeedback: (recipeId, feedback) => set((state) => ({
    submittedFeedback: {
      ...state.submittedFeedback,
      [recipeId]: feedback,
    },
  })),

  getFeedback: (recipeId) => {
    const state = get();
    return state.submittedFeedback[recipeId] || null;
  },
}));