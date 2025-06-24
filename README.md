# AI Recipe Generator

Llama 3.1:8b を使用した料理レシピ生成システム

## 概要

このアプリケーションは、AI技術を活用して3つの異なるタイプのシェフ（クラシック、フュージョン、ヘルシー）からレシピを提案するシステムです。ユーザーの条件に基づいてAIが最適なレシピを生成し、詳細な作り方まで提供します。

## 技術スタック

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Zustand (状態管理)
- Vite (ビルドツール)
- Axios (API通信)

### Backend
- Node.js + Express + TypeScript
- MongoDB (データベース)
- Ollama (Llama 3.1:8b)
- Winston (ログ)

## 主な機能

1. **レシピ入力フォーム**
   - 料理のテーマ指定
   - 調理時間・難易度の選択
   - 特別な要望や避けたい食材の指定

2. **AI レシピ生成**
   - 3種類のシェフタイプから同時生成
   - クラシック、フュージョン、ヘルシーの特徴を活かしたレシピ

3. **詳細レシピ表示**
   - 材料リスト
   - 手順詳細
   - 栄養情報
   - 調理のコツ

4. **フィードバック機能**
   - レシピ評価
   - 改善提案
   - 今後の参考データ収集

## セットアップ

### 前提条件
- Node.js 18+
- MongoDB (ローカルまたはクラウド)
- Ollama (Llama 3.1:8b)

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
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

### 環境変数設定

#### Backend (.env)
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=mongodb://localhost:27017/recipe-generator
OLLAMA_HOST=http://localhost:11434
ALLOWED_ORIGINS=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000
VITE_ENVIRONMENT=development
```

## API エンドポイント

### レシピ生成
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

### レシピ詳細取得
```http
GET /api/recipes/:id?title=料理名&agentType=classic
```

### フィードバック送信
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

### ディレクトリ構造
```
take2_ai_recipe/
├── backend/
│   ├── src/
│   │   ├── controllers/    # APIコントローラー
│   │   ├── services/       # ビジネスロジック
│   │   ├── models/         # データモデル
│   │   ├── routes/         # ルート定義
│   │   ├── middleware/     # ミドルウェア
│   │   ├── types/          # 型定義
│   │   └── utils/          # ユーティリティ
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Reactコンポーネント
│   │   ├── hooks/          # カスタムフック
│   │   ├── services/       # API通信
│   │   ├── store/          # 状態管理
│   │   ├── types/          # 型定義
│   │   └── styles/         # スタイル
│   └── package.json
└── README.md
```

## トラブルシューティング

#### Ollama の設定
Llama 3.1:8b モデルのダウンロードには時間がかかる場合があります：

```bash
# モデルの確認
ollama list

# モデルの再ダウンロード
ollama pull llama3.1:8b

# Ollama サービスの確認
ollama serve
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

## ライセンス

MIT License

## 貢献

プルリクエストや Issue の報告を歓迎します。