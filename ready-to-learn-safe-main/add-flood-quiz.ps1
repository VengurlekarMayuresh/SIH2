# Script to add flood safety quiz with questions
# Note: Remove hints as per user request

# First, login as an institution to get a token
$institutionLogin = @{
  email = "test@institution.com"
  password = "TestPass123!"
} | ConvertTo-Json

try {
  $loginResponse = Invoke-WebRequest -Uri "http://localhost:5001/api/institution/login" -Method POST -Body $institutionLogin -ContentType "application/json"
  $loginData = $loginResponse.Content | ConvertFrom-Json
  $token = $loginData.token
  Write-Host "✅ Login successful, got token"
} catch {
  Write-Host "❌ Login failed: $($_.Exception.Message)"
  exit
}

$headers = @{
  "Authorization" = "Bearer $token"
  "Content-Type" = "application/json"
}

# First, get the flood module ID
try {
  $modulesResponse = Invoke-WebRequest -Uri "http://localhost:5001/api/modules" -Method GET -Headers $headers
  $modules = $modulesResponse.Content | ConvertFrom-Json
  $floodModule = $modules | Where-Object { $_.title -like "*Flood*" }
  
  if (-not $floodModule) {
    Write-Host "❌ Flood module not found"
    exit
  }
  
  $moduleId = $floodModule._id
  Write-Host "✅ Found flood module: $($floodModule.title)"
} catch {
  Write-Host "❌ Failed to get modules: $($_.Exception.Message)"
  exit
}

# Flood quiz questions (without hints as requested)
$floodQuiz = @{
  title = "Flood Safety Quiz"
  description = "Test your knowledge of flood safety and preparedness measures"
  moduleId = $moduleId
  questions = @(
    @{
      question = "Before a flood, where should you place valuables, important documents, and hazardous substances?"
      options = @(
        @{ text = "In the basement for safekeeping."; isCorrect = $false }
        @{ text = "In a waterproof bag on the ground floor."; isCorrect = $false }
        @{ text = "On an elevated surface, as high as possible."; isCorrect = $true }
        @{ text = "Outside the house in a secure container."; isCorrect = $false }
      )
      difficulty = "medium"
      points = 10
      timeLimit = 30
    },
    @{
      question = "What should you do with doors and windows when a flood is imminent?"
      options = @(
        @{ text = "Keep them slightly ajar for ventilation."; isCorrect = $false }
        @{ text = "Reinforce them with sandbags."; isCorrect = $false }
        @{ text = "Close all doors and windows and seal off all low-down gaps or openings in your home as best as you can."; isCorrect = $true }
        @{ text = "Leave them open to allow water to flow through."; isCorrect = $false }
      )
      difficulty = "medium"
      points = 10
      timeLimit = 30
    },
    @{
      question = "What utility supplies should be turned off at the mains when a flood is imminent?"
      options = @(
        @{ text = "Water and internet."; isCorrect = $false }
        @{ text = "Heating and cooling."; isCorrect = $false }
        @{ text = "The gas and electricity supply."; isCorrect = $true }
        @{ text = "Telephone and sewage."; isCorrect = $false }
      )
      difficulty = "medium"
      points = 10
      timeLimit = 30
    },
    @{
      question = "If ordered to evacuate during a flood, what action is strongly advised?"
      options = @(
        @{ text = "Wait for the flood to recede slightly."; isCorrect = $false }
        @{ text = "Do not wait until the last moment."; isCorrect = $true }
        @{ text = "Take as many belongings as possible."; isCorrect = $false }
        @{ text = "Inform only emergency services of your departure."; isCorrect = $false }
      )
      difficulty = "easy"
      points = 10
      timeLimit = 30
    },
    @{
      question = "What should you never attempt to do during a flood, whether on foot or in a car?"
      options = @(
        @{ text = "Signal your location."; isCorrect = $false }
        @{ text = "Move to an upper floor."; isCorrect = $false }
        @{ text = "Listen to the radio."; isCorrect = $false }
        @{ text = "Cross a flooded area."; isCorrect = $true }
      )
      difficulty = "hard"
      points = 15
      timeLimit = 30
    },
    @{
      question = "What specific danger should you stay away from if it has fallen to the ground during a flood?"
      options = @(
        @{ text = "Trees"; isCorrect = $false }
        @{ text = "Any electrical power lines."; isCorrect = $true }
        @{ text = "Fences"; isCorrect = $false }
        @{ text = "Street signs"; isCorrect = $false }
      )
      difficulty = "hard"
      points = 15
      timeLimit = 30
    },
    @{
      question = "What is the instruction regarding school children in case of a flood during school hours?"
      options = @(
        @{ text = "Parents should collect them immediately."; isCorrect = $false }
        @{ text = "Children should be sent home early."; isCorrect = $false }
        @{ text = "They are taken care of by teachers who are trained for such events, and parents should not collect them."; isCorrect = $true }
        @{ text = "They should be moved to the lowest floor for safety."; isCorrect = $false }
      )
      difficulty = "medium"
      points = 10
      timeLimit = 30
    },
    @{
      question = "If you are outdoors during a flood, what should you keep away from?"
      options = @(
        @{ text = "Roads and pavements."; isCorrect = $false }
        @{ text = "Other people."; isCorrect = $false }
        @{ text = "Rivers, rapids, or any other body of water."; isCorrect = $true }
        @{ text = "High ground."; isCorrect = $false }
      )
      difficulty = "medium"
      points = 10
      timeLimit = 30
    },
    @{
      question = "What is specifically mentioned about cars as shelters during a flood?"
      options = @(
        @{ text = "They are good for temporary shelter."; isCorrect = $false }
        @{ text = "They can provide protection from debris."; isCorrect = $false }
        @{ text = "Cars are not adequate shelters."; isCorrect = $true }
        @{ text = "They are safe as long as they are on high ground."; isCorrect = $false }
      )
      difficulty = "easy"
      points = 10
      timeLimit = 30
    },
    @{
      question = "If you are isolated during a flood, what should you do to help others find you?"
      options = @(
        @{ text = "Call family members repeatedly."; isCorrect = $false }
        @{ text = "Turn off all lights."; isCorrect = $false }
        @{ text = "Signal your location."; isCorrect = $true }
        @{ text = "Stay completely still and quiet."; isCorrect = $false }
      )
      difficulty = "easy"
      points = 10
      timeLimit = 30
    }
  )
  settings = @{
    timeLimit = 15  # 15 minutes total
    passingScore = 70
    maxAttempts = 3
    randomizeQuestions = $true
    randomizeOptions = $true
    showCorrectAnswers = $true
    allowRetake = $true
    retakeDelay = 0
  }
  status = "active"
}

# Create the quiz
try {
  $quizJson = $floodQuiz | ConvertTo-Json -Depth 10
  $quizResponse = Invoke-WebRequest -Uri "http://localhost:5001/api/quizzes" -Method POST -Body $quizJson -Headers $headers
  $createdQuiz = $quizResponse.Content | ConvertFrom-Json
  
  Write-Host "✅ Flood Safety Quiz created successfully!"
  Write-Host "   Quiz ID: $($createdQuiz._id)"
  Write-Host "   Title: $($createdQuiz.title)"
  Write-Host "   Questions: $($createdQuiz.questions.Count)"
  Write-Host "   Passing Score: $($createdQuiz.settings.passingScore)%"
  Write-Host "   Time Limit: $($createdQuiz.settings.timeLimit) minutes"
  
} catch {
  Write-Host "❌ Failed to create quiz: $($_.Exception.Message)"
  if ($_.Exception.Response) {
    $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host "   Response: $responseBody"
  }
}

Write-Host ""
Write-Host "🎯 Flood quiz setup complete!"
Write-Host "   Students can now access the flood safety quiz through the quiz section"
Write-Host "   No hints are provided - students must rely on their knowledge"
Write-Host "   Submission issues should be resolved with proper API endpoints"
