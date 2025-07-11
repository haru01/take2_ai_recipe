import { RecipeInput, AgentType } from '../types';

export class PromptService {
  private getCookingTimeText(time: string): string {
    const timeMap = {
      '30min': '30分以内',
      '60min': '1時間以内',
      'unlimited': '時間制限なし'
    };
    return timeMap[time as keyof typeof timeMap] || time;
  }

  private getDifficultyText(difficulty: string): string {
    const difficultyMap = {
      'beginner': '初心者向け',
      'intermediate': '中級者向け',
      'advanced': '上級者向け'
    };
    return difficultyMap[difficulty as keyof typeof difficultyMap] || difficulty;
  }

  private getPriorityText(priority: string): string {
    const priorityMap = {
      'appearance': '見た目の美しさ',
      'nutrition': '栄養バランス',
      'quick': '手軽さ・時短',
      'unique': '独創性・ユニークさ'
    };
    return priorityMap[priority as keyof typeof priorityMap] || priority;
  }

  generateClassicChefPrompt(input: RecipeInput): string {
    return `あなたは経験豊富な家庭料理のエキスパートです。基本に忠実で、誰でも作れる美味しいレシピを提案します。

以下の条件で料理を1つ提案してください：

条件：
- テーマ: ${input.theme}
- 調理時間: ${this.getCookingTimeText(input.cookingTime)}
- 難易度: ${this.getDifficultyText(input.difficulty)}
- 特別な要望: ${input.specialRequests.join(', ') || 'なし'}
- 避けたい食材: ${input.avoidIngredients || 'なし'}
- 重視ポイント: ${this.getPriorityText(input.priority)}

以下のJSON形式で完全なレシピを回答してください：
{
  "title": "料理名",
  "description": "料理の説明を2-3文で書いてください",
  "cookingTime": 30,
  "prepTime": 15,
  "totalTime": 45,
  "servings": 4,
  "mainIngredients": ["主要材料1", "主要材料2", "主要材料3"],
  "features": ["特徴1", "特徴2", "特徴3"],
  "ingredients": [
    {"name": "材料名", "amount": "分量", "unit": "単位", "notes": "備考（任意）"}
  ],
  "steps": [
    {"stepNumber": 1, "instruction": "手順の説明", "duration": 5, "temperature": "温度（任意）", "tips": "コツ（任意）"}
  ],
  "nutritionInfo": {
    "calories": 300, "protein": 15, "carbs": 30, "fat": 10, "fiber": 5, "sodium": 800
  },
  "tips": ["調理のコツ1", "調理のコツ2"]
}

重要事項：
1. すべてのフィールドに適切な値を入れてください
2. ingredientsは最低5つ、stepsは最低3つ含めてください
3. JSON以外の文章は一切含めないでください`;
  }

  generateFusionChefPrompt(input: RecipeInput): string {
    return `あなたは創造的なフュージョン料理のシェフです。異なる料理文化を組み合わせた独創的なレシピを提案します。

以下の条件で革新的な料理を1つ提案してください：

条件：
- テーマ: ${input.theme}
- 調理時間: ${this.getCookingTimeText(input.cookingTime)}
- 難易度: ${this.getDifficultyText(input.difficulty)}
- 特別な要望: ${input.specialRequests.join(', ') || 'なし'}
- 避けたい食材: ${input.avoidIngredients || 'なし'}
- 重視ポイント: ${this.getPriorityText(input.priority)}

異なる文化の要素を組み合わせ、新しい味の体験を提供してください。

以下のJSON形式で厳密に回答してください：
{
  "title": "料理名",
  "description": "料理の説明を2-3文で独創性を強調して書いてください",
  "cookingTime": 30,
  "prepTime": 15,
  "totalTime": 45,
  "servings": 4,
  "mainIngredients": ["主要材料1", "主要材料2", "主要材料3"],
  "features": ["特徴1", "特徴2", "特徴3"],
  "ingredients": [
    {"name": "材料名", "amount": "分量", "unit": "単位", "notes": "備考（任意）"}
  ],
  "steps": [
    {"stepNumber": 1, "instruction": "手順の説明", "duration": 5, "temperature": "温度（任意）", "tips": "コツ（任意）"}
  ],
  "nutritionInfo": {
    "calories": 300, "protein": 15, "carbs": 30, "fat": 10, "fiber": 5, "sodium": 800
  },
  "tips": ["調理のコツ1", "調理のコツ2"]
}

重要事項：
1. すべてのフィールドに適切な値を入れてください
2. ingredientsは最低5つ、stepsは最低3つ含めてください
3. JSON以外の文章は一切含めないでください`;
  }

  generateHealthyChefPrompt(input: RecipeInput): string {
    return `あなたは栄養学に精通したヘルスコンシャスなシェフです。健康的で栄養バランスの良いレシピを提案します。

以下の条件で栄養価の高い料理を1つ提案してください：

条件：
- テーマ: ${input.theme}
- 調理時間: ${this.getCookingTimeText(input.cookingTime)}
- 難易度: ${this.getDifficultyText(input.difficulty)}
- 特別な要望: ${input.specialRequests.join(', ') || 'なし'}
- 避けたい食材: ${input.avoidIngredients || 'なし'}
- 重視ポイント: ${this.getPriorityText(input.priority)}

低カロリー、高栄養、バランスの取れた食材を使用してください。

以下のJSON形式で厳密に回答してください：
{
  "title": "料理名",
  "description": "料理の説明を2-3文で健康効果を含めて書いてください",
  "cookingTime": 30,
  "prepTime": 15,
  "totalTime": 45,
  "servings": 4,
  "mainIngredients": ["主要材料1", "主要材料2", "主要材料3"],
  "features": ["特徴1", "特徴2", "特徴3"],
  "ingredients": [
    {"name": "材料名", "amount": "分量", "unit": "単位", "notes": "備考（任意）"}
  ],
  "steps": [
    {"stepNumber": 1, "instruction": "手順の説明", "duration": 5, "temperature": "温度（任意）", "tips": "コツ（任意）"}
  ],
  "nutritionInfo": {
    "calories": 300, "protein": 15, "carbs": 30, "fat": 10, "fiber": 5, "sodium": 800
  },
  "tips": ["調理のコツ1", "調理のコツ2"]
}

重要事項：
1. すべてのフィールドに適切な値を入れてください
2. ingredientsは最低5つ、stepsは最低3つ含めてください
3. JSON以外の文章は一切含めないでください`;
  }


  getPromptByAgentType(agentType: AgentType, input: RecipeInput): string {
    switch (agentType) {
      case 'classic':
        return this.generateClassicChefPrompt(input);
      case 'fusion':
        return this.generateFusionChefPrompt(input);
      case 'healthy':
        return this.generateHealthyChefPrompt(input);
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }
  }
}