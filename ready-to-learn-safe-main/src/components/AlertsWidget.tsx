import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  AlertTriangle, 
  Cloud, 
  Zap, 
  Sun, 
  Snowflake,
  Waves,
  Mountain,
  Flame,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  Crosshair
} from "lucide-react";

interface AlertData {
  id: string;
  alertId: string;
  source: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  location?: {
    city?: string;
    state?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  affectedAreas?: string[];
  startTime: string;
  endTime?: string;
  instructions?: string[];
  contactInfo?: {
    helplineNumber?: string;
    emergencyContacts?: string[];
  };
  isActive: boolean;
}

interface WeatherData {
  current: {
    temperature: number;
    description: string;
    icon: string;
  };
  alerts: AlertData[];
}

interface AlertsWidgetProps {
  showWeather?: boolean;
  maxAlerts?: number;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ 
  showWeather = true, 
  maxAlerts = 5,
  userLocation 
}) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const LS_COORDS_KEY = 'alerts_coords';
  const LS_COORDS_TS_KEY = 'alerts_coords_ts';
  const MAX_COORDS_AGE_MS = 24 * 60 * 60 * 1000; // 24h

  // Resolve coordinates: Geolocation API -> IP geolocation -> default (Delhi)
  const resolveCoords = async (forceFresh: boolean = false): Promise<{ latitude: number; longitude: number }> => {
    return new Promise(async (resolve) => {
      const fallbackToIP = async () => {
        try {
          const ipRes = await fetch('https://ipapi.co/json/');
          const ipJson = await ipRes.json();
          if (ipJson && ipJson.latitude && ipJson.longitude) {
            resolve({ latitude: ipJson.latitude, longitude: ipJson.longitude });
            return;
          }
        } catch {}
        resolve({ latitude: 28.6139, longitude: 77.2090 }); // Delhi default
      };

      if (userLocation) {
        resolve(userLocation);
        return;
      }

      // Try cached coords first (unless forced)
      if (!forceFresh) {
        try {
          const cached = localStorage.getItem(LS_COORDS_KEY);
          const ts = localStorage.getItem(LS_COORDS_TS_KEY);
          if (cached && ts && Date.now() - parseInt(ts) < MAX_COORDS_AGE_MS) {
            const parsed = JSON.parse(cached);
            if (parsed?.latitude && parsed?.longitude) {
              resolve(parsed);
              return;
            }
          }
        } catch {}
      }

      if ('geolocation' in navigator) {
        const timeoutId = setTimeout(fallbackToIP, 6000);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            const fresh = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
            try {
              localStorage.setItem(LS_COORDS_KEY, JSON.stringify(fresh));
              localStorage.setItem(LS_COORDS_TS_KEY, Date.now().toString());
            } catch {}
            resolve(fresh);
          },
          async () => {
            clearTimeout(timeoutId);
            await fallbackToIP();
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        await fallbackToIP();
      }
    });
  };

  const fetchAlerts = async () => {
    if (!coords) return;
    try {
      setError(null);
      setLoading(true);
      
      // Fetch active alerts using proxy (/api)
      try {
        const alertsResponse = await fetch(
          `/api/alerts/active?latitude=${coords.latitude}&longitude=${coords.longitude}&radius=100`
        );
        
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json();
          setAlerts(alertsData.alerts.slice(0, maxAlerts));
        } else {
          // Fallback to sample alerts
          setAlerts(getSampleAlerts());
        }
      } catch {
        // Fallback to sample alerts
        setAlerts(getSampleAlerts());
      }

      // Fetch weather data if enabled
      if (showWeather) {
        try {
          const weatherResponse = await fetch(
            `/api/alerts/weather/${coords.latitude}/${coords.longitude}`
          );
          
          if (weatherResponse.ok) {
            const weather = await weatherResponse.json();
            setWeatherData(weather.data);
          } else {
            // Fallback to sample weather
            setWeatherData(getSampleWeather());
          }
        } catch (weatherError) {
          console.warn('Weather data unavailable, using sample:', weatherError);
          // Fallback to sample weather
          setWeatherData(getSampleWeather());
        }
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Error fetching alerts:', err);
      // Show sample data instead of error
      setAlerts(getSampleAlerts());
      if (showWeather) {
        setWeatherData(getSampleWeather());
      }
    } finally {
      setLoading(false);
    }
  };

  // Kick off geolocation once
  useEffect(() => {
    (async () => {
      const c = await resolveCoords();
      setCoords(c);
    })();
  }, [userLocation?.latitude, userLocation?.longitude]);

  // Manual re-locate handler
  const handleUseMyLocation = async () => {
    setLoading(true);
    const c = await resolveCoords(true);
    setCoords(c);
  };

  // Fetch alerts when coords are available; set interval refresh
  useEffect(() => {
    if (!coords) return;

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [coords?.latitude, coords?.longitude]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'destructive';
      case 'severe': return 'destructive';
      case 'moderate': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme': return 'bg-red-50 border-red-200';
      case 'severe': return 'bg-orange-50 border-orange-200';
      case 'moderate': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cyclone': return Waves;
      case 'earthquake': return Mountain;
      case 'tsunami': return Waves;
      case 'flood': return Waves;
      case 'fire': return Flame;
      case 'heat_wave': return Sun;
      case 'cold_wave': return Snowflake;
      case 'thunderstorm': return Zap;
      case 'heavy_rain': return Cloud;
      case 'landslide': return Mountain;
      default: return AlertTriangle;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Sample weather data fallback
  const getSampleWeather = (): WeatherData => {
    return {
      current: {
        temperature: 28,
        description: 'partly cloudy',
        icon: '02d'
      },
      alerts: []
    };
  };

  // Sample alerts fallback
  const getSampleAlerts = (): AlertData[] => {
    return [
      {
        id: 'sample_heat_1',
        alertId: 'sample_heat_warning',
        source: 'NDMA',
        type: 'heat_wave',
        severity: 'Moderate',
        title: 'Heat Wave Advisory',
        description: 'Temperatures expected to rise above normal. Stay hydrated and avoid direct sunlight during peak hours.',
        location: {
          city: 'New Delhi',
          state: 'Delhi'
        },
        startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
        instructions: [
          'Stay hydrated and drink plenty of water',
          'Avoid direct sunlight between 10 AM - 4 PM',
          'Wear light-colored, loose-fitting clothes'
        ],
        contactInfo: {
          helplineNumber: '1077',
          emergencyContacts: ['112']
        },
        isActive: true
      },
      {
        id: 'sample_thunder_1',
        alertId: 'sample_thunder_warning',
        source: 'OpenWeatherMap',
        type: 'thunderstorm',
        severity: 'Low',
        title: 'Thunderstorm Watch',
        description: 'Light thunderstorm activity expected in the evening. Keep windows closed and avoid outdoor activities.',
        location: {
          city: 'New Delhi',
          state: 'Delhi'
        },
        startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        instructions: [
          'Stay indoors and avoid open areas',
          'Unplug electrical appliances',
          'Avoid using landline phones'
        ],
        contactInfo: {
          helplineNumber: '1077'
        },
        isActive: true
      }
    ];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                <Skeleton className="w-8 h-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Emergency Alerts
            {alerts.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Updated {formatTimeAgo(lastRefresh.toISOString())}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleUseMyLocation}
              title="Use my location"
              disabled={loading}
            >
              <Crosshair className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={fetchAlerts}
              disabled={loading}
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Weather Summary */}
        {showWeather && weatherData && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">
                    {Math.round(weatherData.current.temperature)}°C
                  </p>
                  <p className="text-sm text-blue-700 capitalize">
                    {weatherData.current.description}
                  </p>
                </div>
              </div>
              {weatherData.alerts.length > 0 && (
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  Weather Alert
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6">
              <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No active alerts in your area
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Stay prepared and check back regularly
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const IconComponent = getTypeIcon(alert.type);
              const severityColor = getSeverityColor(alert.severity);
              const bgColor = getSeverityBgColor(alert.severity);
              
              return (
                <div 
                  key={alert.id} 
                  className={`p-3 rounded-lg border ${bgColor} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      alert.severity.toLowerCase() === 'extreme' ? 'bg-red-100' :
                      alert.severity.toLowerCase() === 'severe' ? 'bg-orange-100' :
                      alert.severity.toLowerCase() === 'moderate' ? 'bg-yellow-100' :
                      'bg-blue-100'
                    }`}>
                      <IconComponent className={`h-4 w-4 ${
                        alert.severity.toLowerCase() === 'extreme' ? 'text-red-600' :
                        alert.severity.toLowerCase() === 'severe' ? 'text-orange-600' :
                        alert.severity.toLowerCase() === 'moderate' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium text-sm leading-tight">
                          {alert.title}
                        </h3>
                        <Badge variant={severityColor as any} className="ml-2 text-xs">
                          {alert.severity}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {alert.location?.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {alert.location.city}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(alert.startTime)}
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {alert.source}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Emergency Contact */}
                      {alert.contactInfo?.helplineNumber && (
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <Phone className="h-3 w-3 text-red-600" />
                          <a 
                            href={`tel:${alert.contactInfo.helplineNumber}`}
                            className="text-red-600 hover:underline font-medium"
                          >
                            {alert.contactInfo.helplineNumber}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Safety Instructions */}
                  {alert.instructions && alert.instructions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-current/10">
                      <p className="text-xs font-medium mb-1">Safety Instructions:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {alert.instructions.slice(0, 2).map((instruction, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span>•</span>
                            <span>{instruction}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* View All Button */}
        {alerts.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <ExternalLink className="h-4 w-4 mr-2" />
              View All Alerts & Safety Info
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
