# Claude.md - 料理レシピ生成システム技術仕様書

## 技術スタック

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS


- **Backend**: Node.js + TypeScript
- **API**: REST API
- **LLM**: Llama 3.1:8b (Ollama経由)
- **Database**: MongoDB (レシピ・フィードバック保存用)
- **State Management**: Zustand


## システムアーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Node.js API    │────▶│  Llama 3.1:8b   │
│   (TypeScript)  │◀────│  (TypeScript)   │◀────│   (Ollama)      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │                 │
                        │    Database     │
                        │  (MongoDB   )   │
                        │                 │
                        └─────────────────┘
```

## Frontend実装（React + TypeScript）

### ディレクトリ構造

```
src/
├── components/
│   ├── RecipeInput/
│   ├── ChatDisplay/
│   ├── RecipeSelection/
│   ├── Feedback/
│   └── RecipeDetail/
├── hooks/
│   ├── useRecipeGeneration.ts
│   ├── useAutoScroll.ts
│   └── useFeedback.ts
├── services/
│   ├── api.ts
│   └── recipeService.ts
├── types/
│   ├── recipe.types.ts
│   └── api.types.ts
├── store/
│   └── recipeStore.ts
└── App.tsx
```

### 主要な型定義

```typescript
// types/recipe.types.ts
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

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutritionInfo: NutritionInfo;
  tips: string[];
}

export interface Feedback {
  recipeId: string;
  reasons: string[];
  comment?: string;
  futureInterest: 'interested' | 'notInterested' | 'requestChange';
}
```

### 主要コンポーネント実装例

```typescript
// components/RecipeInput/RecipeInput.tsx
import React, { useState } from 'react';
import { RecipeInput as RecipeInputType } from '../../types/recipe.types';

export const RecipeInput: React.FC<{
  onSubmit: (input: RecipeInputType) => void;
}> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<RecipeInputType>({
    theme: '',
    cookingTime: '60min',
    difficulty: 'intermediate',
    specialRequests: [],
    avoidIngredients: '',
    priority: 'appearance'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="recipe-input-form">
      {/* フォーム実装 */}
    </form>
  );
};
```

### カスタムフック例

```typescript
// hooks/useRecipeGeneration.ts
import { useState, useCallback } from 'react';
import { recipeService } from '../services/recipeService';
import { RecipeInput, Recipe } from '../types/recipe.types';

export const useRecipeGeneration = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipes = useCallback(async (input: RecipeInput) => {
    setLoading(true);
    setError(null);

    try {
      const result = await recipeService.generateRecipes(input);
      setRecipes(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  return { recipes, loading, error, generateRecipes };
};
```

## Backend実装（Node.js + TypeScript）

### ディレクトリ構造

```
src/
├── controllers/
│   ├── recipeController.ts
│   └── feedbackController.ts
├── services/
│   ├── llmService.ts
│   ├── recipeGenerationService.ts
│   └── promptService.ts
├── models/
│   ├── Recipe.ts
│   └── Feedback.ts
├── routes/
│   ├── recipeRoutes.ts
│   └── feedbackRoutes.ts
├── middleware/
│   ├── errorHandler.ts
│   └── validation.ts
├── types/
│   └── index.ts
├── config/
│   ├── database.ts
│   └── ollama.ts
└── app.ts
```

### LLMサービス実装

```typescript
// services/llmService.ts
import { Ollama } from 'ollama';

export class LLMService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({
      model: 'llama3.1:8b',
      host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    });
  }

  async generateRecipe(prompt: string): Promise<string> {
    try {
      const response = await this.ollama.generate({
        model: 'llama3.1:8b',
        prompt,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 1500
        }
      });

      return response.response;
    } catch (error) {
      console.error('LLM generation error:', error);
      throw new Error('レシピ生成に失敗しました');
    }
  }
}
```

### プロンプトサービス

```typescript
// services/promptService.ts
import { RecipeInput } from '../types';

export class PromptService {
  generateClassicChefPrompt(input: RecipeInput): string {
    return `
あなたは伝統的な料理を得意とするクラシックシェフです。
以下の条件でレシピを1つ提案してください。

条件：
- テーマ: ${input.theme}
- 調理時間: ${this.getCookingTimeText(input.cookingTime)}
- 難易度: ${this.getDifficultyText(input.difficulty)}
- 特別な要望: ${input.specialRequests.join(', ') || 'なし'}
- 避けたい食材: ${input.avoidIngredients || 'なし'}
- 重視ポイント: ${this.getPriorityText(input.priority)}

以下のJSON形式で厳密に回答してください：
{
  "title": "料理名",
  "description": "料理の説明（2-3文）",
  "cookingTime": 調理時間（分）,
  "mainIngredients": ["主要材料1", "主要材料2"],
  "features": ["特徴1", "特徴2"]
}
`;
  }

  generateFusionChefPrompt(input: RecipeInput): string {
    // フュージョンシェフ用のプロンプト
  }

  generateHealthyChefPrompt(input: RecipeInput): string {
    // ヘルシーシェフ用のプロンプト
  }

  private getCookingTimeText(time: string): string {
    const timeMap = {
      '30min': '30分以内',
      '60min': '1時間以内',
      'unlimited': '時間制限なし'
    };
    return timeMap[time] || time;
  }

  // 他のヘルパーメソッド
}
```

### レシピ生成サービス

```typescript
// services/recipeGenerationService.ts
import { LLMService } from './llmService';
import { PromptService } from './promptService';
import { RecipeInput, Recipe } from '../types';

export class RecipeGenerationService {
  constructor(
    private llmService: LLMService,
    private promptService: PromptService
  ) {}

  async generateRecipes(input: RecipeInput): Promise<Recipe[]> {
    const prompts = [
      this.promptService.generateClassicChefPrompt(input),
      this.promptService.generateFusionChefPrompt(input),
      this.promptService.generateHealthyChefPrompt(input)
    ];

    // 並列でレシピ生成
    const responses = await Promise.all(
      prompts.map(prompt => this.llmService.generateRecipe(prompt))
    );

    // JSONパース&エラーハンドリング
    return responses.map((response, index) => {
      try {
        const parsed = JSON.parse(response);
        return {
          ...parsed,
          id: `recipe-${Date.now()}-${index}`,
          agentType: ['classic', 'fusion', 'healthy'][index]
        };
      } catch (error) {
        console.error('Parse error:', error);
        throw new Error('レシピのパースに失敗しました');
      }
    });
  }
}
```

### APIルート実装

```typescript
// routes/recipeRoutes.ts
import { Router } from 'express';
import { RecipeController } from '../controllers/recipeController';

const router = Router();
const recipeController = new RecipeController();

router.post('/generate', recipeController.generateRecipes);
router.get('/recipe/:id', recipeController.getRecipeDetail);
router.post('/feedback', recipeController.submitFeedback);

export default router;
```

## Llama 3.1:8b 最適化

### プロンプトエンジニアリング

```typescript
// config/prompts.ts
export const SYSTEM_PROMPTS = {
  classic: `あなたは経験豊富な家庭料理のエキスパートです。
基本に忠実で、誰でも作れる美味しいレシピを提案します。
回答は必ず指定されたJSON形式で行ってください。`,

  fusion: `あなたは創造的なフュージョン料理のシェフです。
異なる料理文化を組み合わせた独創的なレシピを提案します。
回答は必ず指定されたJSON形式で行ってください。`,

  healthy: `あなたは栄養学に精通したヘルスコンシャスなシェフです。
健康的で栄養バランスの良いレシピを提案します。
回答は必ず指定されたJSON形式で行ってください。`
};
```

### レスポンス処理

```typescript
// utils/llmResponseParser.ts
export class LLMResponseParser {
  static parseRecipeResponse(response: string): any {
    // JSON抽出（マークダウンコードブロック対応）
    const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // 直接JSON形式の場合
    try {
      return JSON.parse(response);
    } catch (error) {
      // フォールバック処理
      return this.extractDataFromText(response);
    }
  }

  private static extractDataFromText(text: string): any {
    // テキストからデータを抽出するロジック
  }
}
```

## デプロイメント構成

### Docker構成

 * frontend
   * REACT_APP_API_URL: http://backend:4000
 * backend
 * OLLAMA_HOST: http://ollama:11434
 * DATABASE_URL: mongodb://user:pass@mongodb:27017/recipes


### 環境変数設定

```env
# .env.example
# Backend
NODE_ENV=development
PORT=4000
DATABASE_URL=mongodb://user:pass@mongodb:27017/recipes
OLLAMA_HOST=http://localhost:11434
JWT_SECRET=your-secret-key

# Frontend
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENVIRONMENT=development
```

## パフォーマンス最適化

1. **LLM応答の最適化**
   - ストリーミングレスポンス対応
   - キャッシュ戦略（類似リクエスト）
   - バッチ処理の実装

2. **フロントエンド最適化**
   - React.lazy()によるコード分割
   - useMemoとuseCallbackの適切な使用
   - 仮想スクロールの実装（レシピリスト）

3. **バックエンド最適化**
   - コネクションプーリング
   - レスポンスの圧縮
   - レート制限の実装

この構成により、スケーラブルで保守性の高い料理レシピ生成システムを実現できます。