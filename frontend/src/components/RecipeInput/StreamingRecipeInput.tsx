import React, { useState } from 'react';
import { RecipeInput as RecipeInputType } from '../../types/recipe.types';
import { useStreamingRecipes } from '../../hooks/useStreamingRecipes';
import { StreamingDisplay } from '../StreamingDisplay/StreamingDisplay';

interface Props {
  onRecipesGenerated: (recipes: any[]) => void;
}

export const StreamingRecipeInput: React.FC<Props> = ({ onRecipesGenerated }) => {
  const { 
    generateRecipes, 
    isStreaming, 
    agents, 
    completedRecipes, 
    error, 
    isConnected 
  } = useStreamingRecipes();
  
  const [formData, setFormData] = useState<RecipeInputType>({
    theme: '',
    cookingTime: '60min',
    difficulty: 'intermediate',
    specialRequests: [],
    avoidIngredients: '',
    priority: 'appearance'
  });
  const [specialRequestInput, setSpecialRequestInput] = useState('');

  // レシピが完成したときの処理
  React.useEffect(() => {
    if (completedRecipes.length === 3 && !isStreaming) {
      onRecipesGenerated(completedRecipes);
      
      // レシピ結果にスクロール
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
  }, [completedRecipes, isStreaming, onRecipesGenerated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.theme.trim()) {
      alert('料理のテーマを入力してください');
      return;
    }

    if (!isConnected) {
      alert('サーバーに接続されていません。しばらく待ってから再試行してください。');
      return;
    }

    try {
      await generateRecipes(formData);
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 入力フォーム */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          どんな料理を作りたいですか？
        </h2>
        
        {/* 接続状態表示 */}
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          isConnected 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {isConnected ? '🟢 リアルタイム生成可能' : '🔴 サーバーに接続中...'}
        </div>
        
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
              disabled={isStreaming}
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
                disabled={isStreaming}
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
                disabled={isStreaming}
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
              disabled={isStreaming}
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
                disabled={isStreaming}
              />
              <button
                type="button"
                onClick={addSpecialRequest}
                className="btn-outline px-4"
                disabled={!specialRequestInput.trim() || isStreaming}
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
                      disabled={isStreaming}
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
              disabled={isStreaming}
            />
          </div>

          <button
            type="submit"
            disabled={isStreaming || !formData.theme.trim() || !isConnected}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isStreaming ? (
              '🚀 リアルタイム生成中...'
            ) : (
              '🎯 AIレシピをリアルタイム生成'
            )}
          </button>
        </form>

        {/* エラー表示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* ストリーミング表示 */}
      <StreamingDisplay agents={agents} isStreaming={isStreaming} />
    </div>
  );
};