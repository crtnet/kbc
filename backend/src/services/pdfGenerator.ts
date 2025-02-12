import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

class PDFGeneratorService {
  async generateBookPDF(book: {
    id: string;
    title: string;
    content: string[];
    images: string[];
    mainCharacter: {
      name: string;
      avatar?: string;
    };
  }) {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      // Configurar diretório de saída
      const outputDir = path.join(__dirname, '../public/books');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, `${book.id}.pdf`);
      const writeStream = fs.createWriteStream(outputPath);

      // Pipe do PDF para o arquivo
      doc.pipe(writeStream);

      // Capa
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .text(book.title, { align: 'center' });

      if (book.mainCharacter.avatar) {
        doc.image(book.mainCharacter.avatar, {
          fit: [250, 250],
          align: 'center'
        });
      }

      // Conteúdo
      book.content.forEach((page, index) => {
        doc.addPage();
        
        // Adicionar imagem da página se existir
        if (book.images[index]) {
          doc.image(book.images[index], {
            fit: [500, 300],
            align: 'center'
          });
        }

        doc.fontSize(12)
           .font('Helvetica')
           .moveDown()
           .text(page, {
             align: 'justify',
             columns: 1
           });
      });

      // Finalizar PDF
      doc.end();

      return new Promise((resolve, reject) => {
        writeStream.on('finish', () => {
          resolve(outputPath);
        });
        writeStream.on('error', reject);
      });
    } catch (error) {
      logger.error('Erro ao gerar PDF:', error);
      throw error;
    }
  }
}

export default new PDFGeneratorService();