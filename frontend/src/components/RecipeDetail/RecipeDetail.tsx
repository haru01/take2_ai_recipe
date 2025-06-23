import React, { useEffect } from 'react';
import { Recipe } from '../../types/recipe.types';
import { useRecipeDetail } from '../../hooks/useRecipeDetail';
import { useRecipeStore } from '../../store/recipeStore';

interface Props {
  recipe: Recipe;
  onLoaded: () => void;
  onShowFeedback: () => void;
  onStartOver: () => void;
}

export const RecipeDetail: React.FC<Props> = ({ 
  recipe, 
  onLoaded, 
  onShowFeedback, 
  onStartOver 
}) => {
  const { recipeDetail, loading } = useRecipeStore();
  const { loadRecipeDetail } = useRecipeDetail();

  useEffect(() => {
    if (recipe) {
      loadRecipeDetail(recipe.id, recipe.title, recipe.agentType);
    }
  }, [recipe, loadRecipeDetail]);

  useEffect(() => {
    if (recipeDetail && !loading) {
      onLoaded();
    }
  }, [recipeDetail, loading, onLoaded]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="loading-spinner w-8 h-8"></div>
        <span className="ml-3 text-gray-600">詳細レシピを生成中...</span>
      </div>
    );
  }

  if (!recipeDetail) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">レシピの詳細を取得できませんでした</p>
        <button onClick={onStartOver} className="btn-primary mt-4">
          最初からやり直す
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {recipeDetail.title}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          {recipeDetail.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{recipeDetail.servings}</div>
          <div className="text-sm text-gray-600">人分</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{recipeDetail.prepTime}</div>
          <div className="text-sm text-gray-600">準備時間（分）</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">{recipeDetail.totalTime}</div>
          <div className="text-sm text-gray-600">総調理時間（分）</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">材料</h3>
          <div className="space-y-3">
            {recipeDetail.ingredients.map((ingredient, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                <span className="font-medium">{ingredient.name}</span>
                <span className="text-gray-600">
                  {ingredient.amount} {ingredient.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">栄養情報</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold text-gray-900">{recipeDetail.nutritionInfo.calories}</div>
              <div className="text-sm text-gray-600">カロリー</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold text-gray-900">{recipeDetail.nutritionInfo.protein}g</div>
              <div className="text-sm text-gray-600">タンパク質</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold text-gray-900">{recipeDetail.nutritionInfo.carbs}g</div>
              <div className="text-sm text-gray-600">炭水化物</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-lg font-semibold text-gray-900">{recipeDetail.nutritionInfo.fat}g</div>
              <div className="text-sm text-gray-600">脂質</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">作り方</h3>
        <div className="space-y-6">
          {recipeDetail.steps.map((step, index) => (
            <div key={step.stepNumber} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-semibold">
                {step.stepNumber}
              </div>
              <div className="flex-1">
                <p className="text-gray-900 leading-relaxed">{step.instruction}</p>
                {(step.duration || step.temperature) && (
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    {step.duration && (
                      <span>⏱️ {step.duration}分</span>
                    )}
                    {step.temperature && (
                      <span>🌡️ {step.temperature}</span>
                    )}
                  </div>
                )}
                {step.tips && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    💡 {step.tips}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {recipeDetail.tips.length > 0 && (
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">調理のコツ</h3>
          <div className="space-y-3">
            {recipeDetail.tips.map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">💡</span>
                <p className="text-gray-700">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <button
          onClick={onShowFeedback}
          className="btn-primary px-8 py-3"
        >
          フィードバックを送る
        </button>
        <button
          onClick={() => {
            onStartOver();
            // フォームまでスクロールバック
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
          className="btn-outline px-8 py-3"
        >
          新しいレシピを生成
        </button>
      </div>
    </div>
  );
};