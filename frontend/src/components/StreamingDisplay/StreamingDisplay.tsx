import React from 'react';

interface AgentProgress {
  agentType: 'classic' | 'fusion' | 'healthy';
  status: 'idle' | 'started' | 'progress' | 'completed' | 'error';
  content: string;
  progress: number;
}

interface StreamingDisplayProps {
  agents: AgentProgress[];
  isStreaming: boolean;
}

const agentLabels = {
  classic: '🍳 クラシックシェフ',
  fusion: '🌍 フュージョンシェフ',
  healthy: '🥗 ヘルシーシェフ',
};

const statusEmojis = {
  idle: '⭕',
  started: '🏃‍♂️',
  progress: '⚡',
  completed: '✅',
  error: '❌',
};

export const StreamingDisplay: React.FC<StreamingDisplayProps> = ({ 
  agents, 
  isStreaming 
}) => {
  if (!isStreaming && agents.every(agent => agent.status === 'idle')) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          レシピ生成中...
        </h2>
        <p className="text-gray-600">
          3人のシェフが同時にレシピを考えています
        </p>
      </div>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.agentType} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {statusEmojis[agent.status]}
                </span>
                <span className="font-medium text-gray-800">
                  {agentLabels[agent.agentType]}
                </span>
                <span className="text-sm text-gray-500">
                  {agent.status === 'idle' && '待機中'}
                  {agent.status === 'started' && '開始しました'}
                  {agent.status === 'progress' && '考え中...'}
                  {agent.status === 'completed' && '完成！'}
                  {agent.status === 'error' && 'エラーが発生しました'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {agent.progress}%
              </div>
            </div>

            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  agent.status === 'completed' 
                    ? 'bg-green-500' 
                    : agent.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${agent.progress}%` }}
              />
            </div>

            {/* ストリーミングコンテンツ */}
            {agent.content && (
              <div className="bg-gray-50 rounded p-3 max-h-40 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {agent.content}
                  {agent.status === 'progress' && (
                    <span className="animate-pulse">▌</span>
                  )}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 全体の進捗 */}
      <div className="mt-6 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            全体の進捗
          </span>
          <span className="text-sm text-gray-600">
            {Math.round(
              agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
            )}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
            style={{
              width: `${Math.round(
                agents.reduce((sum, agent) => sum + agent.progress, 0) / agents.length
              )}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};