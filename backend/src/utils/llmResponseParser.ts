import { logger } from './logger';

export class LLMResponseParser {
  static parseRecipeResponse(response: string): any {
    logger.debug('Attempting to parse LLM response:', { responseLength: response.length });
    
    try {
      // 1. JSONブロック内のJSONを試す
      const jsonMatch = response.match(/```json\s*\n([\s\S]*?)\n\s*```/);
      if (jsonMatch) {
        const cleanJson = this.cleanJsonString(jsonMatch[1]);
        return JSON.parse(cleanJson);
      }

      // 2. 全体がJSONかチェック
      const cleanResponse = response.trim();
      if (cleanResponse.startsWith('{') && cleanResponse.endsWith('}')) {
        const cleanJson = this.cleanJsonString(cleanResponse);
        return JSON.parse(cleanJson);
      }

      // 3. JSON部分を抽出
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        const jsonStr = cleanResponse.substring(jsonStart, jsonEnd + 1);
        const cleanJson = this.cleanJsonString(jsonStr);
        return JSON.parse(cleanJson);
      }

      logger.warn('Could not extract JSON from LLM response, attempting text extraction');
      return this.extractDataFromText(response);
    } catch (error) {
      logger.error('JSON parsing error:', error);
      logger.debug('Original response:', response.substring(0, 500) + '...');
      
      // フォールバック：テキスト解析を試す
      try {
        return this.extractDataFromText(response);
      } catch (fallbackError) {
        logger.error('Fallback text extraction also failed:', fallbackError);
        return this.getDefaultRecipeData();
      }
    }
  }

  private static cleanJsonString(jsonStr: string): string {
    return jsonStr
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 制御文字を削除
      .replace(/,(\s*[}\]])/g, '$1') // 末尾カンマを削除
      .replace(/([}\]]),(\s*[}\]])/g, '$1$2') // 重複カンマを削除
      .trim();
  }

  private static extractDataFromText(text: string): any {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const extractedData: any = {
      title: '',
      description: '',
      cookingTime: 30,
      mainIngredients: [],
      features: [],
      ingredients: [],
      steps: [],
      nutritionInfo: {
        calories: 300,
        protein: 15,
        carbs: 30,
        fat: 10,
        fiber: 5,
        sodium: 800
      },
      tips: [],
      servings: 4,
      prepTime: 15,
      totalTime: 45
    };

    lines.forEach(line => {
      // タイトル抽出
      if (line.includes('料理名') || line.includes('タイトル') || line.includes('title')) {
        const match = line.match(/[:：](.+)/);
        if (match) extractedData.title = match[1].trim().replace(/[""]/g, '');
      }
      
      // 説明抽出
      if (line.includes('説明') || line.includes('description')) {
        const match = line.match(/[:：](.+)/);
        if (match) extractedData.description = match[1].trim().replace(/[""]/g, '');
      }
      
      // 調理時間抽出
      if (line.includes('調理時間') || line.includes('cookingTime')) {
        const match = line.match(/(\d+)/);
        if (match) extractedData.cookingTime = parseInt(match[1]);
      }
    });

    // デフォルト値の設定
    if (!extractedData.title) {
      extractedData.title = 'AI生成レシピ';
    }
    
    if (!extractedData.description) {
      extractedData.description = 'AIが提案する美味しい料理です。';
    }

    if (extractedData.mainIngredients.length === 0) {
      extractedData.mainIngredients = ['主要材料1', '主要材料2', '主要材料3'];
    }

    if (extractedData.features.length === 0) {
      extractedData.features = ['簡単調理', '栄養満点', '美味しい'];
    }

    return extractedData;
  }

  private static getDefaultRecipeData(): any {
    return {
      title: 'AIレシピ',
      description: 'AI技術を使って生成されたレシピです。',
      cookingTime: 30,
      mainIngredients: ['材料1', '材料2', '材料3'],
      features: ['簡単', '美味しい', '栄養満点'],
      ingredients: [
        { name: '基本材料', amount: '適量', unit: '適量', notes: 'お好みで調整してください' }
      ],
      steps: [
        { stepNumber: 1, instruction: '材料を準備します。', duration: 5 },
        { stepNumber: 2, instruction: '調理を開始します。', duration: 25 }
      ],
      nutritionInfo: {
        calories: 300,
        protein: 15,
        carbs: 30,
        fat: 10,
        fiber: 5,
        sodium: 800
      },
      tips: ['お好みで調味料を調整してください'],
      servings: 4,
      prepTime: 10,
      totalTime: 30
    };
  }

  static validateRecipeData(data: any): boolean {
    // 必須フィールドのチェックと自動補完
    if (!data.title || data.title.trim() === '') {
      logger.warn('Missing or empty title field');
      return false;
    }

    // descriptionが欠落または空の場合は補完
    if (!data.description || data.description.trim() === '') {
      logger.warn('Missing or empty description field, auto-filling');
      data.description = `${data.title}の美味しいレシピです。`;
    }

    // cookingTimeの検証と補完
    if (typeof data.cookingTime !== 'number' || data.cookingTime <= 0) {
      logger.warn('Invalid cookingTime value, using default: 30');
      data.cookingTime = 30;
    }

    // mainIngredientsの検証と補完
    if (!Array.isArray(data.mainIngredients)) {
      data.mainIngredients = [];
    }
    if (data.mainIngredients.length === 0) {
      logger.warn('Empty mainIngredients, adding default');
      data.mainIngredients = ['材料1', '材料2', '材料3'];
    }

    // featuresの検証と補完
    if (!Array.isArray(data.features)) {
      data.features = [];
    }
    if (data.features.length === 0) {
      logger.warn('Empty features, adding default');
      data.features = ['美味しい', '簡単', '栄養満点'];
    }

    return true;
  }
}