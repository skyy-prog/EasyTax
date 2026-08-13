# EasyTax Frontend

EasyTax frontend is a React + Vite dashboard for tax and sales management. It connects to the EasyTax backend API for authentication, products, sales, expenses, documents, reports, and AI tax assistant chat.

## Setup

1. Install dependencies:

   npm install

2. Create environment file:

   - Copy `.env.example` to `.env`
   - Set API base URL:

     VITE_API_URL=http://localhost:5000/api

3. Start development server:

   npm run dev

## Build

Run a production build:

npm run build

## Important

The backend service must be running for this frontend to function correctly. Follow the backend README to start backend APIs before testing end-to-end features.
