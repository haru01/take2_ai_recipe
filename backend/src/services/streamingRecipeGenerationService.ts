import { LLMService } from './llmService';
import { PromptService } from './promptService';
import { RecipeInput, RecipeDetail } from '../types';
import { Recipe as RecipeModel } from '../models/Recipe';
import { LLMResponseParser } from '../utils/llmResponseParser';
import { logger } from '../utils/logger';

export interface RecipeStreamChunk {
  agentType: 'classic' | 'fusion' | 'healthy';
  status: 'started' | 'progress' | 'completed' | 'error';
  content?: string;
  recipe?: any;
  progress?: number;
}

export class StreamingRecipeGenerationService {
  private llmService: LLMService;
  private promptService: PromptService;

  constructor() {
    this.llmService = new LLMService();
    this.promptService = new PromptService();
  }

  async generateRecipesStream(
    input: RecipeInput,
    requestId: string,
    onChunk: (chunk: RecipeStreamChunk) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const agents: Array<{type: 'classic' | 'fusion' | 'healthy', prompt: string}> = [
        { type: 'classic', prompt: this.promptService.generateClassicChefPrompt(input) },
        { type: 'fusion', prompt: this.promptService.generateFusionChefPrompt(input) },
        { type: 'healthy', prompt: this.promptService.generateHealthyChefPrompt(input) },
      ];

      // 各エージェントのレシピ生成を並列で開始
      const promises = agents.map(async (agent, index) => {
        try {
          // 開始通知
          onChunk({
            agentType: agent.type,
            status: 'started',
            progress: 0,
          });

          // LLMからのストリーミングレスポンスを処理
          let accumulatedContent = '';
          await this.llmService.generateRecipeStream(
            agent.prompt,
            (content: string) => {
              accumulatedContent += content;
              onChunk({
                agentType: agent.type,
                status: 'progress',
                content: accumulatedContent,
                progress: Math.min(90, accumulatedContent.length / 10), // 仮の進捗計算
              });
            }
          );

          // JSONパースを試行
          try {
            const parsed = this.parseRecipeResponse(accumulatedContent);
            const recipeId = `recipe-${Date.now()}-${index}`;
            
            // 詳細レシピを作成してDBに保存
            const recipeDetail = await this.createAndSaveRecipeDetail(parsed, agent.type, recipeId);
            
            // レスポンス用の簡略化されたレシピ
            const recipe = {
              id: recipeDetail.id,
              agentType: recipeDetail.agentType,
              title: recipeDetail.title,
              description: recipeDetail.description,
              cookingTime: recipeDetail.cookingTime,
              mainIngredients: recipeDetail.mainIngredients,
              features: recipeDetail.features,
              imageUrl: recipeDetail.imageUrl,
            };
            
            onChunk({
              agentType: agent.type,
              status: 'completed',
              recipe,
              progress: 100,
            });
          } catch (parseError) {
            logger.error(`Parse error for ${agent.type}:`, parseError);
            onChunk({
              agentType: agent.type,
              status: 'error',
              progress: 100,
            });
          }
        } catch (error) {
          logger.error(`Generation error for ${agent.type}:`, error);
          onChunk({
            agentType: agent.type,
            status: 'error',
            progress: 100,
          });
        }
      });

      await Promise.all(promises);
      onComplete();
    } catch (error) {
      logger.error('Streaming generation error:', error);
      onError(error as Error);
    }
  }

  private parseRecipeResponse(response: string): any {
    // JSON抽出（マークダウンコードブロック対応）
    const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n\s*```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 直接JSON形式の場合
    try {
      return JSON.parse(response);
    } catch (error) {
      // レスポンスから主要情報を抽出するフォールバック
      return this.extractRecipeFromText(response);
    }
  }

  private extractRecipeFromText(text: string): any {
    // テキストからレシピ情報を抽出する簡易パーサー
    const titleMatch = text.match(/(?:title|料理名)[：:]\s*(.+)/i);
    const descMatch = text.match(/(?:description|説明)[：:]\s*(.+)/i);
    const timeMatch = text.match(/(?:cookingTime|調理時間)[：:]\s*(\d+)/i);

    return {
      title: titleMatch?.[1]?.trim() || 'レシピ',
      description: descMatch?.[1]?.trim() || 'レシピの説明',
      cookingTime: timeMatch ? parseInt(timeMatch[1]) : 60,
      mainIngredients: ['材料1', '材料2'],
      features: ['特徴1', '特徴2'],
    };
  }

  private async createAndSaveRecipeDetail(
    parsed: any, 
    agentType: 'classic' | 'fusion' | 'healthy', 
    recipeId: string
  ): Promise<RecipeDetail> {
    // 完全なレシピデータを作成
    const sanitizedIngredients = (parsed.ingredients || []).map((ing: any) => ({
      name: ing.name || '材料',
      amount: ing.amount || '適量',
      unit: ing.unit || '適量',
      notes: ing.notes || ''
    }));

    const recipeDetail: RecipeDetail = {
      id: recipeId,
      agentType,
      title: parsed.title || `${agentType}シェフのレシピ`,
      description: parsed.description || `${agentType}シェフが提案する特別なレシピです。`,
      cookingTime: parsed.cookingTime || 30,
      mainIngredients: parsed.mainIngredients || ['材料1', '材料2', '材料3'],
      features: parsed.features || ['美味しい', '簡単', '栄養満点'],
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
      imageUrl: parsed.imageUrl,
    };

    // MongoDBに保存
    await this.saveRecipeToDatabase(recipeDetail);
    
    return recipeDetail;
  }

  private async saveRecipeToDatabase(recipeDetail: RecipeDetail): Promise<void> {
    try {
      // ingredients の unit フィールドを検証・補完
      const sanitizedIngredients = recipeDetail.ingredients.map(ingredient => ({
        ...ingredient,
        unit: ingredient.unit || '適量'
      }));

      const recipeDoc = new RecipeModel({
        _id: recipeDetail.id,
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
      logger.info('Streaming recipe saved to database', { id: recipeDetail.id });
    } catch (error) {
      logger.error('Failed to save streaming recipe to database:', error);
    }
  }
}