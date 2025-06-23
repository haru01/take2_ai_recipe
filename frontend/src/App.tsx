import React, { useState } from 'react';
import { RecipeInput } from './components/RecipeInput/RecipeInput';
import { RecipeSelection } from './components/RecipeSelection/RecipeSelection';
import { RecipeDetail } from './components/RecipeDetail/RecipeDetail';
import { Feedback } from './components/Feedback/Feedback';
import { useRecipeStore } from './store/recipeStore';
import { Recipe } from './types/recipe.types';

type AppStep = 'input' | 'detail' | 'feedback';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('input');
  const [showRecipes, setShowRecipes] = useState(false);
  const { recipes, selectedRecipe, recipeDetail, loading, error, clearState } = useRecipeStore();

  const handleRecipeInputSubmit = () => {
    console.log('handleRecipeInputSubmit called, recipes:', recipes);
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
    clearState();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            AI Recipe Generator
          </h1>
          <p className="text-gray-600 mt-2">
            AIが提案する3つのレシピから、お気に入りを見つけましょう
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 常に入力フォームを表示 */}
        {currentStep === 'input' && (
          <RecipeInput onSubmit={handleRecipeInputSubmit} />
        )}

        {/* ローディング表示 */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8"></div>
            <span className="ml-3 text-gray-600">レシピを生成中...</span>
          </div>
        )}

        {/* レシピ選択を入力フォームの下に表示 */}
        {!loading && showRecipes && recipes.length > 0 && currentStep === 'input' && (
          <div id="recipe-results" className="mt-12">
            <RecipeSelection
              recipes={recipes}
              onSelect={handleRecipeSelect}
              onStartOver={handleStartOver}
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