# SafeEd Production Readiness Test Script
Write-Host "🚀 Testing SafeEd for Production Deployment..." -ForegroundColor Green
Write-Host "=" * 50

# Test 1: Check environment files
Write-Host "`n📁 Test 1: Checking Environment Files..." -ForegroundColor Yellow

$backendEnv = "E:\SIH2\backend\.env"
$frontendEnv = "E:\SIH2\ready-to-learn-safe-main\.env"

if (Test-Path $backendEnv) {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
    $envContent = Get-Content $backendEnv
    if ($envContent -match "MONGODB_URI=") { Write-Host "✅ Database URL configured" -ForegroundColor Green }
    if ($envContent -match "JWT_SECRET=") { Write-Host "✅ JWT secret configured" -ForegroundColor Green }
    if ($envContent -match "CLOUDINARY_") { Write-Host "✅ Cloudinary configured" -ForegroundColor Green }
} else {
    Write-Host "❌ Backend .env file missing" -ForegroundColor Red
}

if (Test-Path $frontendEnv) {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
    $frontendEnvContent = Get-Content $frontendEnv
    if ($frontendEnvContent -match "VITE_API_URL=") { Write-Host "✅ API URL configured" -ForegroundColor Green }
} else {
    Write-Host "❌ Frontend .env file missing" -ForegroundColor Red
}

# Test 2: Check if backend starts successfully
Write-Host "`n🔧 Test 2: Testing Backend Startup..." -ForegroundColor Yellow

Set-Location "E:\SIH2\backend"

# Start backend in background
$backendProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -PassThru
Start-Sleep 5

# Test if backend is responding
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/" -TimeoutSec 10
    if ($response.status -eq "success") {
        Write-Host "✅ Backend started successfully" -ForegroundColor Green
        Write-Host "✅ API endpoint responding: $($response.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend failed to start or respond" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Check API endpoints
Write-Host "`n🌐 Test 3: Testing API Endpoints..." -ForegroundColor Yellow

$endpoints = @(
    @{url = "http://localhost:5001/api/modules"; name = "Modules"}
    @{url = "http://localhost:5001/api/weather/current"; name = "Weather"}
)

foreach ($endpoint in $endpoints) {
    try {
        $apiResponse = Invoke-RestMethod -Uri $endpoint.url -TimeoutSec 10
        Write-Host "✅ $($endpoint.name) API working" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 401) {
            Write-Host "✅ $($endpoint.name) API secured (401 auth required)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($endpoint.name) API: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# Test 4: Build frontend for production
Write-Host "`n🏗️  Test 4: Testing Frontend Production Build..." -ForegroundColor Yellow

Set-Location "E:\SIH2\ready-to-learn-safe-main"

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend builds successfully for production" -ForegroundColor Green
        
        # Check if dist folder was created
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "✅ Production build created (Size: $([math]::Round($distSize, 2)) MB)" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Build test failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Check for hardcoded URLs
Write-Host "`n🔍 Test 5: Checking for Hardcoded URLs..." -ForegroundColor Yellow

$hardcodedFound = $false
$searchPaths = @("src\pages", "src\components")

foreach ($path in $searchPaths) {
    if (Test-Path $path) {
        $hardcodedUrls = Select-String -Path "$path\*.tsx" -Pattern "http://localhost|https://localhost" -SimpleMatch
        if ($hardcodedUrls) {
            Write-Host "❌ Found hardcoded localhost URLs:" -ForegroundColor Red
            $hardcodedUrls | ForEach-Object { Write-Host "   $($_.Filename):$($_.LineNumber)" -ForegroundColor Red }
            $hardcodedFound = $true
        }
    }
}

if (-not $hardcodedFound) {
    Write-Host "✅ No hardcoded localhost URLs found" -ForegroundColor Green
}

# Test 6: Environment variable usage check
Write-Host "`n🔧 Test 6: Checking Environment Variable Usage..." -ForegroundColor Yellow

$apiTsPath = "src\utils\api.ts"
if (Test-Path $apiTsPath) {
    $apiContent = Get-Content $apiTsPath -Raw
    if ($apiContent -match "VITE_API_URL") {
        Write-Host "✅ Frontend uses environment variables for API URL" -ForegroundColor Green
    } else {
        Write-Host "❌ API client not using environment variables" -ForegroundColor Red
    }
} else {
    Write-Host "❌ API utility file not found" -ForegroundColor Red
}

# Cleanup
Write-Host "`n🧹 Cleaning up..." -ForegroundColor Yellow
if ($backendProcess -and !$backendProcess.HasExited) {
    Stop-Process -Id $backendProcess.Id -Force
    Write-Host "✅ Backend process stopped" -ForegroundColor Green
}

# Final Summary
Write-Host "`n" + "=" * 50
Write-Host "🎯 PRODUCTION READINESS SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`nIf all tests passed ✅, your app is ready to deploy!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Deploy backend to Railway (or similar platform)" -ForegroundColor White
Write-Host "2. Deploy frontend to Netlify (or similar platform)" -ForegroundColor White
Write-Host "3. Update VITE_API_URL to point to your deployed backend" -ForegroundColor White
Write-Host "4. Update FRONTEND_URL in backend to point to your deployed frontend" -ForegroundColor White

Write-Host "`n📖 See SIMPLE_DEPLOY_GUIDE.md for detailed deployment instructions" -ForegroundColor Cyan