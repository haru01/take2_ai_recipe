import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { StreamingRecipeGenerationService } from './streamingRecipeGenerationService';
import { RecipeInput } from '../types';

export const setupWebSocket = (io: Server) => {
  const streamingService = new StreamingRecipeGenerationService();

  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('generate-recipes', async (data: { input: RecipeInput; requestId: string }) => {
      try {
        logger.info(`Starting recipe generation for request: ${data.requestId}`);
        
        await streamingService.generateRecipesStream(
          data.input,
          data.requestId,
          (chunk) => {
            socket.emit('recipe-chunk', {
              requestId: data.requestId,
              chunk,
            });
          },
          (error) => {
            socket.emit('recipe-error', {
              requestId: data.requestId,
              error: error.message,
            });
          },
          () => {
            socket.emit('recipe-complete', {
              requestId: data.requestId,
            });
          }
        );
      } catch (error) {
        logger.error('WebSocket recipe generation error:', error);
        socket.emit('recipe-error', {
          requestId: data.requestId,
          error: 'レシピ生成中にエラーが発生しました',
        });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  return io;
};