import { OpenAIApi } from 'openai';
import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

class AvatarGeneratorService {
  private openai: OpenAIApi;

  constructor(openai: OpenAIApi) {
    this.openai = openai;
  }

  async generateCharacterAvatar(params: {
    name: string;
    characteristics: string[];
  }) {
    try {
      const prompt = `
        Crie um avatar de personagem infantil com as seguintes características:
        - Nome do personagem: ${params.name}
        - Características: ${params.characteristics.join(', ')}
        - Estilo: Desenho animado amigável e expressivo
        - Vista: Meio corpo, centralizado
        - Fundo: Simples e claro
        - Sem texto ou palavras
      `;

      const response = await this.openai.createImage({
        prompt,
        n: 1,
        size: "512x512",
        quality: "hd",
        style: "vivid"
      });

      if (!response.data.data[0]?.url) {
        throw new Error('URL do avatar não encontrada');
      }

      // Download e otimização do avatar
      const imageUrl = response.data.data[0].url;
      const imageBuffer = await this.downloadImage(imageUrl);
      const optimizedAvatar = await this.optimizeAvatar(imageBuffer);

      return optimizedAvatar;
    } catch (error) {
      logger.error('Erro ao gerar avatar:', error);
      throw error;
    }
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  private async optimizeAvatar(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
  }
}

export default AvatarGeneratorService;