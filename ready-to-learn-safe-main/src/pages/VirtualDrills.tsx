import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ResponsiveLayout from "@/components/ResponsiveLayout";
import FloodDrill from "@/components/drills/FloodDrill";
import FireDrill from "@/components/drills/FireDrill";
import EarthquakeDrill from "@/components/drills/EarthquakeDrill";
import HealthCrisisDrill from "@/components/drills/HealthCrisisDrill";
import SevereWeatherDrill from "@/components/drills/SevereWeatherDrill";
import { apiClient } from '../utils/api';
import { 
  Shield, 
  Waves, 
  Flame, 
  Mountain, 
  Wind, 
  Clock, 
  Trophy,
  ChevronRight,
  ArrowLeft
} from "lucide-react";

interface DrillScenario {
  id: string;
  title: string;
  description: string;
  icon: any;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  isActive: boolean;
  component?: React.ComponentType<{ onComplete: (score: number, passed: boolean) => void; onBack: () => void }>;
}

const drillScenarios: DrillScenario[] = [
  {
    id: "flood",
    title: "Flood Evacuation Drill",
    description: "Navigate through a school flood emergency scenario. Learn proper evacuation procedures and safety protocols.",
    icon: Waves,
    difficulty: "intermediate",
    duration: "10-15 min",
    isActive: true,
    component: FloodDrill
  },
  {
    id: "fire",
    title: "Fire Safety Drill",
    description: "Practice fire emergency response in different environments. Master evacuation routes and safety procedures.",
    icon: Flame,
    difficulty: "beginner",
    duration: "8-12 min",
    isActive: true,
    component: FireDrill
  },
  {
    id: "earthquake",
    title: "Earthquake Response Drill",
    description: "Learn drop, cover, and hold techniques. Practice post-earthquake evacuation procedures.",
    icon: Mountain,
    difficulty: "advanced",
    duration: "12-18 min",
    isActive: true,
    component: EarthquakeDrill
  },
  {
    id: "health-crisis",
    title: "Health Crisis Response Drill",
    description: "Learn essential pandemic response including hygiene, isolation, and community safety protocols.",
    icon: Wind,
    difficulty: "intermediate",
    duration: "10-15 min",
    isActive: true,
    component: HealthCrisisDrill
  },
  {
    id: "severe-weather",
    title: "Severe Weather Response Drill",
    description: "Master storm preparation, safe sheltering, and post-weather hazard navigation techniques.",
    icon: Wind,
    difficulty: "beginner",
    duration: "8-12 min",
    isActive: true,
    component: SevereWeatherDrill
  }
];

const VirtualDrills = () => {
  const navigate = useNavigate();
  const [selectedDrill, setSelectedDrill] = useState<DrillScenario | null>(null);

  const getDifficultyColor = (difficulty: DrillScenario["difficulty"]) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleDrillComplete = async (score: number, passed: boolean) => {
    if (!selectedDrill) return;

    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        // Save drill completion to backend
        await apiClient.post('/student/virtual-drill-complete', {
          drillId: selectedDrill.id,
          drillType: selectedDrill.title,
          score: score,
          passed: passed,
          completedAt: new Date().toISOString()
        });

        console.log('Drill completion saved successfully');
      }
    } catch (error) {
      console.error('Error saving drill completion:', error);
    }

    // Don't automatically redirect - let user choose where to go
  };

  const handleBackToDrills = () => {
    setSelectedDrill(null);
  };

  if (selectedDrill && selectedDrill.component) {
    const DrillComponent = selectedDrill.component;
    return (
      <div className="min-h-screen bg-background">
        <DrillComponent 
          onComplete={handleDrillComplete} 
          onBack={handleBackToDrills}
        />
      </div>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">Virtual Drills</h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Practice your disaster response skills in realistic, interactive scenarios. 
            Build confidence and muscle memory for real emergencies.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drillScenarios.map((drill) => {
            const IconComponent = drill.icon;
            return (
              <Card 
                key={drill.id} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  drill.isActive 
                    ? 'cursor-pointer hover:scale-105 border-primary/20' 
                    : 'opacity-50 cursor-not-allowed'
                }`}
                onClick={() => drill.isActive && setSelectedDrill(drill)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-3 rounded-lg ${drill.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{drill.title}</CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className={getDifficultyColor(drill.difficulty)}>
                      {drill.difficulty.charAt(0).toUpperCase() + drill.difficulty.slice(1)}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      {drill.duration}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    {drill.description}
                  </p>
                  
                  {drill.isActive ? (
                    <Button className="w-full" onClick={() => setSelectedDrill(drill)}>
                      Start Drill
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  ) : (
                    <div className="text-center">
                      <Badge variant="outline" className="text-muted-foreground">
                        Coming Soon
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        This drill is under development
                      </p>
                    </div>
                  )}
                </CardContent>

                {!drill.isActive && (
                  <div className="absolute inset-0 bg-background/50 rounded-lg" />
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Earn Drill Completion Badges</h3>
              <p className="text-muted-foreground">
                Complete virtual drills to earn special badges and improve your emergency preparedness score. 
                Each drill completion contributes to your overall safety knowledge and ranking.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default VirtualDrills;