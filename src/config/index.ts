import dotenv from 'dotenv';
import { Configuration } from 'openai';

dotenv.config();

export const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    configuration: new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
      organization: process.env.OPENAI_ORGANIZATION,
    }),
    models: {
      text: 'gpt-4-turbo-preview',
      image: 'dall-e-3',
    },
    retry: {
      maxAttempts: 3,
      delay: 1000,
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
  },
};