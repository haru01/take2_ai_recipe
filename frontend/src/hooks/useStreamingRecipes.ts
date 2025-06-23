import { useState, useCallback, useRef, useEffect } from 'react';
import { websocketService, RecipeStreamChunk } from '../services/websocketService';
import { RecipeInput, Recipe } from '../types/recipe.types';

interface AgentProgress {
  agentType: 'classic' | 'fusion' | 'healthy';
  status: 'idle' | 'started' | 'progress' | 'completed' | 'error';
  content: string;
  recipe?: Recipe;
  progress: number;
}

interface StreamingState {
  isStreaming: boolean;
  isConnected: boolean;
  agents: AgentProgress[];
  completedRecipes: Recipe[];
  error: string | null;
}

export const useStreamingRecipes = () => {
  const [state, setState] = useState<StreamingState>({
    isStreaming: false,
    isConnected: false,
    agents: [
      { agentType: 'classic', status: 'idle', content: '', progress: 0 },
      { agentType: 'fusion', status: 'idle', content: '', progress: 0 },
      { agentType: 'healthy', status: 'idle', content: '', progress: 0 },
    ],
    completedRecipes: [],
    error: null,
  });

  const currentRequestId = useRef<string | null>(null);

  // WebSocket接続
  const connect = useCallback(async () => {
    try {
      await websocketService.connect();
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        error: 'WebSocket接続に失敗しました' 
      }));
    }
  }, []);

  // 自動接続
  useEffect(() => {
    connect();
    return () => {
      websocketService.disconnect();
    };
  }, [connect]);

  const generateRecipes = useCallback(async (input: RecipeInput) => {
    if (!websocketService.isConnectedToServer()) {
      setState(prev => ({ 
        ...prev, 
        error: 'サーバーに接続されていません' 
      }));
      return;
    }

    // 状態をリセット
    setState(prev => ({
      ...prev,
      isStreaming: true,
      error: null,
      completedRecipes: [],
      agents: prev.agents.map(agent => ({
        ...agent,
        status: 'idle',
        content: '',
        progress: 0,
        recipe: undefined,
      })),
    }));

    try {
      const requestId = websocketService.generateRecipesStream(input, {
        onChunk: (chunk: RecipeStreamChunk) => {
          setState(prev => ({
            ...prev,
            agents: prev.agents.map(agent => {
              if (agent.agentType === chunk.agentType) {
                const updatedAgent = {
                  ...agent,
                  status: chunk.status,
                  progress: chunk.progress || agent.progress,
                };

                if (chunk.content) {
                  updatedAgent.content = chunk.content;
                }

                if (chunk.recipe) {
                  updatedAgent.recipe = chunk.recipe;
                }

                return updatedAgent;
              }
              return agent;
            }),
          }));

          // 完成したレシピを追加
          if (chunk.status === 'completed' && chunk.recipe) {
            setState(prev => ({
              ...prev,
              completedRecipes: [...prev.completedRecipes, chunk.recipe],
            }));
          }
        },
        onError: (error: string) => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
            error,
          }));
        },
        onComplete: () => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
          }));
        },
      });

      currentRequestId.current = requestId;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isStreaming: false,
        error: 'レシピ生成の開始に失敗しました',
      }));
    }
  }, []);

  const resetState = useCallback(() => {
    setState(prev => ({
      ...prev,
      agents: prev.agents.map(agent => ({
        ...agent,
        status: 'idle',
        content: '',
        progress: 0,
        recipe: undefined,
      })),
      completedRecipes: [],
      error: null,
      isStreaming: false,
    }));
  }, []);

  return {
    ...state,
    generateRecipes,
    resetState,
    connect,
  };
};