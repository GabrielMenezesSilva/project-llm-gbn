# Technical Documentation - ChatBot GBN

## System Architecture

### Technology Stack

- **Frontend**: Angular 19 (Standalone Components)
- **Backend**: Node.js + Express
- **Database**: SQLite + Prisma ORM
- **Communication Protocol**: REST API

### Architecture Diagram

```
[Client] <-- HTTP/HTTPS --> [Backend API] <-- Prisma --> [SQLite Database]
   |                              |
   |                              |
[Angular SPA] <-- WebSocket --> [Express Server]
```

## Current Implementations

### 1. Backend (Node.js + Express)

#### Route Structure

```javascript
// Authentication Routes
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET /api/auth/me

// Chat Routes
POST /api/prompts
GET /api/prompts
GET /api/prompts/:id/responses
POST /api/prompts/:id/responses
```

#### Implemented Middleware

- CORS ✅
- JSON Parser ✅
- Error Handling ✅
- Authentication ✅
- Validation ✅

#### Prisma Integration

- Schema defined with 1:N relationships between Prompt and Response
- Configured migrations for database versioning
- Prisma Client generated and configured for use

### 2. Frontend (Angular)

#### Components

- `ChatbotComponent`: Main standalone component
  - Local state management
  - REST API integration
  - Responsive UI/UX

#### Services

- `HttpClient`: For backend communication
- Reactive forms for user input

#### Styling

- SCSS with CSS variables
- Responsive design
- UI animations

### 3. Database (SQLite + Prisma)

#### Current Schema

```prisma
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String    // Password hash
  name          String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  prompts       Prompt[]  // Relationship with user prompts
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
  userId    Int       // User ID who created the prompt
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

## Authentication Implementation ✅

### 1. File Structure

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

### 2. Authentication Routes

```javascript
// Public routes
POST / api / auth / register;
POST / api / auth / login;
POST / api / auth / refresh;

// Protected routes
GET / api / auth / me;
POST / api / auth / logout;
```

### 3. Validations ✅

- Unique email
- Strong password (minimum 8 characters, numbers, letters)
- Password confirmation
- Valid email format
- Required name

### 4. Security ✅

- JWT tokens with expiration
- Refresh tokens
- Password hashing with bcrypt
- Protection against common attacks

## Next Technical Implementations

### 1. LLM Integration (Pending)

- [ ] Secure API keys configuration
- [ ] Response cache system
- [ ] API error handling
- [ ] Fallback system
- [ ] Request logging

### 2. Database Improvements

- [ ] Optimized indexes
- [ ] Backup system
- [ ] PostgreSQL migration (scalability)
- [ ] Soft delete implementation
- [ ] Response versioning system

### 3. Frontend

- [ ] State Management (NgRx)
- [ ] Module lazy loading
- [ ] PWA capabilities
- [ ] Unit tests (Jasmine/Karma)
- [ ] E2E tests (Cypress)

### 4. Backend

- [ ] Rate limiting
- [ ] Request validation
- [ ] Response caching
- [ ] Error monitoring
- [ ] Performance optimization

## Security Considerations

### Necessary Implementations

1. **Data Protection** ✅

   - Encryption in transit (HTTPS)
   - Input sanitization
   - Protection against XSS
   - CSRF tokens

2. **Authentication** ✅

   - JWT with refresh tokens
   - Password policies
   - Secure sessions

3. **Auditing**
   - Action logging
   - Change tracking
   - Security alerts

## Performance and Scalability

### Planned Optimizations

1. **Frontend**

   - Implementation of Service Workers
   - Asset optimization
   - Code splitting
   - Lazy loading

2. **Backend**

   - Caching with Redis
   - Load balancing
   - Connection pooling
   - Query optimization

3. **Database**
   - Sharding
   - Replication
   - Query optimization
   - Strategic indexing

## Monitoring and Logging

### Future Implementations

1. **Metrics**

   - Response time
   - Error rate
   - Resource usage
   - Health checks

2. **Logging**
   - Structured logs
   - Log rotation
   - Alerts
   - Dashboards

## Pending Technical Documentation

1. **API Documentation**

   - OpenAPI/Swagger
   - Postman Collection
   - Usage examples

2. **Architecture**

   - Detailed diagrams
   - Data flows
   - Technical decisions

3. **DevOps**
   - Deployment procedures
   - Environment configuration
   - Troubleshooting guide

# Detailed Implementation Plan

## 1. Initial Project Configuration

- Directory structure setup for `backend/` and `llm-gbn/` (frontend Angular).
- SQLite database setup with Prisma ORM.
- Initial schema creation in `backend/prisma/schema.prisma`.

## 2. Backend: API and Authentication

- Express server implementation in `backend/src/server.js`.
- Protected and public routes for authentication in `backend/src/routes/auth.routes.js`.
- Authentication controllers in `backend/src/controllers/auth.controller.js`.
- JWT authentication middleware in `backend/src/middleware/auth.middleware.js`.
- JWT and password utilitaries in `backend/src/utils/jwt.utils.js` and `backend/src/utils/password.utils.js`.
- Input data validation with express-validator in `backend/src/middleware/validate.middleware.js`.
- Main endpoints:
  - `POST /api/auth/register` (registration)
  - `POST /api/auth/login` (login)
  - `POST /api/auth/refresh` (refresh token)
  - `POST /api/auth/logout` (logout)
  - `GET /api/auth/me` (user data)
- JWT protection for prompts and responses.

## 3. Backend: Conversation Persistence

- Prompt and Response models creation in Prisma schema.
- Implementation of endpoints:
  - `POST /api/prompts` (saves prompt and automatic response)
  - `GET /api/prompts` (returns user's history)
  - `GET /api/prompts/:id/responses` (responses to a prompt)
  - `POST /api/prompts/:id/responses` (adds response to a prompt)
- Association of prompts with authenticated user via `userId`.

## 4. Frontend: Interface and Integration

- Chat component creation in `llm-gbn/src/app/components/chatbot/chatbot.component.ts`.
- API integration for prompt sending and response display.
- Automatic history loading on component load (`ngOnInit` + `loadChatHistory` method).
- Welcome message with user's name.
- Page update retention of history.

## 5. Frontend: French Translation

- Translation of all textual content in chat, login, and registration components to French.
- Placeholder, error message, button, and welcome message adjustments.
- Subscription button template correction to avoid display bugs.

## 6. Tests and Validations

- Manual tests for registration, login, prompt sending, and page update.
- Authentication and conversation persistence flow verification.
- Visual and functional form adjustments.

---

**Summary:**

- The backend was structured with JWT authentication, refresh token, route protection, and prompt/response persistence per user.
- The frontend was integrated to the API, translated to French, and adjusted to retain conversation history after page update.
- All changes were made incrementally, with explanations and validations at each step.

This plan can be presented to your coach to demonstrate mastery of each process part and justify the technical decisions made.
