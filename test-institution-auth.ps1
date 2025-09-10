# Institution Auth Testing Script
# Make sure your backend server is running first!

$baseUrl = "http://localhost:5000/api"

Write-Host "🏫 INSTITUTION AUTHENTICATION TESTING" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        'Content-Type' = 'application/json'
    }
    
    if ($Token) {
        $headers['Authorization'] = "Bearer $Token"
    }
    
    try {
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers -Body $jsonBody
        } else {
            $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $headers
        }
        return $response
    } catch {
        Write-Host "❌ Request failed: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $responseBody = $reader.ReadToEnd()
            Write-Host "Response: $responseBody" -ForegroundColor Red
        }
        return $null
    }
}

Write-Host "`n1️⃣ Testing Institution Signup..." -ForegroundColor Yellow

# Test Institution Signup
$newInstitution = @{
    name = "Test High School"
    institutionId = "THS999"
    email = "admin@testschool.edu"
    password = "admin123"
    phone = "+1-555-9999"
    address = "999 Test Ave, Test City, TC 99999"
    location = @{
        city = "Test City"
        state = "Test State"
        country = "USA"
    }
    principalName = "Dr. Test Principal"
    establishedYear = 2024
    totalStudents = 500
    website = "https://testschool.edu"
}

$signupResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/institution/register" -Body $newInstitution

if ($signupResponse) {
    Write-Host "✅ Institution signup successful!" -ForegroundColor Green
    Write-Host "Institution: $($signupResponse.institution.name)" -ForegroundColor Green
    Write-Host "ID: $($signupResponse.institution.institutionId)" -ForegroundColor Green
    Write-Host "Email: $($signupResponse.institution.email)" -ForegroundColor Green
    
    # Test duplicate signup (should fail)
    Write-Host "`n2️⃣ Testing duplicate signup (should fail)..." -ForegroundColor Yellow
    $duplicateResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/institution/register" -Body $newInstitution
    if (-not $duplicateResponse) {
        Write-Host "✅ Duplicate signup correctly rejected!" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Institution signup failed!" -ForegroundColor Red
}

Write-Host "`n3️⃣ Testing Institution Login with existing data..." -ForegroundColor Yellow

# Test login with pre-existing institution (from mock data)
$loginData = @{
    email = "admin@lincolnhigh.edu"
    password = "admin123"
}

$loginResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/institution/login" -Body $loginData

if ($loginResponse) {
    Write-Host "✅ Institution login successful!" -ForegroundColor Green
    Write-Host "Institution: $($loginResponse.institution.name)" -ForegroundColor Green
    Write-Host "Token received: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Green
    
    # Test protected route
    Write-Host "`n4️⃣ Testing protected route access..." -ForegroundColor Yellow
    $studentsResponse = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/institution/students" -Token $loginResponse.token
    
    if ($studentsResponse) {
        Write-Host "✅ Protected route access successful!" -ForegroundColor Green
        Write-Host "Found $($studentsResponse.total) students" -ForegroundColor Green
        if ($studentsResponse.students.Count -gt 0) {
            Write-Host "Sample student: $($studentsResponse.students[0].name) - Class $($studentsResponse.students[0].class)" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "❌ Institution login failed!" -ForegroundColor Red
}

Write-Host "`n5️⃣ Testing invalid login..." -ForegroundColor Yellow

$invalidLogin = @{
    email = "admin@lincolnhigh.edu"
    password = "wrongpassword"
}

$invalidResponse = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/institution/login" -Body $invalidLogin
if (-not $invalidResponse) {
    Write-Host "✅ Invalid login correctly rejected!" -ForegroundColor Green
}

Write-Host "`n🎯 INSTITUTION TEST CREDENTIALS:" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host "Lincoln High School:" -ForegroundColor White
Write-Host "  Email: admin@lincolnhigh.edu" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Riverside Academy:" -ForegroundColor White  
Write-Host "  Email: admin@riverside.edu" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray
Write-Host ""
Write-Host "Greenfield College Prep:" -ForegroundColor White
Write-Host "  Email: admin@greenfield.edu" -ForegroundColor Gray
Write-Host "  Password: admin123" -ForegroundColor Gray

Write-Host "`n✅ Institution authentication testing completed!" -ForegroundColor Green
