# Simple Deployment Guide for Raksha Setu

Your app is ready to deploy! Here's the simplest way to get it online.

## What's Already Working ✅

- ✅ Backend API is working on `http://localhost:5001`
- ✅ Frontend uses environment variables for API URLs
- ✅ All hardcoded localhost URLs are removed
- ✅ Database connection is configured
- ✅ CORS is properly set up

## Quick Deploy Options

### Option 1: Railway (Recommended - Free & Simple)

**Deploy Backend:**
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repo → Choose `backend` folder
5. Add these environment variables in Railway dashboard:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://Ren:Riyan%409822@namastenode.xcitv.mongodb.net/sihproject
   JWT_SECRET=safexed-super-secret-jwt-key-2024-disaster-preparedness-education
   CLOUDINARY_CLOUD_NAME=dgiywyp9n
   CLOUDINARY_API_KEY=931662153886882
   CLOUDINARY_API_SECRET=29ySFTJo5ATN-oQOMnkAhDJLUZ8
   CLOUDINARY_UPLOAD_PRESET=safeed-videos
   WEATHER_API_KEY=0dfb2593897249b1883121117251209
   WEATHER_API_BASE_URL=http://api.weatherapi.com/v1
   FRONTEND_URL=https://your-frontend-url.netlify.app
   ```
6. Railway will give you a URL like `https://your-app.up.railway.app`

**Deploy Frontend:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your `ready-to-learn-safe-main` folder
3. In Netlify site settings → Environment variables, add:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   ```
4. Redeploy the site

### Option 2: Vercel + Railway

**Backend on Railway** (same as above)

**Frontend on Vercel:**
1. Go to [vercel.com](https://vercel.com)
2. Import your repo
3. Select `ready-to-learn-safe-main` as root directory
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-app.up.railway.app/api
   ```

## Important Notes

- The backend `.env` file already has all your keys
- The frontend already uses `VITE_API_URL` environment variable
- Just replace the URLs in the deployment platforms
- Test locally first: `npm start` in backend, `npm run dev` in frontend

## Testing Your Deployment

1. Visit your frontend URL
2. Try logging in/signing up
3. Check browser console for any CORS errors
4. If CORS errors, make sure `FRONTEND_URL` in backend matches your actual frontend domain

That's it! Your app should be live and working.