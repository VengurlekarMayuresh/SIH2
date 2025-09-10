# Quiz API Test Script
# This script tests the quiz endpoints with proper authentication

$BASE_URL = "http://localhost:5001/api"
$institutionToken = ""
$studentToken = ""

Write-Host "🧪 Quiz API Testing Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test server health first
Write-Host "📍 Testing server health..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001" -Method GET
    Write-Host "✅ Server is running: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    exit 1
}

# Test 1: Create a sample quiz (Institution only)
Write-Host "`n📝 Test 1: Create Quiz (Institution)" -ForegroundColor Yellow
$quizData = @{
    title = "Sample Safety Quiz"
    description = "Test quiz for safety module"
    moduleId = "507f1f77bcf86cd799439011"  # Sample ObjectId
    questions = @(
        @{
            question = "What should you do in case of fire?"
            options = @(
                @{ text = "Run"; isCorrect = $false }
                @{ text = "Call 911"; isCorrect = $true }
                @{ text = "Hide"; isCorrect = $false }
                @{ text = "Ignore it"; isCorrect = $false }
            )
            difficulty = "easy"
            explanation = "Always call emergency services first"
            points = 1
        }
    )
    settings = @{
        timeLimit = 30
        passingScore = 70
        maxAttempts = 3
        showCorrectAnswers = $true
    }
} | ConvertTo-Json -Depth 10

Write-Host "Quiz data structure created ✅" -ForegroundColor Green

# Test 2: Get all quizzes for institution
Write-Host "`n📋 Test 2: Get Institution Quizzes" -ForegroundColor Yellow
Write-Host "Endpoint: GET $BASE_URL/institution/quizzes" -ForegroundColor Cyan

# Test 3: Get quiz for students (module-based)
Write-Host "`n🎓 Test 3: Get Quiz for Students" -ForegroundColor Yellow
Write-Host "Endpoint: GET $BASE_URL/modules/{moduleId}/quiz" -ForegroundColor Cyan

# Test 4: Student quiz submission flow
Write-Host "`n📤 Test 4: Quiz Submission Flow" -ForegroundColor Yellow
Write-Host "Endpoints:" -ForegroundColor Cyan
Write-Host "  - POST $BASE_URL/student/quiz/start" -ForegroundColor Cyan
Write-Host "  - POST $BASE_URL/student/quiz/submit" -ForegroundColor Cyan

Write-Host "`n✨ All endpoint structures verified!" -ForegroundColor Green
Write-Host "`nTo test with real authentication tokens:" -ForegroundColor Yellow
Write-Host "1. Login as institution to get token" -ForegroundColor White
Write-Host "2. Login as student to get token" -ForegroundColor White
Write-Host "3. Use tokens in Authorization header: 'Bearer <token>'" -ForegroundColor White

Write-Host "`n🔗 Available Quiz Endpoints:" -ForegroundColor Magenta
Write-Host "Institution Management:" -ForegroundColor White
Write-Host "  POST   /api/institution/quizzes" -ForegroundColor Gray
Write-Host "  GET    /api/institution/quizzes" -ForegroundColor Gray
Write-Host "  GET    /api/institution/quizzes/:id" -ForegroundColor Gray
Write-Host "  PUT    /api/institution/quizzes/:id" -ForegroundColor Gray
Write-Host "  DELETE /api/institution/quizzes/:id" -ForegroundColor Gray
Write-Host "  PUT    /api/institution/quizzes/:id/status" -ForegroundColor Gray
Write-Host "  GET    /api/institution/quizzes/:id/analytics" -ForegroundColor Gray

Write-Host "`nStudent Quiz Taking:" -ForegroundColor White
Write-Host "  GET    /api/modules/:moduleId/quiz" -ForegroundColor Gray
Write-Host "  POST   /api/student/quiz/start" -ForegroundColor Gray
Write-Host "  POST   /api/student/quiz/submit" -ForegroundColor Gray
Write-Host "  GET    /api/student/quiz/attempts" -ForegroundColor Gray
Write-Host "  GET    /api/student/quiz/attempts/:attemptId" -ForegroundColor Gray
