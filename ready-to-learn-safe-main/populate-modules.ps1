# Script to populate disaster safety modules

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

# Disaster modules data
$modules = @(
  @{
    title = "Earthquake Safety"
    description = "Learn how to prepare for and respond to earthquakes. Master the Drop, Cover, and Hold On technique and understand seismic safety."
    thumbnail = "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400"
    chapters = @(
      @{
        title = "Before an Earthquake"
        contents = @(
          @{
            type = "text"
            body = "Create an emergency kit with water, food, and first aid supplies for at least 72 hours. Store 4 liters of water per person per day."
          },
          @{
            type = "text"
            body = "Identify safe spots in each room - under sturdy tables, away from windows and mirrors. Practice Drop, Cover, and Hold On drills regularly."
          },
          @{
            type = "text"
            body = "Secure heavy furniture and appliances to walls using brackets and straps. Develop a family communication plan with meeting points."
          }
        )
      },
      @{
        title = "During an Earthquake"
        contents = @(
          @{
            type = "text"
            body = "Drop to hands and knees immediately when shaking starts. Don't try to run outside as most injuries occur from falling objects."
          },
          @{
            type = "text"
            body = "Take cover under a sturdy desk or table. If no table is available, cover your head and neck with your arms."
          },
          @{
            type = "text"
            body = "Hold on to your shelter and protect your head and neck. Be prepared to move with your shelter if it shifts."
          }
        )
      },
      @{
        title = "After an Earthquake"
        contents = @(
          @{
            type = "text"
            body = "Check for injuries and provide first aid if needed. Do not move seriously injured persons unless they are in immediate danger."
          },
          @{
            type = "text"
            body = "Inspect your home for damage. Look for cracks in the foundation, chimney, or walls. Be prepared for aftershocks."
          }
        )
      }
    )
  },
  @{
    title = "Flood Safety"
    description = "Understand flood safety and evacuation procedures. Learn about flood risks and how to protect yourself and your property."
    thumbnail = "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400"
    chapters = @(
      @{
        title = "Flood Preparation"
        contents = @(
          @{
            type = "text"
            body = "Know your area's flood risk and evacuation routes. Sign up for local emergency alerts and warnings."
          },
          @{
            type = "text"
            body = "Create a flood emergency kit with essentials including waterproof containers for important documents."
          }
        )
      },
      @{
        title = "During a Flood"
        contents = @(
          @{
            type = "text"
            body = "Move to higher ground immediately if flooding occurs. Avoid walking or driving through flood waters - just 6 inches can knock you over."
          },
          @{
            type = "text"
            body = "Turn Around, Don't Drown! 12 inches of moving water can carry away vehicles. Find an alternate route."
          }
        )
      }
    )
  },
  @{
    title = "Fire Safety"
    description = "Master fire safety protocols and escape routes. Learn fire prevention, detection, and emergency response procedures."
    thumbnail = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
    chapters = @(
      @{
        title = "Fire Prevention"
        contents = @(
          @{
            type = "text"
            body = "Install smoke detectors and check batteries monthly. Test smoke detectors regularly and replace batteries at least once a year."
          },
          @{
            type = "text"
            body = "Create and practice a home fire escape plan with two ways out of every room. Identify a meeting point outside."
          }
        )
      },
      @{
        title = "Fire Emergency Response"
        contents = @(
          @{
            type = "text"
            body = "Get out immediately and call emergency services. Stay low to avoid smoke inhalation - smoke rises, so cleaner air is closer to the floor."
          },
          @{
            type = "text"
            body = "Feel doors before opening - if hot, use your alternate route. Never use elevators during a fire."
          }
        )
      }
    )
  },
  @{
    title = "Cyclone Safety"
    description = "Prepare for severe weather and wind storms. Learn about cyclone formation, tracking, and safety measures."
    thumbnail = "https://images.unsplash.com/photo-1527482797697-8795b05a13da?w=400"
    chapters = @(
      @{
        title = "Cyclone Preparation"
        contents = @(
          @{
            type = "text"
            body = "Monitor weather forecasts and warnings from official sources. Know your evacuation zone and routes."
          },
          @{
            type = "text"
            body = "Secure outdoor furniture and objects that could become projectiles in strong winds."
          }
        )
      },
      @{
        title = "During a Cyclone"
        contents = @(
          @{
            type = "text"
            body = "Stay indoors in the strongest part of the building away from windows. Do not go outside during the eye of the storm."
          }
        )
      }
    )
  },
  @{
    title = "Pandemic Safety"
    description = "Health safety measures and prevention protocols during pandemic situations."
    thumbnail = "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400"
    chapters = @(
      @{
        title = "Health Protocols"
        contents = @(
          @{
            type = "text"
            body = "Follow public health guidelines including vaccination, mask-wearing, and social distancing when required."
          },
          @{
            type = "text"
            body = "Maintain good hygiene practices - wash hands frequently with soap and water for at least 20 seconds."
          }
        )
      },
      @{
        title = "Community Preparedness"
        contents = @(
          @{
            type = "text"
            body = "Stay informed through reliable health sources. Prepare for possible work or school closures."
          }
        )
      }
    )
  }
)

# Create each module
foreach ($moduleData in $modules) {
  $moduleJson = $moduleData | ConvertTo-Json -Depth 4
  
  try {
    Write-Host "Creating module: $($moduleData.title)" -ForegroundColor Green
    $response = Invoke-WebRequest -Uri "http://localhost:5001/api/institution/modules" -Method POST -Body $moduleJson -Headers $headers
    $createdModule = $response.Content | ConvertFrom-Json
    Write-Host "✅ Created: $($createdModule.title) (ID: $($createdModule._id))" -ForegroundColor Green
  } catch {
    Write-Host "❌ Failed to create $($moduleData.title): $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n🎉 Module population completed!" -ForegroundColor Cyan
