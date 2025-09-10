# Login Test Script for Both Institution and Student

Write-Host "🔐 TESTING LOGIN FUNCTIONALITY" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Institution Login Tests
Write-Host "📚 TESTING INSTITUTION LOGINS" -ForegroundColor Yellow
Write-Host "------------------------------`n"

$institutionLogins = @(
    @{
        name = "Modern Public School"
        email = "admin@modernpublic.edu"
        password = "SchoolPass123!"
    },
    @{
        name = "Delhi International College"
        email = "registrar@delhicollege.ac.in"
        password = "College@2024"
    },
    @{
        name = "Bangalore Tech Institute"
        email = "info@bangaloretech.edu"
        password = "TechInst456#"
    }
)

foreach ($login in $institutionLogins) {
    Write-Host "Testing Login: $($login.name)" -ForegroundColor Green
    
    $loginData = @{
        email = $login.email
        password = $login.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/api/institution/login" -Method POST -Body $loginData -ContentType "application/json"
        $responseData = $response.Content | ConvertFrom-Json
        Write-Host "✅ LOGIN SUCCESS" -ForegroundColor Green
        Write-Host "   Token: $($responseData.token.Substring(0,50))..." -ForegroundColor Gray
        Write-Host "   Institution ID: $($responseData.institution.institutionId)" -ForegroundColor Gray
        Write-Host "   Name: $($responseData.institution.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ LOGIN FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host "----------------------------------------`n"
}

# Student Login Tests  
Write-Host "👨‍🎓 TESTING STUDENT LOGINS" -ForegroundColor Yellow
Write-Host "---------------------------`n"

$studentLogins = @(
    @{
        name = "Rahul Sharma"
        email = "rahul.sharma@student.com"
        password = "Student123!"
    },
    @{
        name = "Priya Patel"
        email = "priya.patel@student.com"
        password = "MyPass456#"
    },
    @{
        name = "Arjun Kumar"
        email = "arjun.kumar@student.com"
        password = "SecurePass789@"
    },
    @{
        name = "Sneha Gupta"
        email = "sneha.gupta@college.com"
        password = "College2024!"
    },
    @{
        name = "Vikram Singh"
        email = "vikram.singh@college.com"
        password = "VikPass567#"
    },
    @{
        name = "Aisha Khan"
        email = "aisha.khan@tech.com"
        password = "TechLife123@"
    }
)

foreach ($login in $studentLogins) {
    Write-Host "Testing Login: $($login.name)" -ForegroundColor Green
    
    $loginData = @{
        email = $login.email
        password = $login.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/api/student/login" -Method POST -Body $loginData -ContentType "application/json"
        $responseData = $response.Content | ConvertFrom-Json
        Write-Host "✅ LOGIN SUCCESS" -ForegroundColor Green
        Write-Host "   Token: $($responseData.token.Substring(0,50))..." -ForegroundColor Gray
        Write-Host "   Student Name: $($responseData.student.name)" -ForegroundColor Gray
        Write-Host "   Institution: $($responseData.student.institution.name)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ LOGIN FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host "----------------------------------------`n"
}

Write-Host "🎯 LOGIN TESTS COMPLETED!" -ForegroundColor Cyan
