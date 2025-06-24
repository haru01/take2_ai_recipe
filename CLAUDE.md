# Claude.md - 料理レシピ生成システム技術仕様書

## 技術スタック

- **Frontend**: React 18.2.0 + TypeScript 5.3.3
- **Build Tool**: Vite 5.0.10
- **Styling**: Tailwind CSS 3.3.7
- **State Management**: Zustand 4.4.7
- **HTTP Client**: Axios 1.6.2
- **Routing**: React Router 6.20.1
- **WebSocket**: Socket.io-client 4.8.1

- **Backend**: Node.js + TypeScript 5.3.3
- **Framework**: Express 4.18.2
- **API**: REST API + WebSocket (Socket.io 4.8.1)
- **LLM**: Llama 3.1:8b (Ollama 0.5.0経由)
- **Database**: MongoDB (Mongoose 8.0.3)
- **Logger**: Winston 3.11.0
- **Security**: Helmet, CORS, Compression


## システムアーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  React Frontend │────▶│  Node.js API    │────▶│  Llama 3.1:8b   │
│   (TypeScript)  │◀────│  (Express)      │◀────│   (Ollama)      │
│                 │     │                 │     │                 │
│  ┌─────────────┐│     │  ┌─────────────┐│     │                 │
│  │ Socket.io   ││◀───▶│  │ Socket.io   ││     │                 │
│  │ WebSocket   ││     │  │ WebSocket   ││     │                 │
│  └─────────────┘│     │  └─────────────┘│     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │    MongoDB      │
                        │  (Mongoose)     │
                        │                 │
                        │ ┌─────────────┐ │
                        │ │   Recipe    │ │
                        │ │  Feedback   │ │
                        │ └─────────────┘ │
                        └─────────────────┘
```

### 通信フロー

1. **通常のレシピ生成**: REST API (HTTP)
2. **ストリーミング生成**: WebSocket (Socket.io)
3. **リアルタイム進捗表示**: WebSocket双方向通信
4. **詳細レシピ保存**: MongoDB自動保存

## Frontend実装（React + TypeScript）

### ディレクトリ構造

```
frontend/src/
├── components/
│   ├── RecipeInput/
│   │   ├── RecipeInput.tsx
│   │   └── StreamingRecipeInput.tsx
│   ├── ChatDisplay/
│   ├── RecipeSelection/
│   │   └── RecipeSelection.tsx
│   ├── Feedback/
│   │   └── Feedback.tsx
│   ├── RecipeDetail/
│   │   └── RecipeDetail.tsx
│   └── StreamingDisplay/
│       └── StreamingDisplay.tsx
├── hooks/
│   ├── useRecipeGeneration.ts
│   ├── useStreamingRecipes.ts
│   ├── useAutoScroll.ts
│   ├── useFeedback.ts
│   └── useRecipeDetail.ts
├── services/
│   ├── api.ts
│   ├── recipeService.ts
│   └── websocketService.ts
├── types/
│   ├── recipe.types.ts
│   └── api.types.ts
├── store/
│   └── recipeStore.ts
├── styles/
│   └── globals.css
├── App.tsx
└── main.tsx
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
  prepTime: number;
  totalTime: number;
  servings: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  mainIngredients: string[];
  features: string[];
  tags: string[];
  imageUrl?: string;
}

export interface RecipeDetail extends Recipe {
  ingredients: Ingredient[];
  steps: CookingStep[];
  nutritionInfo: NutritionInfo;
  tips: string[];
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
  notes?: string;
}

export interface CookingStep {
  step: number;
  instruction: string;
  duration?: number;
  tips?: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Feedback {
  recipeId: string;
  reasons: string[];
  comment?: string;
  futureInterest: 'interested' | 'notInterested' | 'requestChange';
}

// ストリーミング関連
export interface StreamingState {
  classic: 'pending' | 'processing' | 'completed' | 'error';
  fusion: 'pending' | 'processing' | 'completed' | 'error';
  healthy: 'pending' | 'processing' | 'completed' | 'error';
}

export interface StreamingProgress {
  agentType: 'classic' | 'fusion' | 'healthy';
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  content?: Partial<Recipe>;
  error?: string;
}
```

### 主要コンポーネント実装例

```typescript
// components/StreamingDisplay/StreamingDisplay.tsx
import React from 'react';
import { StreamingProgress } from '../../types/recipe.types';

export const StreamingDisplay: React.FC<{
  streamingData: StreamingProgress[];
  isStreaming: boolean;
}> = ({ streamingData, isStreaming }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'processing': return 'text-blue-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="streaming-display">
      {streamingData.map((agent) => (
        <div key={agent.agentType} className="agent-progress mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium capitalize">{agent.agentType} Chef</span>
            <span className={getStatusColor(agent.status)}>
              {agent.status}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${agent.progress}%` }}
            />
          </div>
          
          {agent.content && (
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <h4 className="font-medium">{agent.content.title}</h4>
              <p className="text-sm text-gray-600">{agent.content.description}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
```

### カスタムフック例

```typescript
// hooks/useStreamingRecipes.ts
import { useState, useCallback, useEffect } from 'react';
import { websocketService } from '../services/websocketService';
import { RecipeInput, Recipe, StreamingProgress } from '../types/recipe.types';

export const useStreamingRecipes = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [streamingData, setStreamingData] = useState<StreamingProgress[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // WebSocket接続
    websocketService.connect();

    // ストリーミング進捗イベント
    websocketService.onProgress((progress: StreamingProgress) => {
      setStreamingData(prev => {
        const updated = [...prev];
        const index = updated.findIndex(item => item.agentType === progress.agentType);
        if (index >= 0) {
          updated[index] = progress;
        } else {
          updated.push(progress);
        }
        return updated;
      });
    });

    // レシピ完成イベント
    websocketService.onRecipeComplete((recipe: Recipe) => {
      setRecipes(prev => [...prev, recipe]);
    });

    // エラーイベント
    websocketService.onError((error: string) => {
      setError(error);
      setIsStreaming(false);
    });

    return () => {
      websocketService.disconnect();
    };
  }, []);

  const generateStreamingRecipes = useCallback((input: RecipeInput) => {
    setIsStreaming(true);
    setError(null);
    setRecipes([]);
    setStreamingData([]);
    
    websocketService.requestStreamingRecipes(input);
  }, []);

  return { 
    recipes, 
    streamingData, 
    isStreaming, 
    error, 
    generateStreamingRecipes 
  };
};
```

## Backend実装（Node.js + TypeScript）

### ディレクトリ構造

```
backend/src/
├── controllers/
│   ├── recipeController.ts
│   └── feedbackController.ts
├── services/
│   ├── llmService.ts
│   ├── recipeGenerationService.ts
│   ├── streamingRecipeGenerationService.ts
│   ├── promptService.ts
│   └── websocketService.ts
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
├── utils/
│   ├── llmResponseParser.ts
│   └── logger.ts
├── config/ (空のディレクトリ)
└── app.ts
```

### LLMサービス実装

```typescript
// services/llmService.ts
import { Ollama } from 'ollama';
import { logger } from '../utils/logger';

export class LLMService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({
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
          num_predict: 1500
        }
      });

      return response.response;
    } catch (error) {
      logger.error('LLM generation error:', error);
      throw new Error('レシピ生成に失敗しました');
    }
  }

  // ストリーミング生成
  async *generateRecipeStream(prompt: string): AsyncGenerator<string, void, unknown> {
    try {
      const stream = await this.ollama.generate({
        model: 'llama3.1:8b',
        prompt,
        stream: true,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 1500
        }
      });

      for await (const chunk of stream) {
        if (chunk.response) {
          yield chunk.response;
        }
      }
    } catch (error) {
      logger.error('LLM streaming error:', error);
      throw new Error('ストリーミング生成に失敗しました');
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

### WebSocketストリーミングサービス

```typescript
// services/streamingRecipeGenerationService.ts
import { Server as SocketServer } from 'socket.io';
import { LLMService } from './llmService';
import { PromptService } from './promptService';
import { RecipeInput } from '../types';
import { logger } from '../utils/logger';
import { LLMResponseParser } from '../utils/llmResponseParser';

export class StreamingRecipeGenerationService {
  constructor(
    private llmService: LLMService,
    private promptService: PromptService
  ) {}

  async generateStreamingRecipes(
    input: RecipeInput, 
    io: SocketServer, 
    socketId: string
  ): Promise<void> {
    const agents = [
      { type: 'classic', prompt: this.promptService.generateClassicChefPrompt(input) },
      { type: 'fusion', prompt: this.promptService.generateFusionChefPrompt(input) },
      { type: 'healthy', prompt: this.promptService.generateHealthyChefPrompt(input) }
    ];

    // 並列でストリーミング生成
    const promises = agents.map(agent => 
      this.processStreamingAgent(agent, io, socketId)
    );

    try {
      await Promise.all(promises);
    } catch (error) {
      logger.error('Streaming generation error:', error);
      io.to(socketId).emit('streaming-error', 'レシピ生成中にエラーが発生しました');
    }
  }

  private async processStreamingAgent(
    agent: { type: string; prompt: string },
    io: SocketServer,
    socketId: string
  ): Promise<void> {
    try {
      // 開始通知
      io.to(socketId).emit('streaming-progress', {
        agentType: agent.type,
        status: 'processing',
        progress: 0
      });

      let accumulatedText = '';
      let progress = 0;

      // ストリーミング生成
      for await (const chunk of this.llmService.generateRecipeStream(agent.prompt)) {
        accumulatedText += chunk;
        progress = Math.min(progress + 5, 95);

        // 進捗更新
        io.to(socketId).emit('streaming-progress', {
          agentType: agent.type,
          status: 'processing',
          progress,
          content: this.tryParsePartialRecipe(accumulatedText)
        });
      }

      // 完了処理
      const recipe = LLMResponseParser.parseRecipeResponse(accumulatedText);
      const finalRecipe = {
        ...recipe,
        id: `recipe-${Date.now()}-${agent.type}`,
        agentType: agent.type
      };

      io.to(socketId).emit('streaming-progress', {
        agentType: agent.type,
        status: 'completed',
        progress: 100
      });

      io.to(socketId).emit('recipe-complete', finalRecipe);

    } catch (error) {
      logger.error(`Agent ${agent.type} error:`, error);
      io.to(socketId).emit('streaming-progress', {
        agentType: agent.type,
        status: 'error',
        progress: 0,
        error: 'レシピ生成に失敗しました'
      });
    }
  }

  private tryParsePartialRecipe(text: string): any {
    try {
      return LLMResponseParser.parseRecipeResponse(text);
    } catch {
      return null;
    }
  }
}
```

### WebSocketサービス設定

```typescript
// services/websocketService.ts
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { StreamingRecipeGenerationService } from './streamingRecipeGenerationService';
import { LLMService } from './llmService';
import { PromptService } from './promptService';
import { logger } from '../utils/logger';

export class WebSocketService {
  private io: SocketServer;
  private streamingService: StreamingRecipeGenerationService;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
      }
    });

    // サービス初期化
    const llmService = new LLMService();
    const promptService = new PromptService();
    this.streamingService = new StreamingRecipeGenerationService(llmService, promptService);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // ストリーミングレシピ生成要求
      socket.on('request-streaming-recipes', async (input) => {
        logger.info(`Streaming request from ${socket.id}:`, input);
        
        try {
          await this.streamingService.generateStreamingRecipes(
            input, 
            this.io, 
            socket.id
          );
        } catch (error) {
          logger.error('Streaming error:', error);
          socket.emit('streaming-error', 'レシピ生成に失敗しました');
        }
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public getIO(): SocketServer {
    return this.io;
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

// 通常のレシピ生成
router.post('/generate', recipeController.generateRecipes);

// レシピ詳細取得
router.get('/recipe/:id', recipeController.getRecipeDetail);

// フィードバック送信
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

## 実装済み機能

### ✅ 完了した機能
1. **3つのAIエージェント** (Classic、Fusion、Healthy) による並列レシピ生成
2. **WebSocketストリーミング** によるリアルタイム生成表示
3. **詳細レシピの事前生成とDB保存** (パフォーマンス改善)
4. **フィードバックシステム** (ユーザー評価とコメント)
5. **レスポンシブUI** (Tailwind CSS使用)
6. **エラーハンドリング** とログ管理 (Winston)
7. **自動スクロール** とUI状態管理 (Zustand)

### 🔧 技術的特徴
- **ストリーミング機能の切り替え**: UI上でON/OFF可能
- **進捗表示**: 各エージェントの生成進捗をリアルタイム表示
- **接続管理**: WebSocket接続の自動再接続機能
- **セキュリティ**: Helmet、CORS、入力検証

## 環境構成

### ローカル開発環境

```env
# .env.example (backend)
NODE_ENV=development
PORT=4000
DATABASE_URL=mongodb://localhost:27017/recipe-generator
OLLAMA_HOST=http://localhost:11434
FRONTEND_URL=http://localhost:5173

# .env.example (frontend)  
VITE_API_URL=http://localhost:4000
VITE_WS_URL=http://localhost:4000
```

### 必要なサービス
1. **MongoDB**: `mongodb://localhost:27017`
2. **Ollama**: `http://localhost:11434` (Llama 3.1:8b モデル)
3. **Node.js**: 18.x以上
4. **npm/yarn**: パッケージ管理

## 開発・起動手順

### 1. プロジェクトセットアップ
```bash
# リポジトリクローン後
cd take2_ai_recipe

# バックエンド依存関係インストール
cd backend && npm install

# フロントエンド依存関係インストール  
cd ../frontend && npm install
```

### 2. 必要なサービス起動
```bash
# MongoDB起動
mongod

# Ollama起動 (Llama 3.1:8bモデル)
ollama serve
ollama run llama3.1:8b
```

### 3. アプリケーション起動
```bash
# バックエンド起動 (ターミナル1)
cd backend && npm run dev

# フロントエンド起動 (ターミナル2)
cd frontend && npm run dev
```

### 4. アクセス
- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:4000
- **WebSocketエンドポイント**: ws://localhost:4000

## システム特徴

### 🚀 パフォーマンス最適化
1. **詳細レシピの事前生成**: 選択後すぐに詳細表示
2. **WebSocketストリーミング**: リアルタイム進捗表示
3. **並列AI処理**: 3エージェント同時生成
4. **Vite高速ビルド**: 開発時のホットリロード

### 🛡️ セキュリティ機能
1. **入力検証**: フロント・バック両方で実装
2. **CORS設定**: 適切な許可オリジン設定
3. **ヘッダーセキュリティ**: Helmet使用
4. **エラーハンドリング**: 詳細ログと安全なエラー表示

### 📊 監視・ログ機能
1. **Winston構造化ログ**: レベル別ログ出力
2. **WebSocket接続ログ**: 接続・切断の追跡
3. **エラートラッキング**: LLM生成エラーの詳細記録

この実装により、プロダクションレディなAI料理レシピ生成システムが構築されています。WebSocketストリーミング機能により、ユーザーは3つのAIエージェントによるレシピ生成過程をリアルタイムで確認でき、優れたUXを提供します。