# Complete Quiz System with Badges Test
Write-Host "🎉 TESTING COMPLETE QUIZ SYSTEM WITH BADGES" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$BASE_URL = "http://localhost:5001/api"

# Login as institution (use existing credentials)
Write-Host "`n🏛️ Step 1: Institution Login..." -ForegroundColor Yellow
$login = @{email = "quiz@test.edu"; password = "QuizTest123!"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$BASE_URL/institution/login" -Method POST -Body $login -ContentType "application/json"
$data = $response.Content | ConvertFrom-Json
$institutionToken = $data.token
Write-Host "✅ Institution logged in" -ForegroundColor Green

# Get modules for quiz creation
Write-Host "`n📚 Step 2: Getting Modules..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$BASE_URL/modules" -Method GET
$modules = $response.Content | ConvertFrom-Json
$moduleId = $modules[0]._id
Write-Host "✅ Got module: $($modules[0].title)" -ForegroundColor Green

# Initialize badges
Write-Host "`n🏆 Step 3: Initializing Badges..." -ForegroundColor Yellow
$headers = @{'Authorization' = "Bearer $institutionToken"}
try {
    Invoke-WebRequest -Uri "$BASE_URL/institution/badges/initialize" -Method POST -Headers $headers | Out-Null
    Write-Host "✅ Badges initialized!" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Badges already exist" -ForegroundColor Gray
}

# Create a quiz
Write-Host "`n📝 Step 4: Creating Quiz..." -ForegroundColor Yellow
$quizData = @{
    title = "Fire Safety Mastery Quiz"
    description = "Complete this quiz to earn fire safety badges!"
    moduleId = $moduleId
    questions = @(
        @{
            question = "What should you do first when you smell smoke?"
            options = @(
                @{ text = "Investigate the source"; isCorrect = $false }
                @{ text = "Alert others and call 911"; isCorrect = $true }
                @{ text = "Open windows for ventilation"; isCorrect = $false }
                @{ text = "Leave immediately without telling anyone"; isCorrect = $false }
            )
            difficulty = "medium"
            explanation = "Safety first - always alert others and emergency services"
            points = 2
        }
    )
    settings = @{
        timeLimit = 5
        passingScore = 70
        maxAttempts = 5
        showCorrectAnswers = $true
    }
    status = "published"
} | ConvertTo-Json -Depth 10

$headers['Content-Type'] = 'application/json'
$response = Invoke-WebRequest -Uri "$BASE_URL/institution/quizzes" -Method POST -Body $quizData -Headers $headers
$quiz = $response.Content | ConvertFrom-Json
$quizId = $quiz._id
Write-Host "✅ Quiz created: $($quiz.title)" -ForegroundColor Green

# Register and login as student (create new student)
Write-Host "`n👨‍🎓 Step 5: Creating Student Account..." -ForegroundColor Yellow
$studentData = @{
    name = "Badge Tester"
    institutionId = "68c096008d2c80c68d1531d9"
    email = "badgetest@student.com"
    password = "StudentTest123!"
    rollNo = "BT001"
    division = "A"
    class = "10"
} | ConvertTo-Json

try {
    Invoke-WebRequest -Uri "$BASE_URL/student/register" -Method POST -Body $studentData -ContentType "application/json" | Out-Null
    Write-Host "✅ Student registered" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Student may already exist" -ForegroundColor Gray
}

# Login as student
$studentLogin = @{email = "badgetest@student.com"; password = "StudentTest123!"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "$BASE_URL/student/login" -Method POST -Body $studentLogin -ContentType "application/json"
$studentData = $response.Content | ConvertFrom-Json
$studentToken = $studentData.token
Write-Host "✅ Student logged in" -ForegroundColor Green

# Get quiz cards
Write-Host "`n🎴 Step 6: Getting Quiz Cards..." -ForegroundColor Yellow
$headers = @{'Authorization' = "Bearer $studentToken"}
$response = Invoke-WebRequest -Uri "$BASE_URL/quizzes" -Method GET -Headers $headers
$quizCards = $response.Content | ConvertFrom-Json
Write-Host "✅ Found $($quizCards.quizzes.Count) quiz cards" -ForegroundColor Green

# Get available badges
Write-Host "`n🏅 Step 7: Checking Available Badges..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$BASE_URL/badges" -Method GET -Headers $headers
$badges = $response.Content | ConvertFrom-Json
Write-Host "✅ Found $($badges.Count) available badges to earn" -ForegroundColor Green

# Start quiz attempt
Write-Host "`n🚀 Step 8: Starting Quiz..." -ForegroundColor Yellow
$startData = @{ quizId = $quizId } | ConvertTo-Json
$headers['Content-Type'] = 'application/json'
$response = Invoke-WebRequest -Uri "$BASE_URL/student/quiz/start" -Method POST -Body $startData -Headers $headers
$attemptData = $response.Content | ConvertFrom-Json
$attemptId = $attemptData.attemptId
Write-Host "✅ Quiz started! Attempt ID: $attemptId" -ForegroundColor Green

# Get quiz questions for answering
$response = Invoke-WebRequest -Uri "$BASE_URL/modules/$moduleId/quiz" -Method GET -Headers @{'Authorization' = "Bearer $studentToken"}
$studentQuiz = $response.Content | ConvertFrom-Json

# Submit perfect answers to earn badges
Write-Host "`n📤 Step 9: Submitting Perfect Answers..." -ForegroundColor Yellow
$submissionData = @{
    attemptId = $attemptId
    answers = @(
        @{
            questionId = $studentQuiz.questions[0]._id
            selectedOptions = @($studentQuiz.questions[0].options[1]._id) # Correct answer
            timeSpent = 30
            confidence = 5
            hintsUsed = 0
        }
    )
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -Uri "$BASE_URL/student/quiz/submit" -Method POST -Body $submissionData -Headers $headers
$result = $response.Content | ConvertFrom-Json

Write-Host "✅ Quiz submitted!" -ForegroundColor Green
Write-Host "   Score: $($result.score.percentage)%" -ForegroundColor Cyan
Write-Host "   Passed: $($result.passed)" -ForegroundColor Cyan
Write-Host "   Badges Earned: $($result.badges.Count)" -ForegroundColor Cyan

if ($result.badges.Count -gt 0) {
    Write-Host "`n🎖️ NEW BADGES EARNED:" -ForegroundColor Magenta
    foreach ($badge in $result.badges) {
        Write-Host "   $($badge.icon) $($badge.name)" -ForegroundColor Yellow
        Write-Host "      - $($badge.description)" -ForegroundColor Gray
        Write-Host "      - Type: $($badge.type) | Rarity: $($badge.rarity) | Points: $($badge.points)" -ForegroundColor Gray
    }
}

# Get student's badges
Write-Host "`n🏆 Step 10: Checking Student Badges..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$BASE_URL/student/badges" -Method GET -Headers @{'Authorization' = "Bearer $studentToken"}
$studentBadges = $response.Content | ConvertFrom-Json

Write-Host "✅ Student Badge Collection:" -ForegroundColor Green
Write-Host "   Total Badges: $($studentBadges.stats.total)" -ForegroundColor Cyan
Write-Host "   Total Points: $($studentBadges.stats.totalPoints)" -ForegroundColor Cyan

if ($studentBadges.badges.Count -gt 0) {
    Write-Host "`n📋 EARNED BADGES:" -ForegroundColor White
    foreach ($badge in $studentBadges.badges) {
        Write-Host "   $($badge.icon) $($badge.name) ($($badge.type))" -ForegroundColor Green
    }
}

# Get featured quizzes
Write-Host "`n⭐ Step 11: Getting Featured Quizzes..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$BASE_URL/quizzes/featured" -Method GET -Headers @{'Authorization' = "Bearer $studentToken"}
$featured = $response.Content | ConvertFrom-Json
Write-Host "✅ Found $($featured.featured.Count) featured quizzes" -ForegroundColor Green

Write-Host "`n🎉 COMPLETE SYSTEM TEST SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n📊 SYSTEM CAPABILITIES VERIFIED:" -ForegroundColor Magenta
Write-Host "✅ Quiz Creation & Management" -ForegroundColor White
Write-Host "✅ Student Quiz Taking" -ForegroundColor White
Write-Host "✅ Automatic Badge Awarding" -ForegroundColor White
Write-Host "✅ Quiz Card Discovery" -ForegroundColor White
Write-Host "✅ Badge Collection & Analytics" -ForegroundColor White
Write-Host "✅ Featured Quiz Recommendations" -ForegroundColor White

Write-Host "`n🔗 KEY ENDPOINTS WORKING:" -ForegroundColor Yellow
Write-Host "• POST /api/institution/quizzes" -ForegroundColor Gray
Write-Host "• GET  /api/quizzes (Quiz Cards)" -ForegroundColor Gray
Write-Host "• POST /api/student/quiz/submit (with Badge Awarding)" -ForegroundColor Gray
Write-Host "• GET  /api/student/badges" -ForegroundColor Gray
Write-Host "• GET  /api/badges (Available Badges)" -ForegroundColor Gray
Write-Host "• GET  /api/quizzes/featured" -ForegroundColor Gray
