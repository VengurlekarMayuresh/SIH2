# Student Registration Test Script

# Students for Modern Public School (MPS2024)
$student1 = @{
  name = "Rahul Sharma"
  institutionId = "MPS2024"
  rollNo = "MPS001"
  class = "12"
  division = "A"
  email = "rahul.sharma@student.com"
  password = "Student123!"
  phone = "9876543211"
  parentPhone = "9876543200"
} | ConvertTo-Json

$student2 = @{
  name = "Priya Patel"
  institutionId = "MPS2024"
  rollNo = "MPS002"
  class = "11"
  division = "B"
  email = "priya.patel@student.com"
  password = "MyPass456#"
  phone = "9876543212"
  parentPhone = "9876543201"
} | ConvertTo-Json

$student3 = @{
  name = "Arjun Kumar"
  institutionId = "MPS2024"
  rollNo = "MPS003"
  class = "10"
  division = "A"
  email = "arjun.kumar@student.com"
  password = "SecurePass789@"
  phone = "9876543213"
  parentPhone = "9876543202"
} | ConvertTo-Json

# Students for Delhi International College (DIC001)
$student4 = @{
  name = "Sneha Gupta"
  institutionId = "DIC001"
  rollNo = "DIC001"
  class = "1st Year"
  division = "CS"
  email = "sneha.gupta@college.com"
  password = "College2024!"
  phone = "9123456788"
  parentPhone = "9123456700"
} | ConvertTo-Json

$student5 = @{
  name = "Vikram Singh"
  institutionId = "DIC001"
  rollNo = "DIC002"
  class = "2nd Year"
  division = "ECE"
  email = "vikram.singh@college.com"
  password = "VikPass567#"
  phone = "9123456787"
  parentPhone = "9123456701"
} | ConvertTo-Json

# Students for Bangalore Tech Institute (BTI2024)
$student6 = @{
  name = "Aisha Khan"
  institutionId = "BTI2024"
  rollNo = "BTI001"
  class = "3rd Year"
  division = "IT"
  email = "aisha.khan@tech.com"
  password = "TechLife123@"
  phone = "9987654320"
  parentPhone = "9987654300"
} | ConvertTo-Json

# Test all students
$students = @(
  @{data = $student1; name = "Rahul Sharma (MPS2024)"},
  @{data = $student2; name = "Priya Patel (MPS2024)"},
  @{data = $student3; name = "Arjun Kumar (MPS2024)"},
  @{data = $student4; name = "Sneha Gupta (DIC001)"},
  @{data = $student5; name = "Vikram Singh (DIC001)"},
  @{data = $student6; name = "Aisha Khan (BTI2024)"}
)

foreach ($student in $students) {
    Write-Host "Testing Student: $($student.name)" -ForegroundColor Green
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5001/api/student/register" -Method POST -Body $student.data -ContentType "application/json"
        Write-Host "SUCCESS: $($response.Content)" -ForegroundColor Green
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host "----------------------------------------`n"
}

Write-Host "✅ Student registration tests completed!" -ForegroundColor Cyan
