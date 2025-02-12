import OpenAI from 'openai';
import { config } from '../config';
import { logger } from '../utils/logger';

export class OpenAIService {
  private openai: OpenAI;
  private maxRetries: number;
  private retryDelay: number;

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.organization,
    });

    this.maxRetries = config.openai.retry.maxAttempts;
    this.retryDelay = config.openai.retry.delay;
  }

  private async retry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        logger.warn(`Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < this.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }
      }
    }

    throw lastError;
  }

  async generateStory(prompt: string): Promise<string> {
    logger.info('Generating story with prompt:', prompt);

    const response = await this.retry(() => 
      this.openai.chat.completions.create({
        model: config.openai.models.text,
        messages: [
          {
            role: 'system',
            content: 'You are a creative children\'s book writer. Create engaging, age-appropriate stories.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
    );

    const story = response.choices[0]?.message?.content;
    if (!story) {
      throw new Error('Failed to generate story');
    }

    logger.info('Story generated successfully');
    return story;
  }

  async generateImage(prompt: string): Promise<string> {
    logger.info('Generating image with prompt:', prompt);

    const response = await this.retry(() =>
      this.openai.images.generate({
        model: config.openai.models.image,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
      })
    );

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('Failed to generate image');
    }

    logger.info('Image generated successfully');
    return imageUrl;
  }
}

export const openAIService = new OpenAIService();