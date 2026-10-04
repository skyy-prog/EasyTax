# EasyTax Frontend

EasyTax frontend is a React + Vite dashboard for tax and sales management. It connects to the EasyTax backend API for authentication, products, sales, expenses, documents, reports, and AI tax assistant chat.

## Setup

1. Install dependencies:

   npm install

2. Create environment file:

   - Copy `.env.example` to `.env`
   - Set API base URL:

     VITE_API_URL=http://localhost:5000/api

   For the deployed frontend, set `VITE_API_URL` to the deployed backend URL ending in `/api`.

3. Start development server:

   npm run dev

   The development server uses `http://localhost:5000/api` by default.

   To test a production build locally, create `frontend/.env.local` with:

   VITE_API_URL=http://localhost:5000/api

   Then run `npm run build` and `npm run preview`.

## Build

Run a production build:

npm run build

## Important

The backend service must be running for this frontend to function correctly. Follow the backend README to start backend APIs before testing end-to-end features.
