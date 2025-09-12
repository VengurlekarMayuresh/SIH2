import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import useLocation from '@/hooks/useLocation';
import ResponsiveLayout from "@/components/ResponsiveLayout";
import WeatherWidget from "@/components/WeatherWidget";
import DisasterAlertSystem from "@/components/DisasterAlertSystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Cloud,
  AlertTriangle,
  Phone,
  BookOpen,
  Map,
  Clock,
  Activity,
  Users,
  Compass,
  Lightbulb,
  Heart,
  Home,
  School,
  Car,
  Umbrella,
  Sun,
  Wind,
  Thermometer,
  Droplets,
  Zap,
  Flame,
  Waves,
  Mountain,
  Snowflake,
  Eye,
  Navigation
} from "lucide-react";

const WeatherSafety = () => {
  const navigate = useNavigate();
  const [userData] = useState(() => {
    const storedData = localStorage.getItem('userData');
    return storedData ? JSON.parse(storedData) : null;
  });

  // Use location hook for better location-aware weather and alerts
  const { location, hasPermission } = useLocation(userData);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Safety tips organized by weather conditions
  const weatherSafetyTips = {
    rain: [
      "Avoid walking through flooded areas, even if the water seems shallow",
      "Stay away from electrical lines and equipment during heavy rain",
      "Use umbrellas and waterproof clothing when going outside",
      "Drive slowly and maintain extra distance between vehicles",
      "Avoid parking under trees or near areas prone to flooding"
    ],
    storm: [
      "Stay indoors during thunderstorms and avoid windows",
      "Unplug electronic devices to prevent damage from power surges",
      "Avoid using landline phones during storms",
      "If outdoors, seek shelter in a building or hard-top vehicle",
      "Stay away from tall objects like trees, poles, and towers"
    ],
    heat: [
      "Drink plenty of water, even if you don't feel thirsty",
      "Wear light-colored, loose-fitting clothing",
      "Avoid strenuous outdoor activities during peak sun hours (10am-4pm)",
      "Use sunscreen with SPF 30 or higher",
      "Take frequent breaks in shaded or air-conditioned areas"
    ],
    cold: [
      "Dress in layers and cover exposed skin",
      "Wear warm, waterproof shoes with good grip",
      "Keep your head, hands, and feet covered",
      "Stay dry and change out of wet clothing immediately",
      "Watch for signs of hypothermia and frostbite"
    ],
    wind: [
      "Secure loose outdoor furniture and decorations",
      "Avoid walking or driving near large trees",
      "Be cautious when opening doors in high winds",
      "Stay away from damaged power lines",
      "Consider postponing outdoor activities"
    ]
  };

  // Emergency preparedness checklist
  const emergencyPreparedness = [
    {
      category: "Communication",
      items: [
        "Keep a list of emergency contacts easily accessible",
        "Have a battery-powered or hand-crank radio",
        "Ensure your mobile phone is always charged",
        "Know your local emergency alert systems",
        "Have a designated meeting place for your family"
      ]
    },
    {
      category: "Supplies",
      items: [
        "Store at least 3 days of water (1 gallon per person per day)",
        "Keep non-perishable food for at least 3 days",
        "Have a first aid kit and know how to use it",
        "Keep flashlights and extra batteries",
        "Have warm blankets and emergency clothing"
      ]
    },
    {
      category: "Documents",
      items: [
        "Keep important documents in a waterproof container",
        "Have copies of ID, insurance papers, and bank records",
        "Store digital copies in cloud storage",
        "Keep some cash in small bills",
        "Have emergency contact information written down"
      ]
    }
  ];

  // School safety protocols
  const schoolSafetyProtocols = [
    {
      title: "Evacuation Procedures",
      description: "Know your school's evacuation routes and assembly points",
      icon: Navigation,
      tips: [
        "Familiarize yourself with all exit routes from your classrooms",
        "Know the location of emergency assembly points",
        "Listen to instructions from teachers and staff",
        "Help classmates who need assistance",
        "Stay calm and move quickly but don't run"
      ]
    },
    {
      title: "Shelter-in-Place",
      description: "Procedures for staying safe inside during emergencies",
      icon: School,
      tips: [
        "Move away from windows and exterior walls",
        "Go to designated safe areas in your school",
        "Remain quiet and listen for instructions",
        "Stay with your class and teacher",
        "Don't leave the safe area until given the all-clear"
      ]
    },
    {
      title: "Communication",
      description: "How to stay informed during school emergencies",
      icon: Phone,
      tips: [
        "Follow your school's official social media accounts",
        "Know your school's emergency notification system",
        "Keep your parent/guardian contact information updated",
        "Don't spread unverified information",
        "Use designated communication channels"
      ]
    }
  ];

  return (
    <ResponsiveLayout
      user={userData ? {
        name: userData.name,
        email: userData.email,
        type: 'student'
      } : undefined}
      onLogout={handleLogout}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Weather & Safety Center
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay informed about weather conditions, disaster alerts, and learn essential safety practices 
            to keep yourself and your community safe.
          </p>
        </div>

        {/* Weather and Alerts Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <WeatherWidget 
            userData={userData}
            showDetails={true}
            autoRefresh={true}
            refreshInterval={600000}
          />
          <DisasterAlertSystem 
            userData={userData}
            showDetails={true}
            autoRefresh={true}
            refreshInterval={300000}
            maxAlerts={5}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="safety-tips" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="safety-tips" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Safety Tips
            </TabsTrigger>
            <TabsTrigger value="emergency-prep" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Prep
            </TabsTrigger>
            <TabsTrigger value="school-safety" className="flex items-center gap-2">
              <School className="h-4 w-4" />
              School Safety
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>

          {/* Safety Tips Tab */}
          <TabsContent value="safety-tips" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Weather-Specific Safety Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="border-blue-200 bg-blue-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Droplets className="h-5 w-5 text-blue-600" />
                        Rainy Weather
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weatherSafetyTips.rain.map((tip, index) => (
                          <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-purple-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-purple-600" />
                        Storms
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weatherSafetyTips.storm.map((tip, index) => (
                          <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sun className="h-5 w-5 text-orange-600" />
                        Hot Weather
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weatherSafetyTips.heat.map((tip, index) => (
                          <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-cyan-200 bg-cyan-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Snowflake className="h-5 w-5 text-cyan-600" />
                        Cold Weather
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weatherSafetyTips.cold.map((tip, index) => (
                          <li key={index} className="text-sm text-cyan-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="border-gray-200 bg-gray-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wind className="h-5 w-5 text-gray-600" />
                        Windy Conditions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {weatherSafetyTips.wind.map((tip, index) => (
                          <li key={index} className="text-sm text-gray-800 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Preparedness Tab */}
          <TabsContent value="emergency-prep" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Emergency Preparedness Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {emergencyPreparedness.map((category, index) => (
                    <div key={index}>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Badge variant="outline">{category.category}</Badge>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {category.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                      {index < emergencyPreparedness.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* School Safety Tab */}
          <TabsContent value="school-safety" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {schoolSafetyProtocols.map((protocol, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <protocol.icon className="h-5 w-5 text-blue-600" />
                      {protocol.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{protocol.description}</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {protocol.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Emergency Contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-green-600" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-semibold text-red-800">National Emergency</p>
                      <p className="text-lg font-bold text-red-600">📞 112</p>
                      <p className="text-xs text-red-600">All emergencies (Police, Fire, Medical)</p>
                    </div>
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="font-semibold text-orange-800">Disaster Management</p>
                      <p className="text-lg font-bold text-orange-600">📞 1070</p>
                      <p className="text-xs text-orange-600">National Disaster Response Force</p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-semibold text-blue-800">Weather Information</p>
                      <p className="text-lg font-bold text-blue-600">📞 1588</p>
                      <p className="text-xs text-blue-600">Indian Meteorological Department</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Educational Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                    Learn More
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/modules')}
                  >
                    <Mountain className="h-4 w-4 mr-2" />
                    Disaster Learning Modules
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/quiz')}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Safety Quiz Challenges
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/community')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Community Safety Forum
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/resources')}
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Emergency Resources
                  </Button>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Compass className="h-5 w-5 text-indigo-600" />
                    Quick Safety Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Home className="h-6 w-6 text-blue-600" />
                      <span className="text-xs">Home Safety</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Car className="h-6 w-6 text-green-600" />
                      <span className="text-xs">Travel Safety</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Heart className="h-6 w-6 text-red-600" />
                      <span className="text-xs">First Aid</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <Map className="h-6 w-6 text-purple-600" />
                      <span className="text-xs">Evacuation</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Notice */}
        <Alert className="border-blue-200 bg-blue-50">
          <Shield className="h-4 w-4" />
          <AlertDescription className="text-blue-800">
            <strong>Remember:</strong> This information is for educational purposes. Always follow official emergency 
            instructions from authorities and your school during actual emergencies.
          </AlertDescription>
        </Alert>
      </div>
    </ResponsiveLayout>
  );
};

export default WeatherSafety;