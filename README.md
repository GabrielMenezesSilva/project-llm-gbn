# ChatBot GBN

## Overview

ChatBot GBN is an intelligent chat application developed for internal use at GBN, utilizing modern technologies and development best practices.

## Technologies Used

### Frontend

- Angular 19 (Standalone Components)
- SCSS for styling
- RxJS for reactive programming
- Angular Material (planned)

### Backend

- Node.js
- Express.js
- Prisma ORM
- SQLite (development)
- PostgreSQL (planned for production)

### Authentication

- JWT (JSON Web Tokens) ✅
- Refresh Tokens ✅
- Bcrypt for password hashing ✅
- Authentication middleware ✅

## Implemented Features

### 1. Chat System

- Real-time chat interface
- Simple text-based conversation display
- Data persistence
- Relationship between prompts and responses

### 2. Database

- Optimized schema with Prisma
- 1:N relationships
- Automatic timestamps
- Configured migrations

### 3. REST API

- Endpoints for prompts and responses
- Data validation
- Error handling
- Configured CORS

### 4. Authentication System ✅

- User registration
- JWT login
- Refresh tokens
- Route protection
- Security validations

## Features Under Development

### 1. LLM Integration

- API keys configuration
- Cache system
- Error handling
- Fallback system

## How to Run

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
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
cd frontend
npm install
ng serve
```

### Database

```bash
cd backend
npx prisma studio
```

## Project Structure

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
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   └── assets/
└── package.json
```

## Documentation

### Technical

- [TECHNICAL.md](./TECHNICAL.md) - Detailed technical documentation
- [API.md](./API.md) - API documentation (under development)

### User

- [USER_GUIDE.md](./USER_GUIDE.md) - User guide (under development)

## Contributing

### Code Standards

- ESLint for JavaScript/TypeScript
- Prettier for formatting
- Conventional Commits
- Branch Protection

### Development Process

1. Create feature/fix branch
2. Develop functionality
3. Unit tests
4. Pull Request
5. Code Review
6. Merge

## Security

### Implementations

- Configured CORS ✅
- Input validation ✅
- Data sanitization ✅
- Rate limiting (planned)

### Best Practices

- Environment variables ✅
- Secure logging ✅
- Code auditing
- Regular backups

## Roadmap

### Phase 1 - MVP (In Progress)

- [x] Basic structure
- [x] Chat system
- [x] Data persistence
- [x] Authentication system

## License

This project is proprietary and confidential. All rights reserved.

## Contact

For more information, contact the GBN development team.
