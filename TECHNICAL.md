# Documentação Técnica - ChatBot GBN

## Arquitetura do Sistema

### Stack Tecnológica

- **Frontend**: Angular 19 (Standalone Components)
- **Backend**: Node.js + Express
- **Database**: SQLite + Prisma ORM
- **Protocolo de Comunicação**: REST API

### Diagrama de Arquitetura

```
[Cliente] <-- HTTP/HTTPS --> [Backend API] <-- Prisma --> [SQLite Database]
   |                              |
   |                              |
[Angular SPA] <-- WebSocket --> [Express Server]
```

## Implementações Atuais

### 1. Backend (Node.js + Express)

#### Estrutura de Rotas

```javascript
// Rotas de Autenticação
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me

// Rotas de Chat
POST /api/prompts
GET /api/prompts
GET /api/prompts/:id/responses
POST /api/prompts/:id/responses
```

#### Middleware Implementado

- CORS ✅
- JSON Parser ✅
- Error Handling ✅
- Authentication ✅
- Validation ✅

#### Integração com Prisma

- Schema definido com relacionamentos 1:N entre Prompt e Response
- Migrations configuradas para versionamento do banco
- Prisma Client gerado e configurado para uso

### 2. Frontend (Angular)

#### Componentes

- `ChatbotComponent`: Componente principal standalone
  - Gerenciamento de estado local
  - Integração com API REST
  - UI/UX responsiva

#### Serviços

- `HttpClient`: Para comunicação com backend
- Formulários reativos para input do usuário

#### Estilização

- SCSS com variáveis CSS
- Design responsivo
- Animações de UI

### 3. Banco de Dados (SQLite + Prisma)

#### Schema Atual

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String    // Hash da senha
  name          String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  prompts       Prompt[]  // Relacionamento com os prompts do usuário
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Prompt {
  id        Int       @id @default(autoincrement())
  content   String
  timestamp DateTime  @default(now())
  userId    Int       // ID do usuário que criou o prompt
  user      User      @relation(fields: [userId], references: [id])
  responses Response[]
}

model Response {
  id        Int      @id @default(autoincrement())
  content   String
  timestamp DateTime @default(now())
  prompt    Prompt   @relation(fields: [promptId], references: [id])
  promptId  Int
}

enum Role {
  USER
  ADMIN
}
```

## Implementação de Autenticação ✅

### 1. Estrutura de Arquivos

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── utils/
│   │   ├── jwt.utils.js
│   │   └── password.utils.js
│   └── server.js
```

### 2. Rotas de Autenticação

```javascript
// Rotas públicas
POST / api / auth / register;
POST / api / auth / login;
POST / api / auth / refresh;

// Rotas protegidas
GET / api / auth / me;
POST / api / auth / logout;
```

### 3. Validações ✅

- Email único
- Senha forte (mínimo 8 caracteres, números, letras)
- Confirmação de senha
- Formato de email válido
- Nome obrigatório

### 4. Segurança ✅

- Tokens JWT com expiração
- Refresh tokens
- Hash de senha com bcrypt
- Proteção contra ataques comuns

## Próximas Implementações Técnicas

### 1. Integração com LLM (Pendente)

- [ ] Configuração de API keys seguras
- [ ] Sistema de cache para respostas
- [ ] Tratamento de erros da API
- [ ] Sistema de fallback
- [ ] Logging de requisições

### 2. Melhorias no Banco de Dados

- [ ] Índices otimizados
- [ ] Sistema de backup
- [ ] Migração para PostgreSQL (escalabilidade)
- [ ] Implementação de soft delete
- [ ] Sistema de versionamento de respostas

### 3. Frontend

- [ ] State Management (NgRx)
- [ ] Lazy Loading de módulos
- [ ] PWA capabilities
- [ ] Testes unitários (Jasmine/Karma)
- [ ] Testes E2E (Cypress)

### 4. Backend

- [ ] Validação de entrada com Zod
- [ ] Documentação com Swagger/OpenAPI
- [ ] Logging estruturado
- [ ] Monitoramento de performance
- [ ] Containerização com Docker

### 5. DevOps

- [ ] CI/CD pipeline
- [ ] Ambiente de staging
- [ ] Monitoramento com Prometheus
- [ ] Logging com ELK Stack
- [ ] Backup automatizado

## Considerações de Segurança

### Implementações Necessárias

1. **Proteção de Dados** ✅

   - Criptografia em trânsito (HTTPS)
   - Sanitização de inputs
   - Proteção contra XSS
   - CSRF tokens

2. **Autenticação** ✅

   - JWT com refresh tokens
   - Políticas de senha
   - Sessões seguras

3. **Auditoria**
   - Logging de ações
   - Rastreamento de mudanças
   - Alertas de segurança

## Performance e Escalabilidade

### Otimizações Planejadas

1. **Frontend**

   - Implementação de Service Workers
   - Otimização de assets
   - Code splitting
   - Lazy loading

2. **Backend**

   - Caching com Redis
   - Load balancing
   - Connection pooling
   - Query optimization

3. **Database**
   - Sharding
   - Replicação
   - Query optimization
   - Indexação estratégica

## Monitoramento e Logging

### Implementações Futuras

1. **Métricas**

   - Tempo de resposta
   - Taxa de erro
   - Uso de recursos
   - Health checks

2. **Logging**
   - Logs estruturados
   - Rotação de logs
   - Alertas
   - Dashboards

## Documentação Técnica Pendente

1. **API Documentation**

   - OpenAPI/Swagger
   - Postman Collection
   - Exemplos de uso

2. **Arquitetura**

   - Diagramas detalhados
   - Fluxos de dados
   - Decisões técnicas

3. **DevOps**
   - Procedimentos de deploy
   - Configuração de ambiente
   - Troubleshooting guide

# Roteiro Detalhado das Implementações Realizadas

## 1. Configuração Inicial do Projeto

- Estruturação dos diretórios `backend/` e `llm-gbn/` (frontend Angular).
- Configuração do banco de dados SQLite com Prisma ORM.
- Criação do schema inicial no arquivo `backend/prisma/schema.prisma`.

## 2. Backend: API e Autenticação

- Implementação do servidor Express em `backend/src/server.js`.
- Criação das rotas protegidas e públicas para autenticação em `backend/src/routes/auth.routes.js`.
- Implementação dos controladores de autenticação em `backend/src/controllers/auth.controller.js`.
- Criação do middleware de autenticação JWT em `backend/src/middleware/auth.middleware.js`.
- Implementação dos utilitários de JWT e senha em `backend/src/utils/jwt.utils.js` e `backend/src/utils/password.utils.js`.
- Validação de dados de entrada com express-validator em `backend/src/middleware/validate.middleware.js`.
- Endpoints principais:
  - `POST /api/auth/register` (registro)
  - `POST /api/auth/login` (login)
  - `POST /api/auth/refresh` (refresh token)
  - `POST /api/auth/logout` (logout)
  - `GET /api/auth/me` (dados do usuário)
- Proteção das rotas de prompts e respostas com autenticação JWT.

## 3. Backend: Persistência de Conversas

- Criação dos modelos `Prompt` e `Response` no schema Prisma.
- Implementação dos endpoints:
  - `POST /api/prompts` (salva prompt e resposta automática)
  - `GET /api/prompts` (retorna histórico do usuário autenticado)
  - `GET /api/prompts/:id/responses` (respostas de um prompt)
  - `POST /api/prompts/:id/responses` (adiciona resposta a um prompt)
- Associação dos prompts ao usuário autenticado via `userId`.

## 4. Frontend: Interface e Integração

- Criação do componente principal de chat em `llm-gbn/src/app/components/chatbot/chatbot.component.ts`.
- Integração com a API para envio de prompts e exibição de respostas.
- Implementação da busca automática do histórico de conversas ao carregar o componente (`ngOnInit` + método `loadChatHistory`).
- Exibição da mensagem de boas-vindas personalizada com o nome do usuário.
- Ajuste para que, ao atualizar a página, o histórico seja mantido.

## 5. Frontend: Internacionalização para Francês

- Tradução de todo o conteúdo textual dos componentes de chat, login e registro para francês.
- Ajuste dos placeholders, mensagens de erro, botões e mensagens de boas-vindas.
- Correção do template do botão de inscrição para evitar bugs de exibição.

## 6. Testes e Validações

- Testes manuais de registro, login, envio de prompts e atualização de página.
- Verificação do fluxo de autenticação e persistência de conversas.
- Ajuste visual e funcional dos formulários.

---

**Resumo:**

- O backend foi estruturado com autenticação JWT, refresh token, proteção de rotas e persistência de prompts/respostas por usuário.
- O frontend foi integrado à API, traduzido para francês e ajustado para manter o histórico de conversas após atualização da página.
- Todas as alterações foram feitas de forma incremental, com explicações e validações a cada etapa.

Esse roteiro pode ser apresentado ao seu coach para demonstrar domínio sobre cada parte do processo e justificar as decisões técnicas tomadas.
