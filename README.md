# ChatBot GBN

## Visão Geral

O ChatBot GBN é uma aplicação de chat inteligente desenvolvida para uso interno na GBN, utilizando tecnologias modernas e boas práticas de desenvolvimento.

## Tecnologias Utilizadas

### Frontend

- Angular 19 (Standalone Components)
- SCSS para estilização
- RxJS para programação reativa
- Angular Material (planejado)

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite (desenvolvimento)
- PostgreSQL (planejado para produção)

### Autenticação

- JWT (JSON Web Tokens) ✅
- Refresh Tokens ✅
- Bcrypt para hash de senhas ✅
- Middleware de autenticação ✅

## Funcionalidades Implementadas

### 1. Sistema de Chat

- Interface de chat em tempo real
- Histórico de conversas
- Persistência de dados
- Relacionamento entre prompts e respostas

### 2. Banco de Dados

- Schema otimizado com Prisma
- Relacionamentos 1:N
- Timestamps automáticos
- Migrations configuradas

### 3. API REST

- Endpoints para prompts e respostas
- Validação de dados
- Tratamento de erros
- CORS configurado

### 4. Sistema de Autenticação ✅

- Registro de usuários
- Login com JWT
- Refresh tokens
- Proteção de rotas
- Validações de segurança

## Funcionalidades em Desenvolvimento

### 1. Sistema de Autenticação

- Registro de usuários
- Login com JWT
- Refresh tokens
- Proteção de rotas
- Validações de segurança

### 2. Integração com LLM

- Configuração de API keys
- Sistema de cache
- Tratamento de erros
- Fallback system

## Como Executar

### Pré-requisitos

- Node.js (v18 ou superior)
- npm ou yarn
- Angular CLI
- SQLite

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd llm-gbn
npm install
ng serve
```

### Banco de Dados

```bash
cd backend
npx prisma studio
```

## Estrutura do Projeto

### Backend

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── prompt.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── prompt.routes.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   └── password.utils.js
│   └── server.js
├── prisma/
│   └── schema.prisma
└── package.json
```

### Frontend

```
llm-gbn/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   └── assets/
└── package.json
```

## Documentação

### Técnica

- [TECHNICAL.md](./TECHNICAL.md) - Documentação técnica detalhada
- [API.md](./API.md) - Documentação da API (em desenvolvimento)

### Usuário

- [USER_GUIDE.md](./USER_GUIDE.md) - Guia do usuário (em desenvolvimento)

## Contribuição

### Padrões de Código

- ESLint para JavaScript/TypeScript
- Prettier para formatação
- Conventional Commits
- Branch Protection

### Processo de Desenvolvimento

1. Criar branch feature/fix
2. Desenvolver funcionalidade
3. Testes unitários
4. Pull Request
5. Code Review
6. Merge

## Segurança

### Implementações

- CORS configurado ✅
- Validação de inputs ✅
- Sanitização de dados ✅
- Rate limiting (planejado)

### Boas Práticas

- Variáveis de ambiente ✅
- Logging seguro ✅
- Auditoria de código
- Backups regulares

## Roadmap

### Fase 1 - MVP (Em Progresso)

- [x] Estrutura básica
- [x] Sistema de chat
- [x] Persistência de dados
- [x] Autenticação de usuários
- [x] Proteção de rotas

### Fase 2 - Melhorias

- [ ] Integração com LLM
- [ ] Cache de respostas
- [ ] Interface responsiva
- [ ] Testes automatizados

### Fase 3 - Produção

- [ ] Migração para PostgreSQL
- [ ] CI/CD pipeline
- [ ] Monitoramento
- [ ] Documentação completa

## Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

## Contato

Para mais informações, entre em contato com a equipe de desenvolvimento da GBN.
