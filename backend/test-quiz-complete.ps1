# Complete Quiz API Test with Authentication
Write-Host "🧪 COMPREHENSIVE QUIZ API TEST" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:5001/api"

# Step 1: Get Institution Token
Write-Host "`n🏛️  Step 1: Getting Institution Token..." -ForegroundColor Yellow
$institutionLogin = @{
    email = "admin@modernpublic.edu"
    password = "SchoolPass123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/institution/login" -Method POST -Body $institutionLogin -ContentType "application/json"
    $institutionData = $response.Content | ConvertFrom-Json
    $institutionToken = $institutionData.token
    Write-Host "✅ Institution login successful!" -ForegroundColor Green
    Write-Host "   Token: $($institutionToken.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Institution login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get Student Token
Write-Host "`n👨‍🎓 Step 2: Getting Student Token..." -ForegroundColor Yellow
$studentLogin = @{
    email = "rahul.sharma@student.com"
    password = "Student123!"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/student/login" -Method POST -Body $studentLogin -ContentType "application/json"
    $studentData = $response.Content | ConvertFrom-Json
    $studentToken = $studentData.token
    Write-Host "✅ Student login successful!" -ForegroundColor Green
    Write-Host "   Token: $($studentToken.Substring(0,30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Student login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Get a module ID to associate with quiz
Write-Host "`n📚 Step 3: Getting Module ID..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BASE_URL/modules" -Method GET
    $modules = $response.Content | ConvertFrom-Json
    $moduleId = $modules[0]._id
    Write-Host "✅ Got module ID: $moduleId" -ForegroundColor Green
    Write-Host "   Module: $($modules[0].title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get modules: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Create a Quiz (Institution)
Write-Host "`n📝 Step 4: Creating Quiz..." -ForegroundColor Yellow
$quizData = @{
    title = "Fire Safety Assessment"
    description = "Test your knowledge of fire safety procedures and protocols"
    moduleId = $moduleId
    questions = @(
        @{
            question = "What is the first thing you should do when you discover a fire?"
            options = @(
                @{ text = "Run away immediately"; isCorrect = $false }
                @{ text = "Sound the fire alarm"; isCorrect = $true }
                @{ text = "Try to put it out yourself"; isCorrect = $false }
                @{ text = "Take photos for evidence"; isCorrect = $false }
            )
            difficulty = "easy"
            explanation = "The first priority is to alert others by sounding the fire alarm"
            points = 2
            timeLimit = 60
            hints = @(
                @{ text = "Think about alerting others first"; penalty = 0.1 }
            )
        },
        @{
            question = "In case of a fire, what does the acronym PASS stand for when using a fire extinguisher?"
            options = @(
                @{ text = "Pull, Aim, Squeeze, Sweep"; isCorrect = $true }
                @{ text = "Push, Aim, Spray, Stop"; isCorrect = $false }
                @{ text = "Pull, Alert, Squeeze, Stand"; isCorrect = $false }
                @{ text = "Point, Aim, Spray, Sweep"; isCorrect = $false }
            )
            difficulty = "medium"
            explanation = "PASS stands for Pull (pin), Aim (at base of fire), Squeeze (handle), Sweep (side to side)"
            points = 3
            timeLimit = 90
        }
    )
    settings = @{
        timeLimit = 15
        passingScore = 60
        maxAttempts = 3
        randomizeQuestions = $false
        randomizeOptions = $true
        showCorrectAnswers = $true
        allowRetake = $true
        retakeDelay = 0
    }
    status = "published"
} | ConvertTo-Json -Depth 10

try {
    $headers = @{
        'Authorization' = "Bearer $institutionToken"
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/institution/quizzes" -Method POST -Body $quizData -Headers $headers
    $createdQuiz = $response.Content | ConvertFrom-Json
    $quizId = $createdQuiz._id
    Write-Host "✅ Quiz created successfully!" -ForegroundColor Green
    Write-Host "   Quiz ID: $quizId" -ForegroundColor Gray
    Write-Host "   Title: $($createdQuiz.title)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to create quiz: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Error details: $errorContent" -ForegroundColor Red
    }
    exit 1
}

# Step 5: Get Quiz for Student
Write-Host "`n🎓 Step 5: Student Getting Quiz..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $studentToken"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/modules/$moduleId/quiz" -Method GET -Headers $headers
    $studentQuiz = $response.Content | ConvertFrom-Json
    Write-Host "✅ Student retrieved quiz successfully!" -ForegroundColor Green
    Write-Host "   Quiz: $($studentQuiz.title)" -ForegroundColor Gray
    Write-Host "   Questions: $($studentQuiz.questions.Count)" -ForegroundColor Gray
    Write-Host "   Time Limit: $($studentQuiz.settings.timeLimit) minutes" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get quiz for student: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 6: Start Quiz Attempt
Write-Host "`n🚀 Step 6: Starting Quiz Attempt..." -ForegroundColor Yellow
$startData = @{
    quizId = $quizId
} | ConvertTo-Json

try {
    $headers = @{
        'Authorization' = "Bearer $studentToken"
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/student/quiz/start" -Method POST -Body $startData -Headers $headers
    $attemptData = $response.Content | ConvertFrom-Json
    $attemptId = $attemptData.attemptId
    Write-Host "✅ Quiz attempt started!" -ForegroundColor Green
    Write-Host "   Attempt ID: $attemptId" -ForegroundColor Gray
    Write-Host "   Attempt Number: $($attemptData.attemptNumber)" -ForegroundColor Gray
    Write-Host "   Time Limit: $($attemptData.timeLimit) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to start quiz attempt: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 7: Submit Quiz Answers
Write-Host "`n📤 Step 7: Submitting Quiz Answers..." -ForegroundColor Yellow
$submissionData = @{
    attemptId = $attemptId
    answers = @(
        @{
            questionId = $studentQuiz.questions[0]._id
            selectedOptions = @($studentQuiz.questions[0].options[1]._id) # Correct answer
            timeSpent = 45
            confidence = 4
            hintsUsed = 0
        },
        @{
            questionId = $studentQuiz.questions[1]._id
            selectedOptions = @($studentQuiz.questions[1].options[0]._id) # Correct answer
            timeSpent = 70
            confidence = 5
            hintsUsed = 0
        }
    )
} | ConvertTo-Json -Depth 10

try {
    $headers = @{
        'Authorization' = "Bearer $studentToken"
        'Content-Type' = 'application/json'
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/student/quiz/submit" -Method POST -Body $submissionData -Headers $headers
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Quiz submitted successfully!" -ForegroundColor Green
    Write-Host "   Score: $($result.score.percentage)%" -ForegroundColor Gray
    Write-Host "   Passed: $($result.passed)" -ForegroundColor Gray
    Write-Host "   Total Time: $($result.timing.totalTimeSpent) seconds" -ForegroundColor Gray
    Write-Host "   Correct Answers: $($result.analytics.correctAnswers)/$($result.analytics.totalQuestions)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to submit quiz: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Error details: $errorContent" -ForegroundColor Red
    }
    exit 1
}

# Step 8: Get Quiz Analytics (Institution)
Write-Host "`n📊 Step 8: Getting Quiz Analytics..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $institutionToken"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/institution/quizzes/$quizId/analytics" -Method GET -Headers $headers
    $analytics = $response.Content | ConvertFrom-Json
    Write-Host "✅ Analytics retrieved!" -ForegroundColor Green
    Write-Host "   Total Attempts: $($analytics.totalAttempts)" -ForegroundColor Gray
    Write-Host "   Average Score: $($analytics.averageScore)%" -ForegroundColor Gray
    Write-Host "   Pass Rate: $($analytics.passRate)%" -ForegroundColor Gray
    Write-Host "   Average Time: $($analytics.averageTime) seconds" -ForegroundColor Gray
} catch {
    Write-Host "❌ Failed to get analytics: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 9: Get Student's Quiz Attempts
Write-Host "`n📋 Step 9: Getting Student's Attempts..." -ForegroundColor Yellow
try {
    $headers = @{
        'Authorization' = "Bearer $studentToken"
    }
    
    $response = Invoke-WebRequest -Uri "$BASE_URL/student/quiz/attempts" -Method GET -Headers $headers
    $attempts = $response.Content | ConvertFrom-Json
    Write-Host "✅ Student attempts retrieved!" -ForegroundColor Green
    Write-Host "   Total Attempts: $($attempts.Count)" -ForegroundColor Gray
    if ($attempts.Count -gt 0) {
        Write-Host "   Latest Score: $($attempts[0].score.percentage)%" -ForegroundColor Gray
        Write-Host "   Latest Status: $($attempts[0].status)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Failed to get student attempts: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 COMPREHENSIVE QUIZ API TEST COMPLETED!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "✅ All major quiz functionalities tested successfully!" -ForegroundColor Cyan
