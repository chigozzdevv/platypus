import OpenAI from 'openai';
import { env } from '@/shared/config/env';
import { logger } from '@/shared/utils/logger';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  async generateCompletion(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
    temperature: number = 0.1
  ): Promise<string> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return content;
    } catch (error) {
      logger.error('OpenAI completion failed', { error, model, messagesCount: messages.length });
      throw error;
    }
  }

  async generateStructuredCompletion<T>(
    messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    responseFormat: any,
    model: 'gpt-4o' | 'gpt-4o-mini' = 'gpt-4o-mini',
    temperature: number = 0.1
  ): Promise<T> {
    try {
      const response = await this.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      return JSON.parse(content) as T;
    } catch (error) {
      logger.error('OpenAI structured completion failed', { error, model, messagesCount: messages.length });
      throw error;
    }
  }
}

export const openaiClient = new OpenAIClient();