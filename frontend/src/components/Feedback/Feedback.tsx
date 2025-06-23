import React, { useState } from 'react';
import { Recipe, Feedback as FeedbackType } from '../../types/recipe.types';
import { useFeedback } from '../../hooks/useFeedback';

interface Props {
  recipe: Recipe;
  onSubmit: () => void;
  onStartOver: () => void;
}

const feedbackReasons = [
  { id: 'taste', label: '味が好み' },
  { id: 'easy', label: '作りやすそう' },
  { id: 'ingredients', label: '材料が手に入りやすい' },
  { id: 'healthy', label: 'ヘルシー' },
  { id: 'unique', label: 'ユニーク・面白い' },
  { id: 'presentation', label: '見た目が良い' },
  { id: 'difficult', label: '難しすぎる' },
  { id: 'time', label: '時間がかかりすぎる' },
  { id: 'expensive', label: '材料が高い' },
  { id: 'notInteresting', label: '興味がわかない' },
];

export const Feedback: React.FC<Props> = ({ recipe, onSubmit, onStartOver }) => {
  const { submitFeedback, loading } = useFeedback();
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [futureInterest, setFutureInterest] = useState<FeedbackType['futureInterest']>('interested');
  const [rating, setRating] = useState<number>(0);

  const handleReasonToggle = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedReasons.length === 0) {
      alert('少なくとも1つの理由を選択してください');
      return;
    }

    const feedbackData: FeedbackType = {
      recipeId: recipe.id,
      reasons: selectedReasons.map(id => 
        feedbackReasons.find(reason => reason.id === id)?.label || id
      ),
      comment: comment.trim() || undefined,
      futureInterest,
      rating: rating > 0 ? rating : undefined,
      createdAt: new Date(),
    };

    try {
      await submitFeedback(feedbackData);
      onSubmit();
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('フィードバックの送信に失敗しました');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          フィードバックをお聞かせください
        </h2>
        <p className="text-gray-600">
          「{recipe.title}」についてのご感想をお聞かせください
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            評価 *
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={`text-2xl transition-colors ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ⭐
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {rating > 0 ? `${rating}/5` : '星をクリックして評価してください'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            どのような理由でこのレシピを評価しましたか？ *
          </label>
          <div className="grid grid-cols-2 gap-3">
            {feedbackReasons.map((reason) => (
              <label
                key={reason.id}
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedReasons.includes(reason.id)
                    ? 'bg-primary-50 border-primary-300 text-primary-800'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedReasons.includes(reason.id)}
                  onChange={() => handleReasonToggle(reason.id)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                  selectedReasons.includes(reason.id)
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-300'
                }`}>
                  {selectedReasons.includes(reason.id) && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className="text-sm">{reason.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="futureInterest" className="block text-sm font-medium text-gray-700 mb-2">
            今後このようなレシピに興味がありますか？
          </label>
          <select
            id="futureInterest"
            className="select"
            value={futureInterest}
            onChange={(e) => setFutureInterest(e.target.value as FeedbackType['futureInterest'])}
          >
            <option value="interested">はい、興味があります</option>
            <option value="notInterested">いいえ、興味がありません</option>
            <option value="requestChange">改善してほしいことがあります</option>
          </select>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            その他のコメント（任意）
          </label>
          <textarea
            id="comment"
            className="textarea"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="このレシピについての詳細なご感想や改善提案などをお聞かせください"
            rows={4}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/1000文字
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            type="submit"
            disabled={loading || selectedReasons.length === 0}
            className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="loading-spinner w-5 h-5 mr-3"></div>
                送信中...
              </span>
            ) : (
              'フィードバックを送信'
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              onStartOver();
              // フォームまでスクロールバック
              setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }, 100);
            }}
            className="btn-outline flex-1 py-3"
          >
            新しいレシピを生成
          </button>
        </div>
      </form>
    </div>
  );
};