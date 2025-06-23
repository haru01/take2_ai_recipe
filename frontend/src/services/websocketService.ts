import { io, Socket } from 'socket.io-client';
import { RecipeInput } from '../types/recipe.types';

export interface RecipeStreamChunk {
  agentType: 'classic' | 'fusion' | 'healthy';
  status: 'started' | 'progress' | 'completed' | 'error';
  content?: string;
  recipe?: any;
  progress?: number;
}

export interface StreamingCallbacks {
  onChunk: (chunk: RecipeStreamChunk) => void;
  onError: (error: string) => void;
  onComplete: () => void;
}

class WebSocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected && this.socket) {
        resolve();
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      
      this.socket = io(apiUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  generateRecipesStream(
    input: RecipeInput,
    callbacks: StreamingCallbacks
  ): string {
    if (!this.socket || !this.isConnected) {
      throw new Error('WebSocket not connected');
    }

    const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // リスナーを設定
    this.socket.on('recipe-chunk', (data: { requestId: string; chunk: RecipeStreamChunk }) => {
      if (data.requestId === requestId) {
        callbacks.onChunk(data.chunk);
      }
    });

    this.socket.on('recipe-error', (data: { requestId: string; error: string }) => {
      if (data.requestId === requestId) {
        callbacks.onError(data.error);
        this.cleanupListeners(requestId);
      }
    });

    this.socket.on('recipe-complete', (data: { requestId: string }) => {
      if (data.requestId === requestId) {
        callbacks.onComplete();
        this.cleanupListeners(requestId);
      }
    });

    // レシピ生成リクエストを送信
    this.socket.emit('generate-recipes', {
      input,
      requestId,
    });

    return requestId;
  }

  private cleanupListeners(requestId: string): void {
    if (this.socket) {
      this.socket.off('recipe-chunk');
      this.socket.off('recipe-error');
      this.socket.off('recipe-complete');
    }
  }

  isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

export const websocketService = new WebSocketService();