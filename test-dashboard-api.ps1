# PowerShell script to test the dashboard API
Write-Host "Testing SafeEd Dashboard API..." -ForegroundColor Cyan

$API_BASE_URL = "http://localhost:5001/api"

try {
    # Test 1: Check if API server is running
    Write-Host "`n1. Testing API server connection..." -ForegroundColor Yellow
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5001" -Method GET -ErrorAction Stop
    $healthData = $healthResponse.Content | ConvertFrom-Json
    Write-Host "[SUCCESS] API Server is running: $($healthData.message)" -ForegroundColor Green

    # Test 2: Try to login with test student
    Write-Host "`n2. Testing student login..." -ForegroundColor Yellow
    $loginBody = @{
        email = "alice@student.test"
        password = "testpass123"
    } | ConvertTo-Json

    $loginHeaders = @{
        "Content-Type" = "application/json"
    }

    try {
        $loginResponse = Invoke-WebRequest -Uri "$API_BASE_URL/student/login" -Method POST -Body $loginBody -Headers $loginHeaders -ErrorAction Stop
        $loginData = $loginResponse.Content | ConvertFrom-Json
        Write-Host "[SUCCESS] Student login successful!" -ForegroundColor Green
        Write-Host "   Student: $($loginData.student.name)" -ForegroundColor Gray
        Write-Host "   Email: $($loginData.student.email)" -ForegroundColor Gray
        
        $token = $loginData.token
        
        # Test 3: Test dashboard-data endpoint
        Write-Host "`n3. Testing dashboard-data endpoint..." -ForegroundColor Yellow
        $dashboardHeaders = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $dashboardResponse = Invoke-WebRequest -Uri "$API_BASE_URL/student/dashboard-data" -Method GET -Headers $dashboardHeaders -ErrorAction Stop
        $dashboardData = $dashboardResponse.Content | ConvertFrom-Json
        
        Write-Host "[SUCCESS] Dashboard data received successfully!" -ForegroundColor Green
        Write-Host "`nDashboard Data:" -ForegroundColor Cyan
        Write-Host "   - Streak: $($dashboardData.streak)" -ForegroundColor Gray
        Write-Host "   - Recent Activity Count: $($dashboardData.recentActivity.Count)" -ForegroundColor Gray
        Write-Host "   - Today's Progress: $($dashboardData.todayProgress.completed)/$($dashboardData.todayProgress.goal) ($($dashboardData.todayProgress.percentage)%)" -ForegroundColor Gray
        Write-Host "   - Next Badge: $($dashboardData.nextBadge.name -or 'None available')" -ForegroundColor Gray
        
        Write-Host "`n[SUCCESS] Dashboard API is working correctly!" -ForegroundColor Green
        
    }
    catch {
        Write-Host "[ERROR] Login failed!" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            try {
                $errorResponse = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($errorResponse)
                $errorContent = $reader.ReadToEnd()
                Write-Host "   Response: $errorContent" -ForegroundColor Red
            } catch {
                Write-Host "   Could not read error response" -ForegroundColor Red
            }
        }
        
        Write-Host "`nPossible solutions:" -ForegroundColor Yellow
        Write-Host "   1. Create a test student account with email: alice@student.test" -ForegroundColor Gray
        Write-Host "   2. Or update the email/password in this script" -ForegroundColor Gray
    }

}
catch {
    Write-Host "[ERROR] API server connection failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    
    # Check if port 5001 is listening
    Write-Host "`nChecking if backend server is running..." -ForegroundColor Yellow
    $netstat = netstat -an | Select-String ":5001"
    if ($netstat) {
        Write-Host "[INFO] Port 5001 is listening:" -ForegroundColor Green
        $netstat | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    } else {
        Write-Host "[ERROR] Port 5001 is not listening!" -ForegroundColor Red
        Write-Host "   Backend server might not be running." -ForegroundColor Gray
    }
    
    Write-Host "`nPossible solutions:" -ForegroundColor Yellow
    Write-Host "   1. Start the backend server (npm start or node server.js)" -ForegroundColor Gray
    Write-Host "   2. Check if MongoDB is running" -ForegroundColor Gray
    Write-Host "   3. Check backend/.env file for configuration" -ForegroundColor Gray
}

Write-Host "`n" -NoNewline