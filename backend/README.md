# EasyTax Backend

Express + MongoDB backend for EasyTax. It provides authentication, products, sales, expenses, document management, daily summaries, and Gemini-powered tax assistant chat.

## Prerequisites

- Node.js 18+
- MongoDB (local instance or MongoDB Atlas URI)

## Setup

1. Install dependencies:

npm install

2. Configure environment:

- Copy .env.example to .env
- Fill your values, especially MONGO_URI, JWT_SECRET, and GEMINI_API_KEY

3. Start development server:

npm run dev

Server runs at http://localhost:5000 by default.

## Environment Variables

- PORT
- MONGO_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- GEMINI_API_KEY
- CLIENT_URL
- MAX_UPLOAD_MB

## API Endpoints

Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

Products
- POST /api/products
- GET /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

Sales
- POST /api/sales
- GET /api/sales/today
- GET /api/sales?from=YYYY-MM-DD&to=YYYY-MM-DD

Expenses
- POST /api/expenses
- GET /api/expenses?from=YYYY-MM-DD&to=YYYY-MM-DD
- DELETE /api/expenses/:id

Documents
- POST /api/documents (multipart/form-data, field: file, optional fileType)
- GET /api/documents
- DELETE /api/documents/:id

Summary
- GET /api/summary/today
- POST /api/summary/generate
- GET /api/summary/history?days=30

Chat
- POST /api/chat
