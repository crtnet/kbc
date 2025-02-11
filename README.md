# Kids Book Creator

Uma aplicação para criar livros infantis personalizados usando IA.

## Tecnologias

- Frontend: React Native/Expo com TypeScript
- Backend: Node.js com TypeScript
- IA: OpenAI (GPT-4 e DALL-E 3)

## Configuração

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   OPENAI_API_KEY=sua_chave_api
   OPENAI_ORGANIZATION=seu_id_organizacao
   PORT=3000
   HOST=localhost
   LOG_LEVEL=info
   ```

## Desenvolvimento

Para iniciar o servidor em modo desenvolvimento:
```bash
npm run dev
```

## Testes

Para executar os testes:
```bash
npm test
```

## Estrutura do Projeto

```
src/
  ├── config/         # Configurações
  ├── services/       # Serviços (OpenAI, PDF, etc)
  ├── utils/          # Utilitários
  └── tests/          # Testes
```

## Recursos

- Geração de histórias usando GPT-4
- Geração de imagens usando DALL-E 3
- Sistema de log detalhado
- Testes automatizados

## Próximos Passos

- [ ] Implementar geração de PDF
- [ ] Implementar geração de avatar
- [ ] Adicionar suporte a temas visuais
- [ ] Implementar compartilhamento de livros
- [ ] Adicionar suporte a múltiplos idiomas