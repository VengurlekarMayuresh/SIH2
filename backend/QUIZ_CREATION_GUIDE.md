# 🧩 Complete Quiz Creation & Testing Guide

## 🚀 API Server Information
- **Base URL**: `http://localhost:5001/api` (ensure server is running)
- **Database**: MongoDB (configured via MONGODB_URI environment variable)
- **Authentication**: JWT Bearer tokens

## 📋 Step-by-Step Quiz Creation Process

### **STEP 1: Start Your Server**
```powershell
cd E:\SIH2\backend
npm start
```
*Server should start on port 5001 by default*

### **STEP 2: Create Test Data (First Time Setup)**
```powershell
# Create modules and basic test data
node create-quiz-data.js

# Create test institution and students
node create-test-data.js
```

---

## 🏫 **INSTITUTION ROUTES**

### **A. Register Institution**
```bash
POST http://localhost:5001/api/institution/register
Content-Type: application/json

{
  "name": "Disaster Preparedness Institute",
  "institutionId": "DPI2024",
  "email": "admin@dpi2024.edu",
  "password": "AdminPass123!",
  "phone": "+91-9876543210",
  "location": "New Delhi, India"
}
```

### **B. Login Institution**
```bash
POST http://localhost:5001/api/institution/login
Content-Type: application/json

{
  "email": "admin@dpi2024.edu",
  "password": "AdminPass123!"
}
```
**Response includes `token` - save this for quiz creation!**

---

## 👨‍🎓 **STUDENT ROUTES**

### **A. Register Student**
```bash
POST http://localhost:5001/api/student/register
Content-Type: application/json

{
  "institutionId": "DPI2024",
  "name": "Priya Sharma",
  "rollNo": "DM2024001",
  "email": "priya@dpi2024.edu",
  "password": "Student123!",
  "class": "12",
  "division": "A",
  "phone": "+91-9876543211",
  "parentPhone": "+91-9876543212"
}
```

### **B. Login Student**
```bash
POST http://localhost:5001/api/student/login
Content-Type: application/json

{
  "email": "priya@dpi2024.edu",
  "password": "Student123!"
}
```
**Response includes `token` - save this for taking quizzes!**

---

## 📚 **MODULE ROUTES**

### **Get Available Modules**
```bash
GET http://localhost:5001/api/modules
```
**This gives you module IDs needed for quiz creation**

---

## 🧩 **QUIZ CREATION & MANAGEMENT**

### **A. Create Quiz (Institution Only)**
```bash
POST http://localhost:5001/api/institution/quizzes
Authorization: Bearer <institution_token>
Content-Type: application/json
```

**Complete Quiz Data Format (Based on Your Disaster Data):**
```json
{
  "title": "Earthquake Safety Quiz",
  "description": "Test your knowledge about earthquake safety and preparedness measures.",
  "moduleId": "60f7b3b3b3b3b3b3b3b3b3b3", 
  "questions": [
    {
      "question": "What is the safest action during an earthquake?",
      "options": [
        { "text": "Run outside immediately", "isCorrect": false },
        { "text": "Drop, Cover, Hold", "isCorrect": true },
        { "text": "Stand near a window", "isCorrect": false },
        { "text": "Climb a tree", "isCorrect": false }
      ],
      "difficulty": "easy",
      "explanation": "Follow NDMA guidelines. The correct answer is: Drop, Cover, Hold",
      "points": 1,
      "hints": [{
        "text": "Follow NDMA guidelines.",
        "penalty": 0.1
      }]
    },
    {
      "question": "Where should you avoid standing during an earthquake?",
      "options": [
        { "text": "Under furniture", "isCorrect": false },
        { "text": "Near windows or heavy objects", "isCorrect": true },
        { "text": "In a doorway", "isCorrect": false },
        { "text": "On a carpet", "isCorrect": false }
      ],
      "difficulty": "easy",
      "explanation": "Windows can shatter. The correct answer is: Near windows or heavy objects",
      "points": 1,
      "hints": [{
        "text": "Windows can shatter.",
        "penalty": 0.1
      }]
    }
  ],
  "settings": {
    "timeLimit": 20,
    "passingScore": 70,
    "maxAttempts": 3,
    "randomizeQuestions": false,
    "randomizeOptions": true,
    "showCorrectAnswers": true,
    "allowRetake": true,
    "retakeDelay": 0
  },
  "status": "published"
}
```

### **B. Your Complete Disaster Quiz Data Converted**

Here's how to convert your disaster quiz format to our backend format:

**EARTHQUAKE QUIZ:**
```json
{
  "title": "Earthquake Safety Quiz",
  "description": "Comprehensive quiz on earthquake preparedness and safety measures in India.",
  "moduleId": "YOUR_MODULE_ID_HERE",
  "questions": [
    {
      "question": "What is the safest action during an earthquake?",
      "options": [
        { "text": "Run outside immediately", "isCorrect": false },
        { "text": "Drop, Cover, Hold", "isCorrect": true },
        { "text": "Stand near a window", "isCorrect": false },
        { "text": "Climb a tree", "isCorrect": false }
      ],
      "difficulty": "easy",
      "explanation": "Follow NDMA guidelines. The correct answer is: Drop, Cover, Hold",
      "points": 1,
      "hints": [{ "text": "Follow NDMA guidelines.", "penalty": 0.1 }]
    },
    {
      "question": "Where should you avoid standing during an earthquake?",
      "options": [
        { "text": "Under furniture", "isCorrect": false },
        { "text": "Near windows or heavy objects", "isCorrect": true },
        { "text": "In a doorway", "isCorrect": false },
        { "text": "On a carpet", "isCorrect": false }
      ],
      "difficulty": "easy",
      "explanation": "Windows can shatter. The correct answer is: Near windows or heavy objects",
      "points": 1,
      "hints": [{ "text": "Windows can shatter.", "penalty": 0.1 }]
    }
  ],
  "settings": {
    "timeLimit": 20,
    "passingScore": 70,
    "maxAttempts": 3,
    "randomizeQuestions": false,
    "randomizeOptions": true,
    "showCorrectAnswers": true,
    "allowRetake": true,
    "retakeDelay": 0
  },
  "status": "published"
}
```

**FLOOD QUIZ:**
```json
{
  "title": "Flood Safety Quiz",
  "description": "Essential knowledge about flood preparedness and emergency response.",
  "moduleId": "YOUR_MODULE_ID_HERE",
  "questions": [
    {
      "question": "What should you do during a flood?",
      "options": [
        { "text": "Move to higher ground", "isCorrect": true },
        { "text": "Play in water", "isCorrect": false },
        { "text": "Walk through deep water", "isCorrect": false },
        { "text": "Stay near electrical lines", "isCorrect": false }
      ],
      "difficulty": "easy",
      "explanation": "Avoid rising water. The correct answer is: Move to higher ground",
      "points": 1,
      "hints": [{ "text": "Avoid rising water.", "penalty": 0.1 }]
    }
  ],
  "settings": {
    "timeLimit": 20,
    "passingScore": 70,
    "maxAttempts": 3,
    "randomizeQuestions": false,
    "randomizeOptions": true,
    "showCorrectAnswers": true,
    "allowRetake": true,
    "retakeDelay": 0
  },
  "status": "published"
}
```

---

## 🎯 **QUIZ TAKING ROUTES (Student)**

### **A. Get Available Quizzes**
```bash
GET http://localhost:5001/api/student/quizzes
Authorization: Bearer <student_token>
```

### **B. Get Specific Quiz Details**
```bash
GET http://localhost:5001/api/quizzes/{quizId}
Authorization: Bearer <student_token>
```

### **C. Start Quiz Attempt**
```bash
POST http://localhost:5001/api/student/quiz/start
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "quizId": "60f7b3b3b3b3b3b3b3b3b3b3"
}
```

### **D. Submit Quiz Answers**
```bash
POST http://localhost:5001/api/student/quiz/submit
Authorization: Bearer <student_token>
Content-Type: application/json

{
  "attemptId": "60f7b3b3b3b3b3b3b3b3b3b4",
  "answers": [
    {
      "questionId": "60f7b3b3b3b3b3b3b3b3b3b5",
      "selectedOptions": ["60f7b3b3b3b3b3b3b3b3b3b6"],
      "timeSpent": 15,
      "confidence": 4,
      "hintsUsed": 0
    },
    {
      "questionId": "60f7b3b3b3b3b3b3b3b3b3b7",
      "selectedOptions": ["60f7b3b3b3b3b3b3b3b3b3b8"],
      "timeSpent": 20,
      "confidence": 3,
      "hintsUsed": 1
    }
  ]
}
```

### **E. Get Quiz Attempts/Results**
```bash
GET http://localhost:5001/api/student/quiz/attempts?quizId=60f7b3b3b3b3b3b3b3b3b3b3
Authorization: Bearer <student_token>
```

---

## 🛠️ **CURL COMMANDS FOR TESTING**

### **1. Create Institution**
```bash
curl -X POST http://localhost:5001/api/institution/register \
-H "Content-Type: application/json" \
-d '{
  "name": "Test Institute",
  "institutionId": "TEST001",
  "email": "admin@test.edu",
  "password": "AdminPass123!",
  "phone": "+91-9876543210",
  "location": "Mumbai, India"
}'
```

### **2. Login Institution (Save Token)**
```bash
curl -X POST http://localhost:5001/api/institution/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@test.edu",
  "password": "AdminPass123!"
}'
```

### **3. Get Modules (Get Module ID)**
```bash
curl -X GET http://localhost:5001/api/modules
```

### **4. Create Earthquake Quiz**
```bash
curl -X POST http://localhost:5001/api/institution/quizzes \
-H "Authorization: Bearer YOUR_INSTITUTION_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "title": "Earthquake Safety Quiz",
  "description": "Test your earthquake safety knowledge",
  "moduleId": "YOUR_MODULE_ID",
  "questions": [
    {
      "question": "What is the safest action during an earthquake?",
      "options": [
        { "text": "Run outside immediately", "isCorrect": false },
        { "text": "Drop, Cover, Hold", "isCorrect": true },
        { "text": "Stand near a window", "isCorrect": false },
        { "text": "Climb a tree", "isCorrect": false }
      ],
      "difficulty": "easy",
      "explanation": "Drop, Cover, Hold is the recommended safety protocol",
      "points": 1,
      "hints": [{ "text": "Follow NDMA guidelines.", "penalty": 0.1 }]
    }
  ],
  "settings": {
    "timeLimit": 10,
    "passingScore": 70,
    "maxAttempts": 3,
    "showCorrectAnswers": true
  },
  "status": "published"
}'
```

### **5. Register Student**
```bash
curl -X POST http://localhost:5001/api/student/register \
-H "Content-Type: application/json" \
-d '{
  "institutionId": "TEST001",
  "name": "John Doe",
  "rollNo": "ST001",
  "email": "john@test.edu",
  "password": "Student123!",
  "class": "12",
  "division": "A"
}'
```

### **6. Login Student (Save Token)**
```bash
curl -X POST http://localhost:5001/api/student/login \
-H "Content-Type: application/json" \
-d '{
  "email": "john@test.edu",
  "password": "Student123!"
}'
```

### **7. Get Available Quizzes**
```bash
curl -X GET http://localhost:5001/api/student/quizzes \
-H "Authorization: Bearer YOUR_STUDENT_TOKEN"
```

### **8. Start Quiz**
```bash
curl -X POST http://localhost:5001/api/student/quiz/start \
-H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
-H "Content-Type: application/json" \
-d '{"quizId": "YOUR_QUIZ_ID"}'
```

### **9. Submit Quiz**
```bash
curl -X POST http://localhost:5001/api/student/quiz/submit \
-H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
-H "Content-Type: application/json" \
-d '{
  "attemptId": "YOUR_ATTEMPT_ID",
  "answers": [
    {
      "questionId": "YOUR_QUESTION_ID",
      "selectedOptions": ["YOUR_CORRECT_OPTION_ID"],
      "timeSpent": 10,
      "confidence": 4
    }
  ]
}'
```

---

## 📊 **ADDITIONAL ROUTES FOR ANALYTICS**

### **Institution Dashboard**
```bash
GET http://localhost:5001/api/institution/dashboard
Authorization: Bearer <institution_token>
```

### **Quiz Analytics**
```bash
GET http://localhost:5001/api/institution/quizzes/{quizId}/analytics
Authorization: Bearer <institution_token>
```

### **Student Progress Dashboard**
```bash
GET http://localhost:5001/api/student/dashboard-data
Authorization: Bearer <student_token>
```

### **Student Badge System**
```bash
GET http://localhost:5001/api/student/badges
Authorization: Bearer <student_token>
```

---

## 🔧 **COMPLETE DISASTER QUIZ CONVERSION SCRIPT**

I can create a script that converts all your disaster quiz data to the backend format. The script will:

1. ✅ Register institution and student accounts
2. ✅ Create necessary modules
3. ✅ Convert your disaster quiz data to proper format
4. ✅ Create all 10 disaster quizzes (Earthquake, Flood, Fire, etc.)
5. ✅ Test the complete quiz flow
6. ✅ Show you all the created quiz IDs and tokens

**Would you like me to create this complete automation script?**

---

## 🎯 **KEY POINTS FOR YOUR QUIZ DATA**

1. **Question Format**: Each question needs `isCorrect: true/false` for each option
2. **Module ID**: Required for every quiz - get from `/modules` endpoint
3. **Authorization**: Institution token needed for creating, student token for taking
4. **Hints**: Optional but adds engagement - includes penalty system
5. **Settings**: Customize time limits, passing scores, attempts allowed
6. **Status**: Set to 'published' to make available to students

Your disaster quiz data is comprehensive and perfect for the system! The backend supports all the features you need including hints, difficulty levels, and detailed explanations.
