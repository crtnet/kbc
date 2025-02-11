# Changelog
Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [0.4.0] - 2025-02-11

### Adicionado
- Geração de PDF dos livros com PDFKit
- Sistema de geração de imagens usando DALL-E 3
- Criação de avatar para personagens principais
- Novo modelo de dados para suportar imagens e PDFs
- Sistema de status mais detalhado para geração de conteúdo
- Otimização de imagens com Sharp

### Alterado
- Modelo do livro atualizado para suportar novas funcionalidades
- Sistema de armazenamento de imagens otimizado
- Processo de geração de conteúdo mais robusto

## [0.3.0] - 2025-02-11

### Changed
- Atualizado modelo OpenAI para gpt-3.5-turbo
- Melhorada a qualidade da geração de histórias
- Otimizado o prompt do sistema

## [0.2.0] - 2025-02-11

### Added
- Adicionada tela ViewBook ao navegador
- Configurada rota de visualização de livro

### Fixed
- Corrigido erro de navegação após criação do livro

## [0.1.0] - 2025-02-10

### Adicionado
- Configuração inicial do projeto
- Estrutura básica do backend
- Estrutura básica do frontend
- Sistema de autenticação
- Geração de livros usando IA
- Documentação inicial

### Corrigido
- Problema com token inválido na geração de livros
  - Centralização da configuração JWT
  - Melhor validação de usuário

### Alterado
- Refatoração do serviço OpenAI
- Melhoria na documentação
- Organização do código em módulos