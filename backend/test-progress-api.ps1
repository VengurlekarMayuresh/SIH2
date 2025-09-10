# Test script for Progress Dashboard API
$apiUrl = "http://localhost:5001/api"

Write-Host "Testing student login..." -ForegroundColor Yellow

try {
    # Test student login
    $loginBody = @{
        email = "alice@student.test"
        password = "testpass123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/student/login" -Method Post -Body $loginBody -ContentType "application/json"
    Write-Host "Student login successful" -ForegroundColor Green
    Write-Host "Student: $($loginResponse.student.name)" -ForegroundColor Cyan

    $token = $loginResponse.token
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    Write-Host "`nTesting progress dashboard endpoint..." -ForegroundColor Yellow
    
    # Test progress dashboard
    $progressResponse = Invoke-RestMethod -Uri "$apiUrl/student/progress-dashboard" -Method Get -Headers $headers
    Write-Host "Progress dashboard data received" -ForegroundColor Green
    
    Write-Host "`nProgress Statistics:" -ForegroundColor Magenta
    Write-Host "- Completed Modules: $($progressResponse.stats.completedModules)/$($progressResponse.stats.totalModules)" -ForegroundColor White
    Write-Host "- Latest Quiz Score: $([Math]::Round($progressResponse.stats.latestQuizScore))%" -ForegroundColor White
    Write-Host "- Earned Badges: $($progressResponse.stats.earnedBadges)" -ForegroundColor White
    Write-Host "- Overall Progress: $($progressResponse.stats.overallProgress)%" -ForegroundColor White
    
    Write-Host "`nQuiz Score Data Points: $($progressResponse.quizScoreData.Count)" -ForegroundColor Cyan
    Write-Host "Modules: $($progressResponse.moduleProgressData.Count)" -ForegroundColor Cyan
    
    if ($progressResponse.moduleProgressData.Count -gt 0) {
        $progressResponse.moduleProgressData | ForEach-Object {
            Write-Host "- $($_.module): $($_.progress)%" -ForegroundColor White
        }
    }
    
    Write-Host "`nTotal Badges Available: $($progressResponse.badges.Count)" -ForegroundColor Magenta
    $earnedBadges = $progressResponse.badges | Where-Object { $_.earned -eq $true }
    Write-Host "- Earned Badges: $($earnedBadges.Count)" -ForegroundColor Green
    
    if ($earnedBadges.Count -gt 0) {
        $earnedBadges | ForEach-Object {
            Write-Host "  - $($_.title) $($_.icon)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`nProgress dashboard API working correctly!" -ForegroundColor Green

} catch {
    Write-Host "Error testing progress dashboard:" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    } else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
