import { useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import { RecipeInput } from '../types/recipe.types';
import { useRecipeStore } from '../store/recipeStore';

export const useRecipeGeneration = () => {
  const { 
    recipes, 
    loading, 
    error, 
    setRecipes, 
    setLoading, 
    setError,
    clearState 
  } = useRecipeStore();

  const generateRecipes = useCallback(async (input: RecipeInput) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Generating recipes with input:', input);
      const result = await recipeService.generateRecipes(input);
      console.log('Generated recipes:', result);
      
      setRecipes(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'レシピの生成に失敗しました';
      console.error('Recipe generation error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setRecipes, setLoading, setError]);

  const clearRecipes = useCallback(() => {
    clearState();
  }, [clearState]);

  return { 
    recipes, 
    loading, 
    error, 
    generateRecipes,
    clearRecipes 
  };
};