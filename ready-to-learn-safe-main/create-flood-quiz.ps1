# PowerShell script to create the flood safety quiz in the backend

# Configuration
$baseUrl = "http://localhost:5001/api"
$quizData = Get-Content "flood-quiz-data.json" | ConvertFrom-Json

# First, let's try to get available modules to find which one to attach the quiz to
Write-Host "Getting available modules..." -ForegroundColor Green

try {
    $modulesResponse = Invoke-RestMethod -Uri "$baseUrl/modules" -Method GET -ContentType "application/json"
    Write-Host "Available modules:" -ForegroundColor Yellow
    $modulesResponse | ForEach-Object { Write-Host "  ID: $($_._id) - Title: $($_.title)" }
    
    # Find the Flood Safety module specifically
    $floodModule = $modulesResponse | Where-Object { 
        $_.title -eq "Flood Safety"
    } | Select-Object -First 1
    
    if (-not $floodModule) {
        # If no Flood Safety module found, look for any safety/disaster module
        $floodModule = $modulesResponse | Where-Object { 
            $_.title -like "*flood*" -or $_.title -like "*disaster*" -or $_.title -like "*safety*" 
        } | Select-Object -First 1
    }
    
    if (-not $floodModule) {
        # If no suitable module found, use the first one
        $floodModule = $modulesResponse | Select-Object -First 1
        Write-Host "No flood-specific module found, using: $($floodModule.title)" -ForegroundColor Yellow
    } else {
        Write-Host "Using module: $($floodModule.title) (ID: $($floodModule._id))" -ForegroundColor Green
    }
    
    if (-not $floodModule) {
        throw "No modules available in the system"
    }
    
    # Prepare quiz data for API
    $apiQuizData = @{
        title = $quizData.title
        description = $quizData.description
        moduleId = $floodModule._id
        questions = @()
        settings = $quizData.settings
        status = $quizData.status
    }
    
    # Convert questions to API format
    foreach ($question in $quizData.questions) {
        $apiQuestion = @{
            question = $question.question
            options = @()
            difficulty = $question.difficulty
            points = $question.points
            timeLimit = $question.timeLimit
            explanation = ""
            hints = @()  # No hints as requested
        }
        
        foreach ($option in $question.options) {
            $apiQuestion.options += @{
                text = $option.text
                isCorrect = $option.isCorrect
            }
        }
        
        $apiQuizData.questions += $apiQuestion
    }
    
    # Convert to JSON
    $jsonPayload = $apiQuizData | ConvertTo-Json -Depth 10
    
    Write-Host "Creating flood safety quiz..." -ForegroundColor Green
    Write-Host "Payload preview:" -ForegroundColor Yellow
    Write-Host ($jsonPayload | ConvertFrom-Json | ConvertTo-Json -Depth 2)
    
    # Try to create the quiz
    try {
        $createResponse = Invoke-RestMethod -Uri "$baseUrl/quizzes" -Method POST -Body $jsonPayload -ContentType "application/json"
        Write-Host "✅ Quiz created successfully!" -ForegroundColor Green
        Write-Host "Quiz ID: $($createResponse._id)" -ForegroundColor Cyan
        Write-Host "Title: $($createResponse.title)" -ForegroundColor Cyan
        Write-Host "Questions: $($createResponse.questions.Count)" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "You can now access the quiz at:" -ForegroundColor Green
        Write-Host "http://localhost:8080/quiz/$($createResponse._id)/overview" -ForegroundColor Cyan
        
        # Save the quiz ID for reference
        $createResponse._id | Out-File -FilePath "flood-quiz-id.txt" -Encoding UTF8
        Write-Host "Quiz ID saved to flood-quiz-id.txt" -ForegroundColor Green
        
    } catch {
        Write-Host "❌ Failed to create quiz via API" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorContent = $reader.ReadToEnd()
            Write-Host "API Response: $errorContent" -ForegroundColor Red
        }
        
        Write-Host ""
        Write-Host "💡 Alternative: Manual Database Import" -ForegroundColor Yellow
        Write-Host "If the API doesn't work, you can manually import the quiz data:" -ForegroundColor Yellow
        Write-Host "1. Access your MongoDB database" -ForegroundColor Yellow
        Write-Host "2. Import the quiz data from flood-quiz-data.json" -ForegroundColor Yellow
        Write-Host "3. Make sure to set the moduleId to an existing module ID from your database" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Failed to get modules or create quiz" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure the backend server is running on http://localhost:5001" -ForegroundColor Yellow
    Write-Host "and that the API endpoints are accessible." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Script completed." -ForegroundColor Green
