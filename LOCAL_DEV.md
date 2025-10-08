# Local Development Setup

This guide helps you run the backend and frontend locally on macOS.

## Requirements
- Node.js 18+ (recommended 20 for undici peer in some packages)
- NPM 9+

## Backend
1) Copy .env example and edit:
```
cp backend/.env.example backend/.env
```
Update values:
- DB_HOST: 198.199.69.39 (or your local Postgres if you set one up)
- DB_USER/DB_PASSWORD: use the credentials for your DB
- JWT_SECRET: any strong dev string

2) Install deps and run:
```
cd backend
npm install
npm run dev
```
Health check: http://localhost:3001/api/health

## Frontend
```
cd frontend
npm install
npm start
```
The app runs at http://localhost:3000 and proxies API to http://localhost:3001.

## Admin user
If needed, create admin in remote DB:
```
cd backend
node ../database/create-admin.js
```

Login: ryan@thecashflowacademy.com / CiR43Tx2-
