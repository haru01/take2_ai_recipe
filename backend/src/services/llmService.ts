import { Ollama } from 'ollama';
import { logger } from '../utils/logger';
import { LLMGenerationOptions } from '../types';

export class LLMService {
  private ollama: Ollama;

  constructor() {
    this.ollama = new Ollama({
      host: process.env.OLLAMA_HOST || 'http://localhost:11434'
    });
  }

  async generateRecipe(prompt: string, options?: LLMGenerationOptions): Promise<string> {
    try {
      logger.info('Generating recipe with LLM', { 
        promptLength: prompt.length,
        options 
      });

      const response = await this.ollama.generate({
        model: 'llama3.1:8b',
        prompt,
        options: {
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 0.9,
          num_predict: options?.maxTokens || 1500,
        },
        stream: false,
      });

      logger.info('LLM generation completed', { 
        responseLength: response.response.length 
      });

      return response.response;
    } catch (error) {
      logger.error('LLM generation error:', error);
      throw new Error(`レシピ生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateRecipeDetail(prompt: string): Promise<string> {
    return this.generateRecipe(prompt, {
      temperature: 0.6,
      maxTokens: 2500,
      topP: 0.8,
    });
  }

  async generateRecipeStream(
    prompt: string, 
    onChunk: (content: string) => void,
    options?: LLMGenerationOptions
  ): Promise<void> {
    try {
      logger.info('Starting streaming recipe generation', { 
        promptLength: prompt.length,
        options 
      });

      const stream = await this.ollama.generate({
        model: 'llama3.1:8b',
        prompt,
        options: {
          temperature: options?.temperature || 0.7,
          top_p: options?.topP || 0.9,
          num_predict: options?.maxTokens || 1500,
        },
        stream: true,
      });

      for await (const chunk of stream) {
        if (chunk.response) {
          onChunk(chunk.response);
        }
      }

      logger.info('LLM streaming generation completed');
    } catch (error) {
      logger.error('LLM streaming generation error:', error);
      throw new Error(`ストリーミング生成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async checkModelAvailability(): Promise<boolean> {
    try {
      const models = await this.ollama.list();
      const hasLlama = models.models.some(model => 
        model.name.includes('llama3.1:8b') || model.name.includes('llama3.1')
      );
      
      if (!hasLlama) {
        logger.warn('Llama 3.1:8b model not found. Available models:', 
          models.models.map(m => m.name)
        );
      }
      
      return hasLlama;
    } catch (error) {
      logger.error('Failed to check model availability:', error);
      return false;
    }
  }
}