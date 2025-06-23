import React, { useState } from 'react';
import { RecipeInput } from './components/RecipeInput/RecipeInput';
import { StreamingRecipeInput } from './components/RecipeInput/StreamingRecipeInput';
import { RecipeSelection } from './components/RecipeSelection/RecipeSelection';
import { RecipeDetail } from './components/RecipeDetail/RecipeDetail';
import { Feedback } from './components/Feedback/Feedback';
import { useRecipeStore } from './store/recipeStore';
import { Recipe } from './types/recipe.types';

type AppStep = 'input' | 'detail' | 'feedback';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [showRecipes, setShowRecipes] = useState(false);
  const [useStreaming, setUseStreaming] = useState(true); // ストリーミング機能の切り替え
  const [streamingRecipes, setStreamingRecipes] = useState<Recipe[]>([]);
  const { recipes, selectedRecipe, recipeDetail, loading, error, clearState } = useRecipeStore();

  const handleRecipeInputSubmit = () => {
    console.log('handleRecipeInputSubmit called, recipes:', recipes);
    setShowRecipes(true);
  };

  const handleStreamingRecipesGenerated = (generatedRecipes: Recipe[]) => {
    console.log('Streaming recipes generated:', generatedRecipes);
    setStreamingRecipes(generatedRecipes);
    setShowRecipes(true);
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setCurrentStep('detail');
  };

  const handleRecipeDetailLoaded = () => {
    // Detail loaded, user can now view the recipe
  };

  const handleShowFeedback = () => {
    setCurrentStep('feedback');
  };

  const handleFeedbackSubmit = () => {
    setCurrentStep('input');
    setShowRecipes(false);
    clearState();
  };

  const handleStartOver = () => {
    setCurrentStep('input');
    setShowRecipes(false);
    setStreamingRecipes([]);
    clearState();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Recipe Generator
              </h1>
              <p className="text-gray-600 mt-2">
                AIが提案する3つのレシピから、お気に入りを見つけましょう
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">ストリーミング:</span>
              <button
                onClick={() => setUseStreaming(!useStreaming)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  useStreaming 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-300 text-gray-700'
                }`}
              >
                {useStreaming ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 入力フォーム（ストリーミング切り替え対応） */}
        {currentStep === 'input' && (
          useStreaming ? (
            <StreamingRecipeInput onRecipesGenerated={handleStreamingRecipesGenerated} />
          ) : (
            <RecipeInput onSubmit={handleRecipeInputSubmit} />
          )
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8"></div>
            <span className="ml-3 text-gray-600">レシピを生成中...</span>
          </div>
        )}

        {/* レシピ選択を入力フォームの下に表示 */}
        {!loading && showRecipes && currentStep === 'input' && (
          <div id="recipe-results" className="mt-12">
            <RecipeSelection
              recipes={useStreaming ? streamingRecipes : recipes}
              onSelect={handleRecipeSelect}
              onStartOver={handleStartOver}
              isStreamingMode={useStreaming}
            />
          </div>
        )}

        {/* レシピ詳細表示 */}
        {currentStep === 'detail' && selectedRecipe && (
          <div className="mt-8">
            <RecipeDetail
              recipe={selectedRecipe}
              onLoaded={handleRecipeDetailLoaded}
              onShowFeedback={handleShowFeedback}
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {/* フィードバック表示 */}
        {currentStep === 'feedback' && selectedRecipe && (
          <div className="mt-8">
            <Feedback
              recipe={selectedRecipe}
              onSubmit={handleFeedbackSubmit}
              onStartOver={handleStartOver}
            />
          </div>
        )}
      </main>

      <footer className="bg-white border-t mt-16">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            © 2024 AI Recipe Generator. Powered by Llama 3.1
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;