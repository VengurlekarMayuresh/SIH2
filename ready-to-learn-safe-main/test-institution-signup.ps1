# Institution Registration Test Script

# Institution 1: Modern Public School
$institution1 = @{
  name = "Modern Public School"
  institutionId = "MPS2024"
  email = "admin@modernpublic.edu"
  password = "SchoolPass123!"
  phone = "9876543210"
  location = @{
    state = "Maharashtra"
    district = "Mumbai"
    city = "Mumbai"
    pincode = "400001"
    address = "123 Education Street, Andheri East"
  }
} | ConvertTo-Json -Depth 3

# Institution 2: Delhi International College
$institution2 = @{
  name = "Delhi International College"
  institutionId = "DIC001"
  email = "registrar@delhicollege.ac.in"
  password = "College@2024"
  phone = "9123456789"
  location = @{
    state = "Delhi"
    district = "New Delhi"
    city = "New Delhi"
    pincode = "110001"
    address = "45 Academic Road, Connaught Place"
  }
} | ConvertTo-Json -Depth 3

# Institution 3: Bangalore Tech Institute
$institution3 = @{
  name = "Bangalore Tech Institute"
  institutionId = "BTI2024"
  email = "info@bangaloretech.edu"
  password = "TechInst456#"
  phone = "9987654321"
  location = @{
    state = "Karnataka"
    district = "Bengaluru Urban"
    city = "Bengaluru"
    pincode = "560001"
    address = "78 Technology Park, Electronic City"
  }
} | ConvertTo-Json -Depth 3

# Test Institution 1
Write-Host "Testing Institution 1: Modern Public School" -ForegroundColor Green
try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:5001/api/institution/register" -Method POST -Body $institution1 -ContentType "application/json"
    Write-Host "SUCCESS: $($response1.Content)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Institution 2
Write-Host "`nTesting Institution 2: Delhi International College" -ForegroundColor Green
try {
    $response2 = Invoke-WebRequest -Uri "http://localhost:5001/api/institution/register" -Method POST -Body $institution2 -ContentType "application/json"
    Write-Host "SUCCESS: $($response2.Content)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Institution 3
Write-Host "`nTesting Institution 3: Bangalore Tech Institute" -ForegroundColor Green
try {
    $response3 = Invoke-WebRequest -Uri "http://localhost:5001/api/institution/register" -Method POST -Body $institution3 -ContentType "application/json"
    Write-Host "SUCCESS: $($response3.Content)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Institution registration tests completed!" -ForegroundColor Cyan
