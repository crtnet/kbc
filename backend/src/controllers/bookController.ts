import { Request, Response } from 'express';
import Book from '../models/book';
import OpenAIService from '../services/openai';
import PDFGeneratorService from '../services/pdfGenerator';
import ImageGeneratorService from '../services/imageGenerator';
import AvatarGeneratorService from '../services/avatarGenerator';
import logger from '../utils/logger';

// Função para criar livro
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, genre, theme, mainCharacter, setting, tone } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      console.error('User ID não encontrado no request');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    console.log('Criando livro:', {
      title,
      genre,
      theme,
      mainCharacter,
      setting,
      tone,
      userId
    });

    // Validar campos obrigatórios
    if (!title || !genre || !theme || !mainCharacter || !setting || !tone) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios' });
    }

    const book = new Book({
      title,
      author: userId,
      genre,
      theme,
      mainCharacter,
      setting,
      tone,
      status: 'generating'
    });

    await book.save();
    console.log('Livro criado:', book._id);

    // Iniciar geração em background
    generateBookContent(book._id).catch(err => {
      console.error('Erro na geração em background:', err);
    });

    res.status(201).json({
      message: 'Livro criado com sucesso! O conteúdo está sendo gerado.',
      bookId: book._id
    });
  } catch (error) {
    console.error('Erro ao criar livro:', error);
    res.status(500).json({ message: 'Erro ao criar livro' });
  }
};

// Função para buscar um livro específico
export const getBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      console.error('User ID não encontrado no request');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const book = await Book.findById(id);
    
    if (!book) {
      return res.status(404).json({ message: 'Livro não encontrado' });
    }

    if (book.author.toString() !== userId) {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(book);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ message: 'Erro ao buscar livro' });
  }
};

// Função para listar livros do usuário
export const getUserBooks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      console.error('User ID não encontrado no request');
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const books = await Book.find({ author: userId })
      .sort({ createdAt: -1 })
      .select('-content.story');
    
    res.json(books);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ message: 'Erro ao buscar livros' });
  }
};

// Função para gerar conteúdo do livro
async function generateBookContent(bookId: string) {
  try {
    console.log('Iniciando geração de conteúdo para o livro:', bookId);
    
    const book = await Book.findById(bookId);
    if (!book) {
      console.error('Livro não encontrado:', bookId);
      return;
    }

    // Gerar história
    logger.info('Gerando história...');
    const content = await OpenAIService.generateStory({
      title: book.title,
      genre: book.genre,
      theme: book.theme,
      mainCharacter: book.mainCharacter,
      setting: book.setting,
      tone: book.tone
    });

    // 2. Gerar avatar do personagem
    logger.info('Gerando avatar...');
    const avatar = await AvatarGeneratorService.generateCharacterAvatar({
      name: book.mainCharacter,
      characteristics: [book.genre, book.theme, book.tone]
    });

    // 3. Gerar imagens para cada página
    logger.info('Gerando imagens das páginas...');
    const pages = content.split('\n\n');
    const images = await Promise.all(
      pages.map(page => ImageGeneratorService.generatePageImage({
        scene: page,
        style: book.genre,
        character: book.mainCharacter
      }))
    );

    // 4. Gerar PDF
    logger.info('Gerando PDF...');
    const pdfPath = await PDFGeneratorService.generateBookPDF({
      id: book._id.toString(),
      title: book.title,
      content: pages,
      images,
      mainCharacter: {
        name: book.mainCharacter,
        avatar
      }
    });

    // 5. Atualizar livro no banco
    logger.info('Salvando alterações...');
    book.content = content;
    book.pages = pages;
    book.images = images;
    book.avatar = avatar;
    book.pdfPath = pdfPath;
    book.status = 'completed';
    await book.save();

    logger.info('Livro gerado com sucesso!');

    console.log('Livro gerado com sucesso:', bookId);
  } catch (error) {
    console.error('Erro ao gerar conteúdo:', error);
    
    const book = await Book.findById(bookId);
    if (book) {
      book.status = 'failed';
      await book.save();
    }
  }
}