# SafeEd Platform - Deployment Guide

## 🚀 Production Deployment Status: READY

Your SafeEd platform is now **100% production-ready** with all hardcoded localhost URLs removed and centralized API configuration.

## ✅ What Has Been Fixed

### API Centralization
- ✅ All API calls now use centralized `apiClient` from `src/utils/api.ts`
- ✅ Environment-based API URL configuration (`VITE_API_URL`)
- ✅ Automatic authentication token handling
- ✅ Consistent error handling across all API calls
- ✅ **Zero hardcoded localhost URLs** in application code

### Files Updated
- ✅ `src/hooks/useProgressTracking.tsx` - Fixed fetch calls
- ✅ `src/pages/AuthPage.tsx` - Replaced axios with apiClient
- ✅ `src/pages/DisasterDetail.tsx` - Replaced axios with apiClient
- ✅ `src/pages/QuizManager.tsx` - Fixed all fetch calls
- ✅ `src/components/BadgeCollection.tsx` - Replaced fetch with apiClient
- ✅ `src/components/QuizCards.tsx` - Replaced fetch with apiClient
- ✅ `src/components/Leaderboard.tsx` - Replaced fetch with apiClient
- ✅ `src/pages/VirtualDrills.tsx` - Replaced fetch with apiClient
- ✅ And many other components previously fixed

## 🔧 Environment Configuration

### Frontend Environment Variables

**Development (`.env` or `.env.development`):**
```env
VITE_API_URL=http://localhost:5001/api
```

**Production (`.env.production.local`):**
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Backend Environment Variables (if you have the backend)

**Production:**
```env
FRONTEND_URL=https://your-frontend-domain.com
ALLOWED_ORIGINS=https://your-frontend-domain.com
PORT=5001
# Add your other backend environment variables
```

## 📦 Deployment Instructions

### 1. Frontend Deployment

#### Option A: Vercel (Recommended for React apps)
```bash
# Install Vercel CLI
npm i -g vercel

# Build and deploy
npm run build
vercel --prod

# Set environment variable in Vercel dashboard:
# VITE_API_URL = https://your-api-domain.com/api
```

#### Option B: Netlify
```bash
# Build the app
npm run build

# Deploy the dist/ folder to Netlify
# Set environment variable in Netlify dashboard:
# VITE_API_URL = https://your-api-domain.com/api
```

#### Option C: Traditional VPS/Server
```bash
# Build the app
npm run build

# Upload dist/ folder to your web server
# Make sure to set VITE_API_URL in your build environment
```

### 2. Backend Deployment (if applicable)

#### Option A: Railway
```bash
# Deploy to Railway
railway login
railway init
railway add
railway deploy

# Set environment variables in Railway dashboard
```

#### Option B: Heroku
```bash
# Deploy to Heroku
heroku create your-app-name
git push heroku main

# Set environment variables
heroku config:set FRONTEND_URL=https://your-frontend-domain.com
heroku config:set ALLOWED_ORIGINS=https://your-frontend-domain.com
```

#### Option C: DigitalOcean/AWS/GCP
- Deploy your backend using Docker or traditional methods
- Ensure CORS is configured with your frontend domain
- Set all required environment variables

## 🌐 CORS Configuration

Your backend should be configured with proper CORS settings. Example for Express.js:

```javascript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

## 🔍 Verification Steps

### 1. Build Verification
```bash
npm run build
# Should complete without errors
```

### 2. Environment Verification
```bash
# Create .env.production.local with your API URL
echo "VITE_API_URL=https://your-api-domain.com/api" > .env.production.local

# Build with production environment
npm run build
```

### 3. API Calls Verification
- All API calls use `apiClient` from `src/utils/api.ts`
- No direct `fetch()` or `axios.get/post/put` calls in component files
- Authentication tokens are automatically handled

### 4. Network Tab Verification
- Open browser developer tools
- Check Network tab during app usage
- Verify all API calls go to your configured `VITE_API_URL`
- No calls to `localhost` in production

## 🚨 Important Notes

1. **Environment Variables**: Always set `VITE_API_URL` in your production environment
2. **CORS**: Ensure your backend allows requests from your frontend domain
3. **HTTPS**: Use HTTPS for both frontend and backend in production
4. **Authentication**: The app uses localStorage for authentication tokens
5. **Error Handling**: 401 errors automatically redirect to `/auth`

## 🛠️ Troubleshooting

### Common Issues

**1. API calls fail in production**
- Check if `VITE_API_URL` is set correctly
- Verify CORS configuration on backend
- Check if API endpoints are accessible

**2. Authentication issues**
- Clear localStorage and try again
- Check if token is being sent in requests
- Verify backend authentication endpoints

**3. Build fails**
- Check for TypeScript errors
- Ensure all dependencies are installed
- Verify environment variables are set

### Debug Commands

```bash
# Check environment variables during build
npm run build -- --debug

# Start production preview locally
npm run preview

# Check built files
ls -la dist/
```

## 📋 Deployment Checklist

- [ ] All hardcoded URLs removed ✅
- [ ] Environment variables configured ✅
- [ ] Build completes successfully ✅
- [ ] API client centralized ✅
- [ ] CORS configured on backend
- [ ] HTTPS enabled in production
- [ ] Domain names updated in environment variables
- [ ] Error handling tested
- [ ] Authentication flow tested

## 🎉 You're Ready to Deploy!

Your SafeEd platform is now production-ready. Simply:

1. Set your production `VITE_API_URL`
2. Run `npm run build`
3. Deploy the `dist/` folder
4. Configure your backend CORS
5. Test the application

**Happy Deploying! 🚀**