import OpenAI from 'openai';
import { config } from '../config';
import { Logger } from '../utils/logger';

export class OpenAIService {
  private openai: OpenAI;
  private logger: Logger;

  constructor() {
    if (!config.openai.apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
      organization: config.openai.organization,
      maxRetries: config.openai.maxRetries,
      timeout: config.openai.timeout
    });

    this.logger = new Logger('OpenAIService');
  }

  async generateStory(prompt: string): Promise<string> {
    try {
      this.logger.info('Generating story with prompt:', { prompt });

      const completion = await this.openai.chat.completions.create({
        model: config.openai.models.text,
        messages: [
          {
            role: 'system',
            content: 'You are a creative children\'s book writer. Create engaging, age-appropriate stories that are both entertaining and educational.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const story = completion.choices[0]?.message?.content;
      
      if (!story) {
        throw new Error('No story generated');
      }

      this.logger.info('Story generated successfully');
      return story;

    } catch (error) {
      this.logger.error('Error generating story:', error);
      throw error;
    }
  }

  async generateImage(prompt: string): Promise<string> {
    try {
      this.logger.info('Generating image with prompt:', { prompt });

      const response = await this.openai.images.generate({
        model: config.openai.models.image,
        prompt,
        n: 1,
        size: config.openai.imageSize as OpenAI.ImageGenerateParams['size'],
        quality: config.openai.imageQuality as OpenAI.ImageGenerateParams['quality'],
        response_format: 'url'
      });

      const imageUrl = response.data[0]?.url;

      if (!imageUrl) {
        throw new Error('No image generated');
      }

      this.logger.info('Image generated successfully');
      return imageUrl;

    } catch (error) {
      this.logger.error('Error generating image:', error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService();