# EasyTax Production Deployment

## Required Runtime

- Node.js 18 or newer
- MongoDB Atlas or another production MongoDB instance
- A deployed frontend URL for `CLIENT_URL`
- A deployed backend API URL for `VITE_API_URL`

## Backend Environment

Set these on the backend host:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=a-long-random-secret-at-least-32-characters
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key
CLIENT_URL=https://your-frontend.example.com
MAX_UPLOAD_MB=5
UPLOAD_DIR=uploads
```

`CLIENT_URL` can contain comma-separated origins if you deploy preview and production frontends.

## Frontend Environment

Set this on the frontend host:

```env
VITE_API_URL=https://your-backend.example.com/api
```

## Build And Start Commands

Backend:

```sh
npm ci --omit=dev
npm start
```

Frontend:

```sh
npm ci
npm run build
```

Publish the frontend `dist` directory.

## Health Check

Use either endpoint:

- `GET /health`
- `GET /api/health`

## File Uploads

Uploaded documents are stored on disk. Use a persistent disk for `backend/uploads` or set `UPLOAD_DIR` to the mounted persistent directory on your host.

For hosts with ephemeral filesystems and no persistent disk, move uploads to object storage before relying on this feature in production.
