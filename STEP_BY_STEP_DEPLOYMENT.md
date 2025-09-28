# 🚀 Raksha Setu - Step-by-Step Deployment Guide

**✅ ALL TESTS PASSED - YOUR APP IS READY TO DEPLOY!**

## 🎯 Test Results Summary
- ✅ Backend API responding with "Raksha Setu" branding
- ✅ All API endpoints working (modules, weather, dashboard)  
- ✅ Frontend builds successfully (1.32 MB production bundle)
- ✅ Correct branding in build output
- ✅ No hardcoded secrets found
- ✅ CORS properly configured
- ✅ Environment files configured

---

## 📋 DEPLOYMENT OPTION 1: Railway + Netlify (Recommended)

### Step 1: Deploy Backend to Railway

1. **Go to Railway**
   - Visit: https://railway.app
   - Click "Login" and sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account if needed
   - Select your repository

3. **Configure Backend Service**
   - Choose "Add Service" → "GitHub Repo"
   - Select your repo and choose `backend` folder as root directory
   - Railway will auto-detect it's a Node.js project

4. **Add Environment Variables**
   Click "Variables" tab and add these (from your `backend\.env` file):
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
   FRONTEND_URL=https://your-frontend-will-go-here.netlify.app
   ```

5. **Deploy**
   - Railway will automatically build and deploy
   - You'll get a URL like: `https://your-app-name.up.railway.app`
   - **Save this URL - you'll need it for the frontend!**

### Step 2: Deploy Frontend to Netlify

1. **Build Production Frontend**
   ```powershell
   cd "E:\SIH2\ready-to-learn-safe-main"
   npm run build
   ```

2. **Go to Netlify**
   - Visit: https://netlify.com
   - Sign up/login with GitHub

3. **Deploy Site**
   - Drag and drop the entire `dist` folder to Netlify dashboard
   - OR click "Add new site" → "Deploy manually" → drag `dist` folder

4. **Configure Environment Variables**
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-railway-url.up.railway.app/api`
   - Example: `VITE_API_URL=https://raksha-setu-backend.up.railway.app/api`

5. **Redeploy**
   - Go to Deploys tab → "Trigger deploy"
   - Your site will be available at: `https://your-site-name.netlify.app`

### Step 3: Update CORS Settings

1. **Go back to Railway (Backend)**
   - Update the `FRONTEND_URL` environment variable
   - Set it to your Netlify URL: `https://your-site-name.netlify.app`

2. **Redeploy Backend**
   - Railway will automatically redeploy with new CORS settings

---

## 📋 DEPLOYMENT OPTION 2: Vercel + Railway

### Step 1: Deploy Backend to Railway (Same as above)

### Step 2: Deploy Frontend to Vercel

1. **Go to Vercel**
   - Visit: https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Select `ready-to-learn-safe-main` as root directory
   - Framework preset: Vite

3. **Configure Build**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`

4. **Environment Variables**
   - Add: `VITE_API_URL` = your Railway backend URL + `/api`

5. **Deploy**
   - Vercel will build and deploy automatically

---

## 📋 DEPLOYMENT OPTION 3: Heroku + Netlify

### Step 1: Deploy Backend to Heroku

1. **Install Heroku CLI**
   - Download from: https://devcenter.heroku.com/articles/heroku-cli

2. **Login and Create App**
   ```powershell
   heroku login
   cd "E:\SIH2\backend"
   heroku create raksha-setu-api
   ```

3. **Add Environment Variables**
   ```powershell
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI="mongodb+srv://Ren:Riyan%409822@namastenode.xcitv.mongodb.net/sihproject"
   heroku config:set JWT_SECRET="safexed-super-secret-jwt-key-2024-disaster-preparedness-education"
   heroku config:set CLOUDINARY_CLOUD_NAME="dgiywyp9n"
   heroku config:set CLOUDINARY_API_KEY="931662153886882"
   heroku config:set CLOUDINARY_API_SECRET="29ySFTJo5ATN-oQOMnkAhDJLUZ8"
   heroku config:set CLOUDINARY_UPLOAD_PRESET="safeed-videos"
   heroku config:set WEATHER_API_KEY="0dfb2593897249b1883121117251209"
   heroku config:set WEATHER_API_BASE_URL="http://api.weatherapi.com/v1"
   ```

4. **Deploy**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a raksha-setu-api
   git push heroku main
   ```

### Step 2: Deploy Frontend to Netlify (Same as Option 1)

---

## 🧪 Testing Your Deployment

### 1. Test Backend API
- Visit your backend URL: `https://your-api-url.com`
- Should show: `{"message":"🚨 Raksha Setu API is running!","status":"success"}`

### 2. Test Frontend
- Visit your frontend URL
- Should show "Raksha Setu" branding
- Try creating an account
- Try logging in
- Check if data loads properly

### 3. Test API Connection
- Open browser developer tools (F12)
- Look for any CORS errors
- All API calls should work properly

---

## 🎯 Quick Setup Summary

**Easiest Path (Railway + Netlify):**
1. Deploy backend to Railway → Get URL
2. Build frontend → Deploy to Netlify 
3. Set `VITE_API_URL` in Netlify to Railway URL
4. Set `FRONTEND_URL` in Railway to Netlify URL
5. Done! 🎉

**Your app will be live in about 10 minutes!**

---

## 🆘 Troubleshooting

**CORS Errors:**
- Make sure `FRONTEND_URL` in backend matches your frontend URL exactly
- No trailing slash in URLs

**API Not Found:**
- Make sure `VITE_API_URL` ends with `/api`
- Example: `https://your-app.railway.app/api` (note the `/api` at the end)

**Build Fails:**
- Make sure all npm packages are installed
- Check for any missing environment variables

**Database Connection:**
- Verify `MONGODB_URI` is exactly the same as your working local version

Your Raksha Setu app is ready to go live! 🚀