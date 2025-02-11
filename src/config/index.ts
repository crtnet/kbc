import dotenv from 'dotenv';

dotenv.config();

export const config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORGANIZATION,
    models: {
      text: 'gpt-4-turbo-preview',
      image: 'dall-e-3'
    },
    maxRetries: 3,
    timeout: 30000,
    imageSize: '1024x1024',
    imageQuality: 'standard'
  },
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};