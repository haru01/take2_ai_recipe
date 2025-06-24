# 🍳 AI Recipe Generator

**Llama 3.1:8b + WebSocket** を使用したリアルタイム料理レシピ生成システム

## 📖 概要

このアプリケーションは、AI技術を活用して3つの異なるタイプのシェフ（**Classic**、**Fusion**、**Healthy**）からレシピを同時生成するシステムです。WebSocketストリーミング機能により、ユーザーはAIによるレシピ生成過程をリアルタイムで確認でき、優れたUXを提供します。

### ✨ 主な特徴
- 🤖 **3つのAIエージェント**による並列レシピ生成
- ⚡ **WebSocketストリーミング**でリアルタイム進捗表示
- 📊 **詳細レシピの事前生成**によるパフォーマンス最適化
- 💬 **フィードバックシステム**でユーザー評価収集
- 📱 **レスポンシブUI**で全デバイス対応

## 🛠️ 技術スタック

### Frontend
- **React** 18.2.0 + **TypeScript** 5.3.3
- **Vite** 5.0.10 (高速ビルド)
- **Tailwind CSS** 3.3.7 (スタイリング)
- **Zustand** 4.4.7 (状態管理)
- **Socket.io-client** 4.8.1 (WebSocket通信)
- **Axios** 1.6.2 (HTTP通信)
- **React Router** 6.20.1 (ルーティング)

### Backend
- **Node.js** + **Express** 4.18.2 + **TypeScript** 5.3.3
- **Socket.io** 4.8.1 (WebSocketサーバー)
- **MongoDB** + **Mongoose** 8.0.3 (データベース)
- **Ollama** 0.5.0 (Llama 3.1:8b統合)
- **Winston** 3.11.0 (構造化ログ)
- **Security**: Helmet, CORS, Compression

## 🚀 主な機能

### 1. **インテリジェントレシピ入力**
- 🎯 料理のテーマ指定
- ⏰ 調理時間・難易度の選択
- 🙋 特別な要望や避けたい食材の指定
- 📋 重視ポイント（見た目・栄養・時短・ユニーク）

### 2. **リアルタイムAI生成**
- 🔄 **ストリーミング機能**: ON/OFFで生成方式を切り替え
- 👨‍🍳 **3つのAIシェフ**による並列レシピ生成
  - **Classic Chef**: 伝統的で基本に忠実なレシピ
  - **Fusion Chef**: 創造的な異文化融合レシピ
  - **Healthy Chef**: 栄養バランス重視のヘルシーレシピ
- 📊 **進捗表示**: 各シェフの生成状況をリアルタイム監視

### 3. **詳細レシピ表示**
- 📝 材料リスト（分量・単位・備考付き）
- 📋 詳細手順（時間・コツ付き）
- 🍎 栄養情報（カロリー・三大栄養素・食物繊維）
- 💡 調理のコツとポイント
- 🏷️ タグ付け機能

### 4. **フィードバックシステム**
- ⭐ レシピ評価とレーティング
- 💬 コメント・改善提案
- 📈 今後の興味度調査
- 📊 データ収集による改善

## 🔧 セットアップ

### 📋 前提条件
- **Node.js** 18.x以上
- **MongoDB** (ローカルまたはクラウド)
- **Ollama** + **Llama 3.1:8b**モデル

### セットアップ手順

#### 1. Ollama のセットアップ
```bash
# Ollama をインストール（https://ollama.ai/）
# Llama 3.1:8b モデルをダウンロード
ollama pull llama3.1:8b
```

#### 2. MongoDB のセットアップ
```bash
# MongoDB をローカルにインストールまたは MongoDB Atlas を使用
# ローカルの場合：
brew install mongodb/brew/mongodb-community
brew services start mongodb-community
```

#### 3. アプリケーションの起動

```bash
# Backend の起動
cd backend
npm install
cp .env.example .env
# .env ファイルを編集して設定を調整
npm run dev

# 別のターミナルで Frontend の起動
cd frontend
npm install
cp .env.example .env
# .env ファイルを編集して設定を調整
npm run dev
```

#### 4. アクセス
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **WebSocket**: ws://localhost:4000

### 環境変数設定

#### Backend (.env)
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=mongodb://localhost:27017/recipe-generator
OLLAMA_HOST=http://localhost:11434
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
VITE_WS_URL=http://localhost:4000
VITE_ENVIRONMENT=development
```

## 🔌 API エンドポイント

### REST API

#### レシピ生成
```http
POST /api/recipes/generate
Content-Type: application/json

{
  "theme": "和風パスタ",
  "cookingTime": "60min",
  "difficulty": "intermediate",
  "specialRequests": ["低カロリー"],
  "avoidIngredients": "ナッツ",
  "priority": "appearance"
}
```

#### レシピ詳細取得
```http
GET /api/recipes/:id?title=料理名&agentType=classic
```

#### フィードバック送信
```http
POST /api/feedback
Content-Type: application/json

{
  "recipeId": "recipe-123",
  "reasons": ["taste", "easy"],
  "comment": "とても美味しかったです",
  "futureInterest": "interested",
  "rating": 5
}
```

### WebSocket Events

#### クライアント → サーバー
```javascript
// ストリーミングレシピ生成要求
socket.emit('request-streaming-recipes', recipeInput);
```

#### サーバー → クライアント
```javascript
// 生成進捗更新
socket.on('streaming-progress', (progress) => {
  // { agentType, status, progress, content? }
});

// レシピ完成通知
socket.on('recipe-complete', (recipe) => {
  // 完成したレシピデータ
});

// エラー通知
socket.on('streaming-error', (error) => {
  // エラーメッセージ
});
```

## 開発

### コード品質
```bash
# Backend
cd backend
npm run lint
npm run build

# Frontend
cd frontend
npm run lint
npm run build
```

### 📁 ディレクトリ構造
```
take2_ai_recipe/
├── backend/
│   ├── src/
│   │   ├── controllers/             # APIコントローラー
│   │   ├── services/
│   │   │   ├── llmService.ts        # Ollama通信
│   │   │   ├── websocketService.ts  # WebSocket管理
│   │   │   ├── streamingRecipeGenerationService.ts  # ストリーミング生成
│   │   │   └── promptService.ts     # プロンプト管理
│   │   ├── models/                  # MongoDB スキーマ
│   │   ├── routes/                  # REST API ルート
│   │   ├── middleware/              # 認証・検証・エラーハンドリング
│   │   ├── types/                   # TypeScript型定義
│   │   └── utils/                   # ログ・パーサー
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RecipeInput/         # 入力フォーム（通常・ストリーミング）
│   │   │   ├── StreamingDisplay/    # リアルタイム進捗表示
│   │   │   ├── RecipeSelection/     # レシピ選択
│   │   │   ├── RecipeDetail/        # 詳細表示
│   │   │   └── Feedback/            # フィードバック
│   │   ├── hooks/
│   │   │   ├── useStreamingRecipes.ts  # ストリーミング状態管理
│   │   │   └── useRecipeGeneration.ts  # 通常生成管理
│   │   ├── services/
│   │   │   ├── websocketService.ts  # WebSocket通信
│   │   │   └── recipeService.ts     # REST API通信
│   │   ├── store/                   # Zustand状態管理
│   │   ├── types/                   # TypeScript型定義
│   │   └── styles/                  # Tailwind CSS
│   └── package.json
├── CLAUDE.md                        # 技術仕様書
└── README.md
```

## 🔍 トラブルシューティング

### Ollama の設定問題
Llama 3.1:8b モデルのダウンロードには時間がかかる場合があります：

```bash
# モデルの確認
ollama list

# モデルの再ダウンロード
ollama pull llama3.1:8b

# Ollama サービスの確認
ollama serve

# APIテスト
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1:8b",
  "prompt": "Hello",
  "stream": false
}'
```

### WebSocket接続エラー
```bash
# ポート確認
lsof -i :4000

# CORS設定確認（backend/.env）
FRONTEND_URL=http://localhost:5173

# ブラウザコンソールでWebSocket状態確認
# Network タブで WebSocket接続を監視
```

#### MongoDB 接続エラー
```bash
# MongoDB サービスの確認
brew services list | grep mongodb

# MongoDB の再起動
brew services restart mongodb-community

# 接続テスト
mongosh
```

#### Frontend ビルドエラー
```bash
# キャッシュクリア
cd frontend
rm -rf node_modules dist
npm install
npm run build
```

## 🎯 システム特徴

### パフォーマンス最適化
- ⚡ **詳細レシピの事前生成**: 選択後すぐに詳細表示
- 🔄 **WebSocketストリーミング**: リアルタイム進捗表示
- 🚀 **並列AI処理**: 3エージェント同時生成
- ⚡ **Vite高速ビルド**: 開発時のホットリロード

### セキュリティ機能
- 🛡️ **入力検証**: フロント・バック両方で実装
- 🔒 **CORS設定**: 適切な許可オリジン設定
- 🪖 **ヘッダーセキュリティ**: Helmet使用
- 📝 **エラーハンドリング**: 詳細ログと安全なエラー表示

### 監視・ログ機能
- 📊 **Winston構造化ログ**: レベル別ログ出力
- 🔌 **WebSocket接続ログ**: 接続・切断の追跡
- 🚨 **エラートラッキング**: LLM生成エラーの詳細記録

---

## 📄 ライセンス

MIT License

## 🤝 貢献

プルリクエストやIssueの報告を歓迎します。技術仕様書は `CLAUDE.md` を参照してください。

---

**Developed with ❤️ using Llama 3.1:8b & WebSocket Technology**