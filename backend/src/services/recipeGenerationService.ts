import { LLMService } from './llmService';
import { PromptService } from './promptService';
import { Recipe as RecipeModel } from '../models/Recipe';
import { LLMResponseParser } from '../utils/llmResponseParser';
import { RecipeInput, Recipe, AgentType, RecipeDetail } from '../types';
import { logger } from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export class RecipeGenerationService {
  constructor(
    private llmService: LLMService,
    private promptService: PromptService
  ) {}

  async generateRecipes(input: RecipeInput): Promise<Recipe[]> {
    try {
      logger.info('Starting recipe generation', { input });

      const agentTypes: AgentType[] = ['classic', 'fusion', 'healthy'];
      const prompts = agentTypes.map(agentType => 
        this.promptService.getPromptByAgentType(agentType, input)
      );

      const responses = await Promise.allSettled(
        prompts.map(prompt => this.llmService.generateRecipe(prompt))
      );

      const recipes: Recipe[] = [];

      for (let i = 0; i < responses.length; i++) {
        const response = responses[i];
        const agentType = agentTypes[i];

        if (response.status === 'fulfilled') {
          try {
            const parsed = LLMResponseParser.parseRecipeResponse(response.value);
            
            if (LLMResponseParser.validateRecipeData(parsed)) {
              const recipe: Recipe = {
                id: `recipe-${Date.now()}-${i}`,
                agentType,
                title: parsed.title || `${agentType}シェフのレシピ`,
                description: parsed.description || `${agentType}シェフが提案する特別なレシピです。`,
                cookingTime: parsed.cookingTime || 30,
                mainIngredients: parsed.mainIngredients || ['材料1', '材料2', '材料3'],
                features: parsed.features || ['美味しい', '簡単', '栄養満点'],
                imageUrl: parsed.imageUrl,
              };
              
              recipes.push(recipe);
              logger.info(`Successfully generated ${agentType} recipe: ${recipe.title}`);
            } else {
              logger.warn(`Invalid recipe data from ${agentType} agent, using fallback`);
              // フォールバックレシピを追加
              const fallbackRecipe: Recipe = {
                id: `recipe-${Date.now()}-${i}`,
                agentType,
                title: `${agentType}シェフの特別レシピ`,
                description: 'AIが提案する美味しいレシピです。',
                cookingTime: 30,
                mainIngredients: ['新鮮な食材', '調味料', 'スパイス'],
                features: ['ヘルシー', '簡単調理', '本格的な味'],
                imageUrl: undefined,
              };
              recipes.push(fallbackRecipe);
            }
          } catch (error) {
            logger.error(`Failed to parse ${agentType} recipe:`, error);
          }
        } else {
          logger.error(`Failed to generate ${agentType} recipe:`, response.reason);
        }
      }

      if (recipes.length === 0) {
        throw createError('すべてのレシピ生成に失敗しました', 500);
      }

      logger.info(`Successfully generated ${recipes.length} recipes`);
      return recipes;
    } catch (error) {
      logger.error('Recipe generation service error:', error);
      throw error instanceof Error ? error : createError('レシピ生成に失敗しました', 500);
    }
  }

  async generateRecipeDetail(recipeId: string, title: string, agentType: AgentType): Promise<RecipeDetail> {
    try {
      logger.info('Generating detailed recipe', { recipeId, title, agentType });

      const prompt = this.promptService.generateDetailedRecipePrompt(title, agentType);
      const response = await this.llmService.generateRecipeDetail(prompt);
      const parsed = LLMResponseParser.parseRecipeResponse(response);

      // ingredients データの検証・補完
      const sanitizedIngredients = (parsed.ingredients || []).map((ing: any) => ({
        name: ing.name || '材料',
        amount: ing.amount || '適量',
        unit: ing.unit || '適量',
        notes: ing.notes || ''
      }));

      const recipeDetail: RecipeDetail = {
        id: recipeId,
        agentType,
        title,
        description: parsed.description || `${title}の詳細レシピです。`,
        cookingTime: parsed.totalTime || parsed.cookingTime || 30,
        mainIngredients: sanitizedIngredients.slice(0, 3).map((ing: any) => ing.name) || [title],
        features: parsed.features || ['手作り', '栄養満点', '美味しい'],
        ingredients: sanitizedIngredients.length > 0 ? sanitizedIngredients : [
          { name: '基本材料', amount: '適量', unit: '適量', notes: 'レシピに応じて準備してください' }
        ],
        steps: parsed.steps || [
          { stepNumber: 1, instruction: '材料を準備します。', duration: 5 },
          { stepNumber: 2, instruction: '調理を開始します。', duration: 25 }
        ],
        nutritionInfo: parsed.nutritionInfo || {
          calories: 300,
          protein: 15,
          carbs: 30,
          fat: 10,
          fiber: 5,
          sodium: 800,
        },
        tips: parsed.tips || ['お好みで調味料を調整してください'],
        servings: parsed.servings || 4,
        prepTime: parsed.prepTime || 15,
        totalTime: parsed.totalTime || parsed.cookingTime || 30,
      };

      await this.saveRecipeToDatabase(recipeDetail);

      logger.info('Successfully generated detailed recipe', { recipeId });
      return recipeDetail;
    } catch (error) {
      logger.error('Failed to generate recipe detail:', error);
      throw error instanceof Error ? error : createError('詳細レシピの生成に失敗しました', 500);
    }
  }

  private async saveRecipeToDatabase(recipeDetail: RecipeDetail): Promise<void> {
    try {
      // ingredients の unit フィールドを検証・補完
      const sanitizedIngredients = recipeDetail.ingredients.map(ingredient => ({
        ...ingredient,
        unit: ingredient.unit || '適量'
      }));

      const recipeDoc = new RecipeModel({
        agentType: recipeDetail.agentType,
        title: recipeDetail.title,
        description: recipeDetail.description,
        cookingTime: recipeDetail.cookingTime,
        prepTime: recipeDetail.prepTime,
        totalTime: recipeDetail.totalTime,
        servings: recipeDetail.servings,
        difficulty: 'intermediate',
        mainIngredients: recipeDetail.mainIngredients,
        ingredients: sanitizedIngredients,
        steps: recipeDetail.steps,
        features: recipeDetail.features,
        tips: recipeDetail.tips,
        nutritionInfo: recipeDetail.nutritionInfo,
        imageUrl: recipeDetail.imageUrl,
        tags: recipeDetail.features,
      });

      await recipeDoc.save();
      logger.info('Recipe saved to database', { id: recipeDetail.id });
    } catch (error) {
      logger.error('Failed to save recipe to database:', error);
    }
  }

  async getRecipeById(id: string): Promise<RecipeDetail | null> {
    try {
      const recipe = await RecipeModel.findById(id);
      if (!recipe) {
        return null;
      }

      const recipeDetail: RecipeDetail = {
        id: (recipe._id as any).toString(),
        agentType: recipe.agentType,
        title: recipe.title,
        description: recipe.description,
        cookingTime: recipe.cookingTime,
        mainIngredients: recipe.mainIngredients,
        features: recipe.features,
        ingredients: recipe.ingredients,
        steps: recipe.steps,
        nutritionInfo: recipe.nutritionInfo,
        tips: recipe.tips,
        servings: recipe.servings,
        prepTime: recipe.prepTime,
        totalTime: recipe.totalTime,
        imageUrl: recipe.imageUrl,
      };

      return recipeDetail;
    } catch (error) {
      logger.error('Failed to get recipe by ID:', error);
      throw createError('レシピの取得に失敗しました', 500);
    }
  }
}