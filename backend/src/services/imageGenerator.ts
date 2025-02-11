import { OpenAIApi } from 'openai';
import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

class ImageGeneratorService {
  private openai: OpenAIApi;

  constructor(openai: OpenAIApi) {
    this.openai = openai;
  }

  async generatePageImage(params: {
    scene: string;
    style: string;
    character: string;
  }) {
    try {
      const prompt = `
        Crie uma ilustração infantil para um livro com as seguintes características:
        - Cena: ${params.scene}
        - Personagem principal: ${params.character}
        - Estilo: ${params.style}
        - Estilo artístico: Desenho animado amigável para crianças
        - Cores: Vibrantes e alegres
        - Sem texto ou palavras na imagem
      `;

      const response = await this.openai.createImage({
        prompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid"
      });

      if (!response.data.data[0]?.url) {
        throw new Error('URL da imagem não encontrada');
      }

      // Download e otimização da imagem
      const imageUrl = response.data.data[0].url;
      const imageBuffer = await this.downloadImage(imageUrl);
      const optimizedImage = await this.optimizeImage(imageBuffer);

      return optimizedImage;
    } catch (error) {
      logger.error('Erro ao gerar imagem:', error);
      throw error;
    }
  }

  private async downloadImage(url: string): Promise<Buffer> {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  private async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({ quality: 85 })
      .toBuffer();
  }
}

export default ImageGeneratorService;