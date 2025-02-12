import { openai, openaiConfig } from '../config/openai';
import { ChatCompletion } from 'openai/resources/chat';
import { ImagesResponse } from 'openai/resources/images';
import { logger } from '../utils/logger';

interface StoryParams {
  title: string;
  genre: string;
  theme: string;
  mainCharacter: string;
  setting: string;
  tone: string;
}

class OpenAIService {
  private async retryOperation<T>(
    operation: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      if (retryCount >= openaiConfig.validation.maxRetries) {
        logger.error('OpenAI API error:', error);
        throw error;
      }

      await new Promise(resolve => 
        setTimeout(resolve, openaiConfig.validation.retryDelay)
      );

      return this.retryOperation(operation, retryCount + 1);
    }
  }

  public async generateStory(params: StoryParams): Promise<string> {
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

    logger.info('Gerando história com prompt:', { ...params });

    try {
      const completion = await this.retryOperation<ChatCompletion>(() =>
        openai.chat.completions.create({
          messages: [
            { role: 'system', content: 'Você é um escritor de histórias infantis experiente.' },
            { role: 'user', content: prompt }
          ],
          model: openaiConfig.textModel.model,
          max_tokens: openaiConfig.textModel.maxTokens,
          temperature: openaiConfig.textModel.temperature,
        })
      );

      const story = completion.choices[0]?.message?.content;
      if (!story) {
        throw new Error('Resposta vazia da OpenAI API');
      }

      logger.info('História gerada com sucesso');
      return story;
    } catch (error) {
      logger.error('Erro ao gerar história:', error);
      throw new Error('Falha ao gerar história');
    }
  }

  public async generateImage(prompt: string): Promise<string> {
    logger.info('Gerando imagem com prompt:', prompt);

    try {
      const response = await this.retryOperation<ImagesResponse>(() =>
        openai.images.generate({
          prompt,
          model: openaiConfig.imageModel.model,
          quality: openaiConfig.imageModel.quality,
          size: openaiConfig.imageModel.size,
          n: 1,
        })
      );

      const imageUrl = response.data[0]?.url;
      if (!imageUrl) {
        throw new Error('URL da imagem não encontrada na resposta');
      }

      logger.info('Imagem gerada com sucesso');
      return imageUrl;
    } catch (error) {
      logger.error('Erro ao gerar imagem:', error);
      throw new Error('Falha ao gerar imagem');
    }
  }

  public async validateAPIKey(): Promise<boolean> {
    logger.info('Validando chave API da OpenAI');

    try {
      await this.retryOperation(() =>
        openai.chat.completions.create({
          messages: [{ role: 'user', content: 'Teste de conexão' }],
          model: openaiConfig.textModel.model,
          max_tokens: 5,
        })
      );

      logger.info('Chave API validada com sucesso');
      return true;
    } catch (error) {
      logger.error('Erro ao validar chave API:', error);
      return false;
    }
  }
}

export const openaiService = new OpenAIService();