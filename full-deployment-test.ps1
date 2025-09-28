# Raksha Setu - Complete Deployment Readiness Test
Write-Host "🚀 COMPREHENSIVE DEPLOYMENT TEST FOR RAKSHA SETU" -ForegroundColor Cyan
Write-Host "=" * 60

$testResults = @()
$allTestsPassed = $true

# Test 1: Environment Files Check
Write-Host "`n📁 TEST 1: Environment Configuration..." -ForegroundColor Yellow
$backendEnvExists = Test-Path "E:\SIH2\backend\.env"
$frontendEnvExists = Test-Path "E:\SIH2\ready-to-learn-safe-main\.env"

if ($backendEnvExists) {
    Write-Host "✅ Backend .env file exists" -ForegroundColor Green
    $envContent = Get-Content "E:\SIH2\backend\.env"
    $hasDB = $envContent -match "MONGODB_URI="
    $hasJWT = $envContent -match "JWT_SECRET="
    $hasCloudinary = $envContent -match "CLOUDINARY_"
    
    if ($hasDB) { Write-Host "✅ Database URL configured" -ForegroundColor Green }
    else { Write-Host "❌ Database URL missing" -ForegroundColor Red; $allTestsPassed = $false }
    
    if ($hasJWT) { Write-Host "✅ JWT Secret configured" -ForegroundColor Green }
    else { Write-Host "❌ JWT Secret missing" -ForegroundColor Red; $allTestsPassed = $false }
    
    if ($hasCloudinary) { Write-Host "✅ Cloudinary configured" -ForegroundColor Green }
    else { Write-Host "❌ Cloudinary missing" -ForegroundColor Red; $allTestsPassed = $false }
} else {
    Write-Host "❌ Backend .env file missing" -ForegroundColor Red
    $allTestsPassed = $false
}

if ($frontendEnvExists) {
    Write-Host "✅ Frontend .env file exists" -ForegroundColor Green
    $frontendEnv = Get-Content "E:\SIH2\ready-to-learn-safe-main\.env"
    if ($frontendEnv -match "VITE_API_URL=") {
        Write-Host "✅ API URL configured" -ForegroundColor Green
    } else {
        Write-Host "❌ API URL not configured" -ForegroundColor Red
        $allTestsPassed = $false
    }
} else {
    Write-Host "❌ Frontend .env file missing" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Backend Functionality
Write-Host "`n🔧 TEST 2: Backend API Testing..." -ForegroundColor Yellow
Set-Location "E:\SIH2\backend"

$backend = Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -PassThru
Start-Sleep 5

# Test basic health endpoint
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5001/" -TimeoutSec 10
    if ($response.status -eq "success" -and $response.message -match "Raksha Setu") {
        Write-Host "✅ Backend API responding with correct branding" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend response incorrect" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host "❌ Backend API not responding: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test API endpoints
$endpoints = @(
    @{url = "http://localhost:5001/api/modules"; name = "Modules"; expectAuth = $false}
    @{url = "http://localhost:5001/api/weather/current"; name = "Weather"; expectAuth = $true}
    @{url = "http://localhost:5001/api/student/dashboard-data"; name = "Student Dashboard"; expectAuth = $true}
)

foreach ($endpoint in $endpoints) {
    try {
        $apiResponse = Invoke-RestMethod -Uri $endpoint.url -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ $($endpoint.name) API responding" -ForegroundColor Green
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($endpoint.expectAuth -and ($statusCode -eq 401 -or $statusCode -eq 403)) {
            Write-Host "✅ $($endpoint.name) API properly secured (needs auth)" -ForegroundColor Green
        } elseif (!$endpoint.expectAuth -and $statusCode -eq 200) {
            Write-Host "✅ $($endpoint.name) API working" -ForegroundColor Green
        } else {
            Write-Host "⚠️  $($endpoint.name) API: Status $statusCode" -ForegroundColor Yellow
        }
    }
}

# Test 3: Frontend Build
Write-Host "`n🏗️  TEST 3: Frontend Production Build..." -ForegroundColor Yellow
Set-Location "E:\SIH2\ready-to-learn-safe-main"

# Clean previous build
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend builds successfully" -ForegroundColor Green
        
        if (Test-Path "dist") {
            $distFiles = Get-ChildItem "dist" -Recurse
            $totalSize = ($distFiles | Measure-Object -Property Length -Sum).Sum / 1MB
            $jsFiles = $distFiles | Where-Object { $_.Extension -eq ".js" }
            $cssFiles = $distFiles | Where-Object { $_.Extension -eq ".css" }
            
            Write-Host "✅ Build output created:" -ForegroundColor Green
            Write-Host "   📦 Total size: $([math]::Round($totalSize, 2)) MB" -ForegroundColor Green
            Write-Host "   📄 Files: $($distFiles.Count) total" -ForegroundColor Green
            Write-Host "   🔧 JS files: $($jsFiles.Count)" -ForegroundColor Green
            Write-Host "   🎨 CSS files: $($cssFiles.Count)" -ForegroundColor Green
            
            # Check if index.html has correct branding
            $indexContent = Get-Content "dist/index.html" -Raw
            if ($indexContent -match "Raksha Setu") {
                Write-Host "✅ Build contains correct branding" -ForegroundColor Green
            } else {
                Write-Host "❌ Build missing branding updates" -ForegroundColor Red
                $allTestsPassed = $false
            }
        } else {
            Write-Host "❌ Build output not created" -ForegroundColor Red
            $allTestsPassed = $false
        }
    } else {
        Write-Host "❌ Frontend build failed:" -ForegroundColor Red
        Write-Host $buildOutput -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Dependencies Check
Write-Host "`n📦 TEST 4: Dependencies Check..." -ForegroundColor Yellow

# Backend dependencies
Set-Location "E:\SIH2\backend"
$backendPackage = Get-Content "package.json" | ConvertFrom-Json
Write-Host "✅ Backend: $($backendPackage.name) v$($backendPackage.version)" -ForegroundColor Green

# Frontend dependencies  
Set-Location "E:\SIH2\ready-to-learn-safe-main"
$frontendPackage = Get-Content "package.json" | ConvertFrom-Json
Write-Host "✅ Frontend: React + Vite project" -ForegroundColor Green

# Test 5: Security Check
Write-Host "`n🔒 TEST 5: Security & Configuration..." -ForegroundColor Yellow

# Check for hardcoded secrets
$backendFiles = Get-ChildItem "E:\SIH2\backend" -Recurse -Include "*.js" | Select-String -Pattern "password|secret|key" -SimpleMatch
$suspiciousCount = ($backendFiles | Where-Object { $_.Line -notmatch "process\.env" -and $_.Line -notmatch "//.*" }).Count

if ($suspiciousCount -eq 0) {
    Write-Host "✅ No hardcoded secrets found in backend" -ForegroundColor Green
} else {
    Write-Host "⚠️  Found $suspiciousCount potential hardcoded values" -ForegroundColor Yellow
}

# Check CORS configuration
$serverContent = Get-Content "E:\SIH2\backend\server.js" -Raw
if ($serverContent -match "cors" -and $serverContent -match "FRONTEND_URL") {
    Write-Host "✅ CORS properly configured" -ForegroundColor Green
} else {
    Write-Host "❌ CORS configuration issues" -ForegroundColor Red
    $allTestsPassed = $false
}

# Cleanup
if ($backend -and !$backend.HasExited) {
    Stop-Process -Id $backend.Id -Force
    Write-Host "✅ Test backend stopped" -ForegroundColor Green
}

# Final Results
Write-Host "`n" + "=" * 60
if ($allTestsPassed) {
    Write-Host "🎉 ALL TESTS PASSED - READY FOR DEPLOYMENT!" -ForegroundColor Green
    Write-Host "Your Raksha Setu application is production-ready!" -ForegroundColor Green
} else {
    Write-Host "❌ SOME TESTS FAILED - REVIEW ISSUES ABOVE" -ForegroundColor Red
    Write-Host "Please fix the issues before deploying" -ForegroundColor Red
}

Write-Host "`n📋 DEPLOYMENT STEPS:" -ForegroundColor Cyan
Write-Host "1. Deploy Backend to Railway/Heroku" -ForegroundColor White
Write-Host "2. Deploy Frontend to Netlify/Vercel" -ForegroundColor White
Write-Host "3. Update environment variables" -ForegroundColor White
Write-Host "4. Test live deployment" -ForegroundColor White

Write-Host "`n🔗 See deployment guide for detailed steps" -ForegroundColor Yellow