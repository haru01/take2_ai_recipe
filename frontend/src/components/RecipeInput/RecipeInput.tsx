import React, { useState } from 'react';
import { RecipeInput as RecipeInputType } from '../../types/recipe.types';
import { useRecipeGeneration } from '../../hooks/useRecipeGeneration';

interface Props {
  onSubmit: () => void;
}

export const RecipeInput: React.FC<Props> = ({ onSubmit }) => {
  const { generateRecipes, loading } = useRecipeGeneration();
  const [formData, setFormData] = useState<RecipeInputType>({
    theme: '',
    cookingTime: '60min',
    difficulty: 'intermediate',
    specialRequests: [],
    avoidIngredients: '',
    priority: 'appearance'
  });
  const [specialRequestInput, setSpecialRequestInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.theme.trim()) {
      alert('料理のテーマを入力してください');
      return;
    }

    try {
      const result = await generateRecipes(formData);
      console.log('Generated recipes result:', result);
      
      if (result && result.length > 0) {
        onSubmit();
        
        // レシピ生成後にスムーズにスクロール
        setTimeout(() => {
          const recipeSection = document.getElementById('recipe-results');
          if (recipeSection) {
            recipeSection.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'start' 
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error('Recipe generation failed:', error);
      alert('レシピの生成に失敗しました。もう一度お試しください。');
    }
  };

  const addSpecialRequest = () => {
    if (specialRequestInput.trim() && !formData.specialRequests.includes(specialRequestInput.trim())) {
      setFormData({
        ...formData,
        specialRequests: [...formData.specialRequests, specialRequestInput.trim()]
      });
      setSpecialRequestInput('');
    }
  };

  const removeSpecialRequest = (index: number) => {
    setFormData({
      ...formData,
      specialRequests: formData.specialRequests.filter((_, i) => i !== index)
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSpecialRequest();
    }
  };

  return (
    <div className="card p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        どんな料理を作りたいですか？
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
            料理のテーマ *
          </label>
          <input
            id="theme"
            type="text"
            className="input"
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
            placeholder="例: 和風パスタ、ヘルシーサラダ、お祝い料理"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700 mb-2">
              調理時間
            </label>
            <select
              id="cookingTime"
              className="select"
              value={formData.cookingTime}
              onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value as RecipeInputType['cookingTime'] })}
            >
              <option value="30min">30分以内</option>
              <option value="60min">1時間以内</option>
              <option value="unlimited">時間制限なし</option>
            </select>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              難易度
            </label>
            <select
              id="difficulty"
              className="select"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as RecipeInputType['difficulty'] })}
            >
              <option value="beginner">初心者向け</option>
              <option value="intermediate">中級者向け</option>
              <option value="advanced">上級者向け</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
            重視したいポイント
          </label>
          <select
            id="priority"
            className="select"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as RecipeInputType['priority'] })}
          >
            <option value="appearance">見た目の美しさ</option>
            <option value="nutrition">栄養バランス</option>
            <option value="quick">手軽さ・時短</option>
            <option value="unique">独創性・ユニークさ</option>
          </select>
        </div>

        <div>
          <label htmlFor="specialRequest" className="block text-sm font-medium text-gray-700 mb-2">
            特別な要望（任意）
          </label>
          <div className="flex gap-2">
            <input
              id="specialRequest"
              type="text"
              className="input flex-1"
              value={specialRequestInput}
              onChange={(e) => setSpecialRequestInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="例: 低カロリー、グルテンフリー、子供向け"
            />
            <button
              type="button"
              onClick={addSpecialRequest}
              className="btn-outline px-4"
              disabled={!specialRequestInput.trim()}
            >
              追加
            </button>
          </div>
          {formData.specialRequests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {formData.specialRequests.map((request, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                >
                  {request}
                  <button
                    type="button"
                    onClick={() => removeSpecialRequest(index)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="avoidIngredients" className="block text-sm font-medium text-gray-700 mb-2">
            避けたい食材（任意）
          </label>
          <textarea
            id="avoidIngredients"
            className="textarea"
            value={formData.avoidIngredients}
            onChange={(e) => setFormData({ ...formData, avoidIngredients: e.target.value })}
            placeholder="例: ナッツ、乳製品、辛い食材"
            rows={3}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !formData.theme.trim()}
          className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="loading-spinner w-5 h-5 mr-3"></div>
              レシピを生成中...
            </span>
          ) : (
            'AIレシピを生成する'
          )}
        </button>
      </form>
    </div>
  );
};