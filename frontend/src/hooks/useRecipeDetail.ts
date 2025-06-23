import { useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import { AgentType } from '../types/recipe.types';
import { useRecipeStore } from '../store/recipeStore';

export const useRecipeDetail = () => {
  const { 
    recipeDetail, 
    loading, 
    error,
    setRecipeDetail, 
    setLoading, 
    setError 
  } = useRecipeStore();

  const loadRecipeDetail = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      console.log('Loading recipe detail:', { id });
      const result = await recipeService.getRecipeDetail(id);
      console.log('Loaded recipe detail:', result);
      
      setRecipeDetail(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '詳細レシピの取得に失敗しました';
      console.error('Recipe detail loading error:', err);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setRecipeDetail, setLoading, setError]);

  const clearRecipeDetail = useCallback(() => {
    setRecipeDetail(null);
  }, [setRecipeDetail]);

  return { 
    recipeDetail, 
    loading, 
    error, 
    loadRecipeDetail,
    clearRecipeDetail 
  };
};