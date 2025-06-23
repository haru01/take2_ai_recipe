import React from 'react';
import { Recipe } from '../../types/recipe.types';
import { useRecipeStore } from '../../store/recipeStore';

interface Props {
  recipes: Recipe[];
  onSelect: (recipe: Recipe) => void;
  onStartOver: () => void;
}

const agentTypeLabels = {
  classic: 'クラシックシェフ',
  fusion: 'フュージョンシェフ',
  healthy: 'ヘルシーシェフ'
};

const agentTypeDescriptions = {
  classic: '伝統的で家庭的な料理を得意とするシェフです',
  fusion: '異なる文化を組み合わせた創造的な料理を提案します',
  healthy: '栄養バランスと健康を重視したレシピを提案します'
};

const agentTypeColors = {
  classic: 'bg-amber-50 border-amber-200 text-amber-800',
  fusion: 'bg-purple-50 border-purple-200 text-purple-800',
  healthy: 'bg-green-50 border-green-200 text-green-800'
};

export const RecipeSelection: React.FC<Props> = ({ recipes, onSelect, onStartOver }) => {
  const { setSelectedRecipe } = useRecipeStore();

  const handleSelect = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    onSelect(recipe);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          AIが提案する3つのレシピ
        </h2>
        <p className="text-gray-600">
          お気に入りのレシピを選んで詳細を確認しましょう
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className="recipe-card group"
            onClick={() => handleSelect(recipe)}
          >
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${agentTypeColors[recipe.agentType]}`}>
              {agentTypeLabels[recipe.agentType]}
            </div>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
              {recipe.title}
            </h3>
            
            <p className="text-gray-600 mb-4 leading-relaxed">
              {recipe.description}
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                調理時間: {recipe.cookingTime}分
              </div>
              
              <div className="flex items-start text-sm text-gray-500">
                <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <div className="font-medium">主な材料:</div>
                  <div>{recipe.mainIngredients.join(', ')}</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 mb-6">
              {recipe.features.map((feature, index) => (
                <div key={index} className="flex items-center text-sm">
                  <svg className="w-3 h-3 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
            
            <div className="text-xs text-gray-400 mb-4">
              {agentTypeDescriptions[recipe.agentType]}
            </div>
            
            <button className="btn-primary w-full group-hover:bg-primary-700 transition-colors">
              詳細レシピを見る
            </button>
          </div>
        ))}
      </div>

      <div className="text-center pt-6">
        <button
          onClick={() => {
            onStartOver();
            // フォームまでスクロールバック
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
          }}
          className="btn-outline"
        >
          別の条件で再生成する
        </button>
      </div>
    </div>
  );
};