import { openaiService } from '../openai.service';
import { openai } from '../../config/openai';

jest.mock('../../config/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
    images: {
      generate: jest.fn(),
    },
  },
  openaiConfig: {
    textModel: {
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      temperature: 0.7,
    },
    imageModel: {
      model: 'dall-e-3',
      quality: 'standard',
      size: '1024x1024',
    },
    validation: {
      maxRetries: 3,
      retryDelay: 1000,
    },
  },
}));

describe('OpenAIService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateStory', () => {
    const storyParams = {
      title: 'O Pequeno Aventureiro',
      genre: 'Aventura',
      theme: 'Amizade',
      mainCharacter: 'João',
      setting: 'Floresta Mágica',
      tone: 'Alegre',
    };

    it('deve gerar uma história com sucesso', async () => {
      const mockStory = 'Era uma vez...';
      (openai.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [{ message: { content: mockStory } }],
      });

      const result = await openaiService.generateStory(storyParams);

      expect(result).toBe(mockStory);
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
    });

    it('deve falhar ao gerar história quando a API retorna resposta vazia', async () => {
      (openai.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      });

      await expect(openaiService.generateStory(storyParams)).rejects.toThrow(
        'Resposta vazia da OpenAI API'
      );
    });

    it('deve tentar novamente após erro temporário', async () => {
      (openai.chat.completions.create as jest.Mock)
        .mockRejectedValueOnce(new Error('Erro temporário'))
        .mockResolvedValueOnce({
          choices: [{ message: { content: 'História após retry' } }],
        });

      const result = await openaiService.generateStory(storyParams);

      expect(result).toBe('História após retry');
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('generateImage', () => {
    const imagePrompt = 'Um gato laranja brincando com um novelo de lã';

    it('deve gerar uma imagem com sucesso', async () => {
      const mockImageUrl = 'http://exemplo.com/imagem.jpg';
      (openai.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: mockImageUrl }],
      });

      const result = await openaiService.generateImage(imagePrompt);

      expect(result).toBe(mockImageUrl);
      expect(openai.images.generate).toHaveBeenCalledTimes(1);
    });

    it('deve falhar ao gerar imagem quando a API retorna resposta vazia', async () => {
      (openai.images.generate as jest.Mock).mockResolvedValueOnce({
        data: [{ url: null }],
      });

      await expect(openaiService.generateImage(imagePrompt)).rejects.toThrow(
        'URL da imagem não encontrada na resposta'
      );
    });
  });

  describe('validateAPIKey', () => {
    it('deve retornar true quando a chave API é válida', async () => {
      (openai.chat.completions.create as jest.Mock).mockResolvedValueOnce({
        choices: [{ message: { content: 'OK' } }],
      });

      const result = await openaiService.validateAPIKey();

      expect(result).toBe(true);
    });

    it('deve retornar false quando a chave API é inválida', async () => {
      (openai.chat.completions.create as jest.Mock).mockRejectedValueOnce(
        new Error('Invalid API key')
      );

      const result = await openaiService.validateAPIKey();

      expect(result).toBe(false);
    });
  });
});