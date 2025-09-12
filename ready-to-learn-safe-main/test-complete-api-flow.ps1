# Complete API Flow Testing Script
# Tests everything from authentication to quiz completion and results

$baseUrl = "http://localhost:5001/api"
$frontendUrl = "http://localhost:8080"

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

Write-Host "${Blue}COMPLETE API FLOW TESTING${Reset}" -ForegroundColor Blue
Write-Host "=" * 50

# Global variables to store tokens and IDs
$studentToken = $null
$institutionToken = $null
$createdQuizId = $null
$moduleId = $null
$attemptId = $null

function Write-Success($message) {
    Write-Host "${Green}SUCCESS: $message${Reset}"
}

function Write-Error($message) {
    Write-Host "${Red}ERROR: $message${Reset}"
}

function Write-Info($message) {
    Write-Host "${Yellow}INFO: $message${Reset}"
}

function Write-Step($message) {
    Write-Host "${Blue}STEP: $message${Reset}"
}

# Test 1: Check if backend is running
Write-Step "Testing if backend is running..."
try {
    $healthCheck = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -ErrorAction SilentlyContinue
    Write-Success "Backend is running"
} catch {
    Write-Error "Backend is not running or not accessible at $baseUrl"
    Write-Info "Please start your backend server first"
    exit 1
}

# Test 2: Student Authentication
Write-Step "Testing student authentication..."
try {
    $studentLogin = @{
        email = "alice@student.test"
        password = "student123"
    }
    
    $studentResponse = Invoke-RestMethod -Uri "$baseUrl/student/login" -Method POST -Body ($studentLogin | ConvertTo-Json) -ContentType "application/json"
    $studentToken = $studentResponse.token
    Write-Success "Student login successful"
    Write-Info "Student: $($studentResponse.user.name) ($($studentResponse.user.email))"
} catch {
    Write-Error "Student login failed: $($_.Exception.Message)"
    Write-Info "Creating test student account..."
    
    try {
        $newStudent = @{
            name = "Alice Test"
            email = "alice@student.test"
            password = "student123"
            dateOfBirth = "2000-01-01"
            class = "10"
            rollNo = "001"
        }
        
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/student/register" -Method POST -Body ($newStudent | ConvertTo-Json) -ContentType "application/json"
        $studentToken = $registerResponse.token
        Write-Success "Student registration successful"
    } catch {
        Write-Error "Student registration also failed: $($_.Exception.Message)"
    }
}

# Test 3: Institution Authentication (for quiz creation)
Write-Step "Testing institution authentication..."
try {
    $institutionLogin = @{
        email = "admin@safeschool.edu"
        password = "admin123"
    }
    
    $institutionResponse = Invoke-RestMethod -Uri "$baseUrl/institution/login" -Method POST -Body ($institutionLogin | ConvertTo-Json) -ContentType "application/json"
    $institutionToken = $institutionResponse.token
    Write-Success "Institution login successful"
    Write-Info "Institution: $($institutionResponse.user.name)"
} catch {
    Write-Error "Institution login failed: $($_.Exception.Message)"
    Write-Info "Creating test institution account..."
    
    try {
        $newInstitution = @{
            name = "Safe School Test"
            email = "admin@safeschool.edu"
            password = "admin123"
            address = "Test Address"
            contactNumber = "1234567890"
        }
        
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/institution/register" -Method POST -Body ($newInstitution | ConvertTo-Json) -ContentType "application/json"
        $institutionToken = $registerResponse.token
        Write-Success "Institution registration successful"
    } catch {
        Write-Error "Institution registration also failed: $($_.Exception.Message)"
    }
}

# Test 4: Get Available Modules
Write-Step "Testing modules endpoint..."
try {
    $modules = Invoke-RestMethod -Uri "$baseUrl/modules" -Method GET -ContentType "application/json"
    Write-Success "Modules fetched successfully"
    Write-Info "Found $($modules.Count) modules"
    
    if ($modules.Count -gt 0) {
        $floodModule = $modules | Where-Object { $_.title -like "*Flood*" } | Select-Object -First 1
        if ($floodModule) {
            $moduleId = $floodModule._id
            Write-Info "Using Flood Safety module: $($floodModule.title)"
        } else {
            $moduleId = $modules[0]._id
            Write-Info "Using first available module: $($modules[0].title)"
        }
    }
} catch {
    Write-Error "Failed to fetch modules: $($_.Exception.Message)"
}

# Test 5: Create Quiz (Institution)
if ($institutionToken -and $moduleId) {
    Write-Step "Testing quiz creation..."
    try {
        # Load flood quiz data
        $quizData = Get-Content "flood-quiz-data.json" | ConvertFrom-Json
        
        $newQuiz = @{
            title = $quizData.title
            description = $quizData.description
            moduleId = $moduleId
            questions = @()
            settings = $quizData.settings
            status = "published"
        }
        
        # Convert questions
        foreach ($question in $quizData.questions) {
            $newQuestion = @{
                question = $question.question
                options = @()
                difficulty = $question.difficulty
                points = $question.points
                timeLimit = $question.timeLimit
                explanation = ""
                hints = @()
            }
            
            foreach ($option in $question.options) {
                $newQuestion.options += @{
                    text = $option.text
                    isCorrect = $option.isCorrect
                }
            }
            
            $newQuiz.questions += $newQuestion
        }
        
        $headers = @{
            "Authorization" = "Bearer $institutionToken"
            "Content-Type" = "application/json"
        }
        
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/quizzes" -Method POST -Body ($newQuiz | ConvertTo-Json -Depth 10) -Headers $headers
        $createdQuizId = $createResponse._id
        Write-Success "Quiz created successfully"
        Write-Info "Quiz ID: $createdQuizId"
        Write-Info "Questions: $($createResponse.questions.Count)"
    } catch {
        Write-Error "Quiz creation failed: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Error "API Response: $errorContent"
        }
    }
} else {
    Write-Info "Skipping quiz creation - no institution token or module ID"
    
    # Try to find existing quiz
    Write-Step "Looking for existing quizzes..."
    try {
        if ($studentToken) {
            $headers = @{
                "Authorization" = "Bearer $studentToken"
                "Content-Type" = "application/json"
            }
            $existingQuizzes = Invoke-RestMethod -Uri "$baseUrl/student/quizzes" -Method GET -Headers $headers
            if ($existingQuizzes.quizzes.Count -gt 0) {
                $createdQuizId = $existingQuizzes.quizzes[0].id
                Write-Info "Using existing quiz: $($existingQuizzes.quizzes[0].title) (ID: $createdQuizId)"
            }
        }
    } catch {
        Write-Info "No existing quizzes found"
    }
}

# Test 6: Student - Get Available Quizzes
if ($studentToken) {
    Write-Step "Testing student quizzes endpoint..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $studentQuizzes = Invoke-RestMethod -Uri "$baseUrl/student/quizzes" -Method GET -Headers $headers
        Write-Success "Student quizzes fetched successfully"
        Write-Info "Available quizzes: $($studentQuizzes.quizzes.Count)"
        
        if ($studentQuizzes.quizzes.Count -gt 0 -and -not $createdQuizId) {
            $createdQuizId = $studentQuizzes.quizzes[0].id
            Write-Info "Using quiz: $($studentQuizzes.quizzes[0].title)"
        }
    } catch {
        Write-Error "Failed to fetch student quizzes: $($_.Exception.Message)"
    }
}

# Test 7: Get Quiz Details
if ($studentToken -and $createdQuizId) {
    Write-Step "Testing quiz details endpoint..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $quizDetails = Invoke-RestMethod -Uri "$baseUrl/quizzes/$createdQuizId" -Method GET -Headers $headers
        Write-Success "Quiz details fetched successfully"
        Write-Info "Quiz: $($quizDetails.title)"
        Write-Info "Questions: $($quizDetails.questions.Count)"
        Write-Info "Time Limit: $($quizDetails.settings.timeLimit) minutes"
    } catch {
        Write-Error "Failed to fetch quiz details: $($_.Exception.Message)"
    }
}

# Test 8: Start Quiz Attempt
if ($studentToken -and $createdQuizId) {
    Write-Step "Testing quiz start endpoint..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $startRequest = @{
            quizId = $createdQuizId
        }
        
        $startResponse = Invoke-RestMethod -Uri "$baseUrl/student/quiz/start" -Method POST -Body ($startRequest | ConvertTo-Json) -Headers $headers
        $attemptId = $startResponse.attemptId
        Write-Success "Quiz attempt started successfully"
        Write-Info "Attempt ID: $attemptId"
    } catch {
        Write-Error "Failed to start quiz: $($_.Exception.Message)"
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Info "Quiz might already be started - continuing with submission test"
        }
    }
}

# Test 9: Submit Quiz (with sample answers)
if ($studentToken -and $createdQuizId) {
    Write-Step "Testing quiz submission endpoint..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        # Get quiz details to prepare answers
        $quizDetails = Invoke-RestMethod -Uri "$baseUrl/quizzes/$createdQuizId" -Method GET -Headers $headers
        
        # Prepare sample answers (select first option for each question)
        $answers = @()
        foreach ($question in $quizDetails.questions) {
            $answers += @{
                questionId = $question._id
                selectedOptions = @($question.options[0]._id)  # Select first option
                timeSpent = 30
                confidence = 3
                hintsUsed = 0
            }
        }
        
        $submitRequest = @{
            attemptId = $attemptId
            answers = $answers
        }
        
        if (-not $attemptId) {
            # Try to get or create attempt ID
            try {
                $startResponse = Invoke-RestMethod -Uri "$baseUrl/student/quiz/start" -Method POST -Body (@{quizId = $createdQuizId} | ConvertTo-Json) -Headers $headers
                $attemptId = $startResponse.attemptId
                $submitRequest.attemptId = $attemptId
            } catch {
                Write-Info "Using mock attempt ID for testing"
                $submitRequest.attemptId = "mock-attempt-id"
            }
        }
        
        $submitResponse = Invoke-RestMethod -Uri "$baseUrl/student/quiz/submit" -Method POST -Body ($submitRequest | ConvertTo-Json -Depth 10) -Headers $headers
        Write-Success "Quiz submitted successfully"
        Write-Info "Score: $($submitResponse.score.percentage)%"
        Write-Info "Passed: $($submitResponse.score.passed)"
        Write-Info "Time Spent: $($submitResponse.timing.totalTimeSpent) seconds"
        
        if ($submitResponse.badges -and $submitResponse.badges.Count -gt 0) {
            Write-Info "Badges earned: $($submitResponse.badges.Count)"
        }
        
    } catch {
        Write-Error "Quiz submission failed: $($_.Exception.Message)"
        if ($_.Exception.Response) {
            try {
                $errorStream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorStream)
                $errorContent = $reader.ReadToEnd()
                Write-Error "API Response: $errorContent"
            } catch {
                Write-Error "Could not read error response"
            }
        }
    }
}

# Test 10: Get Quiz Attempts History
if ($studentToken -and $createdQuizId) {
    Write-Step "Testing quiz attempts history..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $attempts = Invoke-RestMethod -Uri "$baseUrl/student/quiz/attempts?quizId=$createdQuizId" -Method GET -Headers $headers
        Write-Success "Quiz attempts fetched successfully"
        Write-Info "Total attempts: $($attempts.Count)"
        
        if ($attempts.Count -gt 0) {
            $latestAttempt = $attempts[0]
            Write-Info "Latest score: $($latestAttempt.score.percentage)%"
            Write-Info "Status: $($latestAttempt.status)"
        }
    } catch {
        Write-Error "Failed to fetch quiz attempts: $($_.Exception.Message)"
    }
}

# Test 11: Get Dashboard Data
if ($studentToken) {
    Write-Step "Testing dashboard data endpoint..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $dashboardData = Invoke-RestMethod -Uri "$baseUrl/student/dashboard-data" -Method GET -Headers $headers
        Write-Success "Dashboard data fetched successfully"
        Write-Info "Streak: $($dashboardData.streak) days"
        Write-Info "Today's progress: $($dashboardData.todayProgress.completed)/$($dashboardData.todayProgress.goal)"
        Write-Info "Recent activities: $($dashboardData.recentActivity.Count)"
    } catch {
        Write-Error "Failed to fetch dashboard data: $($_.Exception.Message)"
    }
}

# Test 12: Get Progress Data
if ($studentToken) {
    Write-Step "Testing progress dashboard endpoint..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $progressData = Invoke-RestMethod -Uri "$baseUrl/student/progress-dashboard" -Method GET -Headers $headers
        Write-Success "Progress data fetched successfully"
        Write-Info "Completed modules: $($progressData.stats.completedModules)/$($progressData.stats.totalModules)"
        Write-Info "Latest quiz score: $($progressData.stats.latestQuizScore)%"
        Write-Info "Badges earned: $($progressData.stats.earnedBadges)"
    } catch {
        Write-Error "Failed to fetch progress data: $($_.Exception.Message)"
    }
}

# Test 13: Test Frontend Accessibility
Write-Step "Testing frontend accessibility..."
try {
    $frontendTest = Invoke-WebRequest -Uri $frontendUrl -UseBasicParsing -TimeoutSec 5
    Write-Success "Frontend is accessible at $frontendUrl"
    Write-Info "Status: $($frontendTest.StatusCode)"
} catch {
    Write-Error "Frontend not accessible at $frontendUrl"
    Write-Info "Make sure the frontend dev server is running (npm run dev)"
}

# Test 14: Quiz Leaderboard (if available)
if ($studentToken -and $createdQuizId) {
    Write-Step "Testing quiz leaderboard..."
    try {
        $headers = @{
            "Authorization" = "Bearer $studentToken"
            "Content-Type" = "application/json"
        }
        
        $leaderboard = Invoke-RestMethod -Uri "$baseUrl/student/quiz/$createdQuizId/leaderboard" -Method GET -Headers $headers -ErrorAction SilentlyContinue
        Write-Success "Leaderboard fetched successfully"
        Write-Info "Top performers: $($leaderboard.Count)"
    } catch {
        Write-Info "Leaderboard endpoint not available or not implemented"
    }
}

# Summary Report
Write-Host ""
Write-Host "${Blue}TESTING SUMMARY${Reset}" -ForegroundColor Blue
Write-Host "=" * 50

$testResults = @(
    "[OK] Backend Health Check",
    "$(if ($studentToken) { '[OK]' } else { '[FAIL]' }) Student Authentication",
    "$(if ($institutionToken) { '[OK]' } else { '[FAIL]' }) Institution Authentication", 
    "$(if ($moduleId) { '[OK]' } else { '[FAIL]' }) Modules Endpoint",
    "$(if ($createdQuizId) { '[OK]' } else { '[FAIL]' }) Quiz Creation/Access",
    "$(if ($attemptId) { '[OK]' } else { '[WARN]' }) Quiz Attempt Start",
    "[TEST] Quiz Submission (tested)",
    "[TEST] Quiz History (tested)",
    "[TEST] Dashboard Data (tested)",
    "[TEST] Progress Data (tested)",
    "[TEST] Frontend Access (tested)"
)

foreach ($result in $testResults) {
    Write-Host $result
}

Write-Host ""
if ($createdQuizId) {
    Write-Success "READY FOR TESTING!"
    Write-Host ""
    Write-Info "Quiz ID for testing: $createdQuizId"
    Write-Info "Frontend URL: $frontendUrl"
    Write-Info "Backend URL: $baseUrl"
    Write-Host ""
    Write-Info "You can now test the complete flow in the frontend:"
    Write-Info "1. Login as student: alice@student.test / student123"
    Write-Info "2. Navigate to modules to see available quizzes"
    Write-Info "3. Take the quiz and verify results"
    Write-Info "4. Check dashboard for progress updates"
} else {
    Write-Error "SETUP INCOMPLETE"
    Write-Info "Some endpoints may need configuration or the backend may need quiz data"
}

Write-Host ""
Write-Host "${Blue}NEXT STEPS:${Reset}"
Write-Info "1. Ensure backend server is running on port 5001"
Write-Info "2. Ensure frontend dev server is running on port 8080"
Write-Info "3. Test the complete user flow in the browser"
Write-Info "4. Verify all progress tracking and analytics work"

Write-Host ""
Write-Host "${Green}Testing completed!${Reset}" -ForegroundColor Green
