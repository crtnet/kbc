import { Configuration, OpenAIApi } from 'openai';
import config from '../config';
import logger from '../utils/logger';

class OpenAIService {
  private openai: OpenAIApi;

  constructor() {
    const configuration = new Configuration({
      apiKey: config.openai.apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateStory(params: {
    title: string;
    genre: string;
    theme: string;
    mainCharacter: string;
    setting: string;
    tone: string;
  }) {
    try {
      const prompt = `
      Crie uma história infantil em português com as seguintes características:
      - Título: ${params.title}
      - Gênero: ${params.genre}
      - Tema: ${params.theme}
      - Personagem Principal: ${params.mainCharacter}
      - Cenário: ${params.setting}
      - Tom: ${params.tone}
      
      A história deve:
      - Ter aproximadamente 500 palavras
      - Ser dividida em 5 páginas
      - Cada página deve ter um parágrafo curto
      - Ser adequada para crianças
      - Ter uma moral relacionada ao tema
      - Ser envolvente e criativa
      - Incluir diálogos
      - Ter um final feliz
    `;

      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um escritor especializado em histórias infantis. Crie histórias envolventes, adequadas para crianças, com lições de moral e finais felizes."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      if (!response.data.choices[0]?.message?.content) {
        throw new Error('Resposta vazia da OpenAI');
      }

      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error('Erro ao gerar história:', error);
      throw error;
    }
  }

  async generateImage(params: {
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

      return response.data.data[0].url;
    } catch (error) {
      logger.error('Erro ao gerar imagem:', error);
      throw error;
    }
  }
}

export default new OpenAIService();