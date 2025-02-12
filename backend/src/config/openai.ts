import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY não está definida no arquivo .env');
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiConfig = {
  // Configurações para geração de texto
  textModel: {
    model: 'gpt-3.5-turbo',
    maxTokens: 1000,
    temperature: 0.7,
  },
  // Configurações para geração de imagens
  imageModel: {
    model: 'dall-e-3',
    quality: 'standard',
    size: '1024x1024',
  },
  // Configurações para validação e retry
  validation: {
    maxRetries: 3,
    retryDelay: 1000,
  },
};