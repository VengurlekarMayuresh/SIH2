# Raksha Setu Production Readiness Test
Write-Host "🚀 Testing Raksha Setu Production Readiness..." -ForegroundColor Green

# Test 1: Environment Files
Write-Host "`n📁 Checking Environment Files..."
if (Test-Path "E:\SIH2\backend\.env") {
    Write-Host "✅ Backend .env exists" -ForegroundColor Green
} else {
    Write-Host "❌ Backend .env missing" -ForegroundColor Red
}

if (Test-Path "E:\SIH2\ready-to-learn-safe-main\.env") {
    Write-Host "✅ Frontend .env exists" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend .env missing" -ForegroundColor Red
}

# Test 2: Backend API
Write-Host "`n🔧 Testing Backend..."
Set-Location "E:\SIH2\backend"

$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -PassThru
Start-Sleep 3

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/" -TimeoutSec 5
    Write-Host "✅ Backend API responding" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend API not responding" -ForegroundColor Red
}

# Test API endpoints
try {
    Invoke-RestMethod -Uri "http://localhost:5001/api/modules" -TimeoutSec 5 | Out-Null
    Write-Host "✅ Modules API working" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Modules API: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 3: Frontend Build
Write-Host "`n🏗️ Testing Frontend Build..."
Set-Location "E:\SIH2\ready-to-learn-safe-main"

try {
    npm run build | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
        if (Test-Path "dist") {
            Write-Host "✅ Build output created" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
if ($backend -and !$backend.HasExited) {
    Stop-Process -Id $backend.Id -Force
}

Write-Host "`n🎯 SUMMARY:" -ForegroundColor Cyan
Write-Host "If all tests show ✅, your app is ready to deploy!" -ForegroundColor Green
Write-Host "Next: Follow SIMPLE_DEPLOY_GUIDE.md" -ForegroundColor Yellow