# Dashboard API Troubleshooting Guide

## Issue: "Unable to load today's progress" in Student Dashboard

Based on code analysis, here are the most likely causes and solutions:

## 1. Environment Variable Issues

### Problem: Missing JWT_SECRET or MongoDB connection
**Solution:**
Check your backend `.env` file:

```env
JWT_SECRET=your_jwt_secret_here
MONGODB_URI=mongodb://localhost:27017/safeed
PORT=5001
# Add the weather API key
WEATHER_API_BASE_URL=http://api.weatherapi.com/v1
WEATHER_API_KEY=your_weather_api_key_here
```

### Fix:
1. Go to backend folder
2. Create or update `.env` file with above values
3. Restart the backend server

## 2. Database Connection Issues

### Problem: MongoDB not running or not connected
**Solution:**
1. Make sure MongoDB is installed and running
2. Check if the database `safeed` exists
3. Ensure the following collections exist:
   - students
   - modules  
   - quizattempts
   - badges
   - studentbadges

### Quick Database Setup:
```bash
# In backend folder (if you have node installed)
node create-quiz-data.js  # This creates sample modules and quizzes
```

## 3. Authentication Issues

### Problem: Invalid or expired JWT token
**Symptoms:** Dashboard loads but shows "Unable to load today's progress"

### Debug Steps:
1. Open browser DevTools (F12)
2. Go to Application/Storage > Local Storage
3. Check if these exist:
   - `authToken`
   - `userData` 
   - `userType` (should be "student")

### Fix:
1. If tokens are missing, logout and login again
2. If tokens exist but still failing, clear all localStorage:
   ```javascript
   // In browser console
   localStorage.clear()
   // Then login again
   ```

## 4. CORS Issues

### Problem: Cross-origin requests blocked
**Symptoms:** Console errors about CORS

### Fix:
Check that your frontend is running on an allowed origin. The backend allows:
- http://localhost:5173
- http://localhost:8080
- http://127.0.0.1:5173
- http://127.0.0.1:8080

If your frontend runs on different port, update `server.js` line 23-28.

## 5. Missing Dependencies

### Problem: Required models not properly initialized
**Fix:**
Ensure all models are registered. In `server.js`, line 12:
```javascript
require('./models');
```

Check if `backend/models/index.js` exists and exports all models.

## 6. Test Student Account Missing

### Problem: No test student in database
**Solution:**
Create a test student account:

1. Go to frontend registration page
2. Register with:
   - Name: Alice Johnson
   - Email: alice@student.test
   - Password: testpass123
   - (Leave institution code empty for now)

## 7. API Endpoint Testing

### Manual Test (using browser/Postman):

1. **Login first:**
   ```
   POST http://localhost:5001/api/student/login
   Body: {
     "email": "alice@student.test", 
     "password": "testpass123"
   }
   ```

2. **Copy the token from response**

3. **Test dashboard endpoint:**
   ```
   GET http://localhost:5001/api/student/dashboard-data
   Headers: Authorization: Bearer YOUR_TOKEN_HERE
   ```

## 8. Frontend Configuration Issues

### Problem: API base URL incorrect
**Check:** Frontend might be calling wrong API URL

**Fix:** Ensure frontend is configured to call `http://localhost:5001/api`

In `vite.config.js` or similar, you might need:
```javascript
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5001'
    }
  }
}
```

## 9. Backend Server Status

### Verify backend is actually running:
1. Open http://localhost:5001 in browser
2. Should show: `{"message":"🚨 SafeEd API is running!","status":"success"}`

### Check server logs for errors:
Look for error messages in the terminal where backend is running.

## 10. Quick Fix Commands

### If you have Node.js installed:
```powershell
# Set environment variable (PowerShell)
$env:WEATHER_API_BASE_URL = "http://api.weatherapi.com/v1"

# Go to backend directory
cd backend

# Install dependencies (if needed)
npm install

# Create sample data
node create-quiz-data.js

# Start server
npm start
# OR
node server.js
```

## 11. Frontend Browser Console Debugging

### Enable detailed logging:
1. Open browser DevTools (F12)
2. Go to Console tab  
3. Look for error messages starting with:
   - "Error fetching dashboard data:"
   - "Failed to load dashboard data"

### Common error patterns:
- **401 Unauthorized:** Token issues - logout/login
- **404 Not Found:** API endpoint wrong - check server running
- **500 Internal Error:** Backend database/server issues
- **Network Error:** Backend not running or CORS issues

## 12. Ultimate Reset Solution

If nothing works, try this complete reset:

1. **Clear all browser data:**
   ```javascript
   localStorage.clear()
   sessionStorage.clear() 
   ```

2. **Restart backend server**

3. **Create fresh test account**

4. **Login with new account**

## Success Indicators

When working correctly, you should see:
- Dashboard loads with user name
- "Today's Progress" section shows numbers (even if 0/3)
- Recent Activity section (may be empty initially)
- No console errors in browser DevTools

## Still Need Help?

If none of these solutions work:

1. **Check backend terminal logs** for specific error messages
2. **Check browser console** for detailed error information  
3. **Verify all services are running:**
   - Backend API (port 5001)
   - Frontend dev server (port 5173 or 8080)
   - MongoDB database

The issue is most likely one of:
- Missing environment variables
- MongoDB not running/connected
- Invalid authentication tokens
- CORS configuration problems