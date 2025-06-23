import { Request, Response, NextFunction } from 'express';
import { RecipeGenerationService } from '../services/recipeGenerationService';
import { LLMService } from '../services/llmService';
import { PromptService } from '../services/promptService';
import { RecipeInput, ApiResponse } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class RecipeController {
  private recipeGenerationService: RecipeGenerationService;

  constructor() {
    const llmService = new LLMService();
    const promptService = new PromptService();
    this.recipeGenerationService = new RecipeGenerationService(llmService, promptService);
  }

  generateRecipes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const input: RecipeInput = req.body;
      
      logger.info('Recipe generation request received', { 
        input,
        headers: req.headers,
        method: req.method,
        url: req.url
      });
      
      if (!this.validateRecipeInput(input)) {
        logger.warn('Invalid recipe input', { input });
        throw createError('無効な入力データです', 400);
      }

      const recipes = await this.recipeGenerationService.generateRecipes(input);
      
      logger.info('Recipe generation completed', { 
        recipeCount: recipes.length,
        recipes: recipes.map(r => ({ id: r.id, title: r.title, agentType: r.agentType }))
      });

      const response: ApiResponse<typeof recipes> = {
        success: true,
        data: recipes,
      };

      res.json(response);
    } catch (error) {
      logger.error('Recipe generation failed', { error, input: req.body });
      next(error);
    }
  };

  getRecipeDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!id) {
        throw createError('レシピIDが必要です', 400);
      }

      logger.info('Recipe detail request received', { id });

      const recipeDetail = await this.recipeGenerationService.getRecipeById(id);

      if (!recipeDetail) {
        throw createError('レシピが見つかりません', 404);
      }

      logger.info('Recipe detail retrieved successfully', { 
        id, 
        title: recipeDetail.title 
      });

      const response: ApiResponse<typeof recipeDetail> = {
        success: true,
        data: recipeDetail,
      };

      res.json(response);
    } catch (error) {
      logger.error('Failed to get recipe detail', { error, id: req.params.id });
      next(error);
    }
  };

  private validateRecipeInput(input: RecipeInput): boolean {
    if (!input.theme || typeof input.theme !== 'string') {
      return false;
    }

    if (!['30min', '60min', 'unlimited'].includes(input.cookingTime)) {
      return false;
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(input.difficulty)) {
      return false;
    }

    if (!Array.isArray(input.specialRequests)) {
      return false;
    }

    if (typeof input.avoidIngredients !== 'string') {
      return false;
    }

    if (!['appearance', 'nutrition', 'quick', 'unique'].includes(input.priority)) {
      return false;
    }

    return true;
  }
}