# Simple Quiz API Test
Write-Host "Testing Quiz API" -ForegroundColor Cyan

$BASE_URL = "http://localhost:5001/api"

# Login as institution
Write-Host "Getting institution token..." -ForegroundColor Yellow
$institutionLogin = @{
    email = "admin@modernpublic.edu"
    password = "SchoolPass123!"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "$BASE_URL/institution/login" -Method POST -Body $institutionLogin -ContentType "application/json"
$institutionData = $response.Content | ConvertFrom-Json
$institutionToken = $institutionData.token
Write-Host "Institution token obtained" -ForegroundColor Green

# Get modules
Write-Host "Getting modules..." -ForegroundColor Yellow
$response = Invoke-WebRequest -Uri "$BASE_URL/modules" -Method GET
$modules = $response.Content | ConvertFrom-Json
$moduleId = $modules[0]._id
Write-Host "Module ID: $moduleId" -ForegroundColor Green

# Create quiz
Write-Host "Creating quiz..." -ForegroundColor Yellow
$quizData = @{
    title = "Test Quiz"
    description = "A test quiz"
    moduleId = $moduleId
    questions = @(
        @{
            question = "Test question?"
            options = @(
                @{ text = "Option A"; isCorrect = $false }
                @{ text = "Option B"; isCorrect = $true }
            )
            difficulty = "easy"
            points = 1
        }
    )
    settings = @{
        timeLimit = 10
        passingScore = 50
        maxAttempts = 3
        showCorrectAnswers = $true
    }
    status = "published"
} | ConvertTo-Json -Depth 10

$headers = @{
    Authorization = "Bearer $institutionToken"
    ContentType = "application/json"
}

$response = Invoke-WebRequest -Uri "$BASE_URL/institution/quizzes" -Method POST -Body $quizData -Headers $headers
$quiz = $response.Content | ConvertFrom-Json
$quizId = $quiz._id
Write-Host "Quiz created: $quizId" -ForegroundColor Green

Write-Host "Quiz API test completed successfully!" -ForegroundColor Cyan
