# SafeEd Platform - Deployment Guide

Your application has been updated to be **production-ready**! All hardcoded localhost URLs have been replaced with environment-based configuration.

## 🚀 What Was Fixed

### Frontend Changes
- ✅ Created centralized API client (`src/utils/api.ts`)
- ✅ Replaced hardcoded `http://localhost:5001/api` URLs with environment variables
- ✅ Updated all components to use the centralized API client
- ✅ Added automatic token management and error handling
- ✅ Environment variable: `VITE_API_URL`

### Backend Changes
- ✅ Updated CORS configuration for production
- ✅ Added environment-based allowed origins
- ✅ Improved security with proper CORS headers
- ✅ Added logging for CORS debugging
- ✅ Environment variables: `FRONTEND_URL`, `ALLOWED_ORIGINS`

## 📁 Project Structure

```
├── backend/
│   ├── .env                    # Development config
│   ├── .env.production         # Production template
│   └── server.js              # Updated CORS config
└── ready-to-learn-safe-main/
    ├── .env                   # Development config
    ├── .env.production        # Production template
    └── src/utils/api.ts       # Centralized API client
```

## 🔧 Environment Configuration

### Frontend Environment Variables

#### Development (`.env`)
```env
VITE_API_URL=http://localhost:5001/api
```

#### Production (`.env.production.local`)
```env
# Update this URL to your deployed backend
VITE_API_URL=https://your-api-domain.com/api
```

### Backend Environment Variables

#### Development (`.env`)
```env
NODE_ENV=development
PORT=5001
FRONTEND_URL=http://localhost:8080
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-jwt-secret
# ... other configs
```

#### Production (`.env`)
```env
NODE_ENV=production
PORT=5001
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-jwt-secret
# ... other configs
```

## 🚀 Deployment Steps

### 1. Backend Deployment

#### Option A: Railway
1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-domain.netlify.app
   ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your-secure-jwt-secret
   ```
3. Deploy from `backend` folder

#### Option B: Heroku
1. Create a Procfile in backend folder:
   ```
   web: node server.js
   ```
2. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=https://your-frontend-domain.com
   heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com
   ```
3. Deploy

#### Option C: DigitalOcean/VPS
1. Copy `.env.production` to `.env` and update values
2. Install dependencies: `npm install`
3. Start with PM2: `pm2 start server.js --name safeed-api`
4. Set up nginx reverse proxy

### 2. Frontend Deployment

#### Option A: Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Environment variables:
   ```
   VITE_API_URL=https://your-api-domain.railway.app/api
   ```
4. Deploy

#### Option B: Vercel
1. Framework preset: Vite
2. Environment variables:
   ```
   VITE_API_URL=https://your-api-domain.herokuapp.com/api
   ```
3. Deploy

#### Option C: Static hosting (GitHub Pages, etc.)
1. Create `.env.production.local`:
   ```
   VITE_API_URL=https://your-api-domain.com/api
   ```
2. Build: `npm run build`
3. Deploy `dist` folder

## 🔧 Local Development

### Start Backend
```bash
cd backend
npm install
npm start  # Uses .env with localhost URLs
```

### Start Frontend
```bash
cd ready-to-learn-safe-main
npm install
npm run dev  # Uses .env with localhost URLs
```

## 🛠️ Configuration Examples

### Example 1: Railway + Netlify
**Backend (Railway):**
```env
NODE_ENV=production
FRONTEND_URL=https://safeed-platform.netlify.app
ALLOWED_ORIGINS=https://safeed-platform.netlify.app
```

**Frontend (Netlify):**
```env
VITE_API_URL=https://safeed-api.up.railway.app/api
```

### Example 2: Heroku + Vercel
**Backend (Heroku):**
```env
NODE_ENV=production
FRONTEND_URL=https://safeed-platform.vercel.app
ALLOWED_ORIGINS=https://safeed-platform.vercel.app
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://safeed-api.herokuapp.com/api
```

### Example 3: Custom Domain
**Backend:**
```env
NODE_ENV=production
FRONTEND_URL=https://safeed.yourdomain.com
ALLOWED_ORIGINS=https://safeed.yourdomain.com,https://www.safeed.yourdomain.com
```

**Frontend:**
```env
VITE_API_URL=https://api.yourdomain.com/api
```

## 🔍 Testing Your Deployment

### 1. Check Environment Variables
- Backend: Visit `https://your-api-domain.com/` should return API status
- Frontend: Open browser console, check if `VITE_API_URL` is loaded correctly

### 2. Test API Connection
- Login/Register should work
- Dashboard should load data
- No CORS errors in browser console

### 3. Test Features
- ✅ Student registration/login
- ✅ Institution dashboard
- ✅ Weather widget
- ✅ Chatbot
- ✅ Progress tracking

## 🚨 Common Issues & Solutions

### CORS Errors
**Problem:** `Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS`

**Solution:** 
1. Check `FRONTEND_URL` in backend environment
2. Ensure both HTTP and HTTPS versions are in `ALLOWED_ORIGINS`
3. Check backend logs for CORS debugging info

### API Not Found (404)
**Problem:** `GET https://your-domain.com/api/... 404 Not Found`

**Solution:**
1. Verify `VITE_API_URL` ends with `/api`
2. Check backend is running and accessible
3. Verify API routes are working: `curl https://your-api-domain.com/api`

### Environment Variables Not Loading
**Problem:** API calls go to localhost in production

**Solution:**
1. Create `.env.production.local` for frontend
2. Ensure environment variables are set in hosting platform
3. Rebuild and redeploy frontend

## 📞 Support

If you encounter issues:
1. Check browser console for errors
2. Check backend logs for CORS/API errors
3. Verify environment variables are set correctly
4. Test API endpoints directly with curl/Postman

Your app is now production-ready! 🎉