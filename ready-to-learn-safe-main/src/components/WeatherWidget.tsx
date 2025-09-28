import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';
import useLocation from '@/hooks/useLocation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud,
  CloudRain,
  Sun,
  CloudSnow,
  Wind,
  Eye,
  Thermometer,
  Droplets,
  AlertTriangle,
  Shield,
  MapPin,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Gauge,
  Zap,
  Crosshair,
  Navigation2,
  Settings
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// API calls now use centralized API client

interface WeatherData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
    localtime: string;
  };
  current: {
    last_updated: string;
    temp_c: number;
    temp_f: number;
    is_day: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_mph: number;
    wind_kph: number;
    wind_dir: string;
    pressure_mb: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    vis_km: number;
    uv: number;
    air_quality?: {
      co: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      us_epa_index: number;
      gb_defra_index: number;
    };
  };
  safety_recommendations?: Array<{
    type: 'warning' | 'caution' | 'info';
    message: string;
    icon: string;
  }>;
  alerts?: Array<{
    headline: string;
    msgtype: string;
    severity: string;
    urgency: string;
    areas: string;
    category: string;
    event: string;
    desc: string;
    instruction: string;
  }>;
  cached_at?: string;
  is_stale?: boolean;
}

interface WeatherWidgetProps {
  userData?: any;
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  userData,
  className,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 600000 // 10 minutes
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Use location hook for automatic location detection
  const { location, loading: locationLoading, error: locationError, requestLocation, hasPermission } = useLocation(userData);

  // Get weather icon component based on condition code
  const getWeatherIcon = (code: number, isDay: number) => {
    // Weather API condition codes
    if ([1000].includes(code)) return isDay ? <Sun className="h-6 w-6" /> : <Sun className="h-6 w-6" />;
    if ([1003, 1006, 1009].includes(code)) return <Cloud className="h-6 w-6" />;
    if ([1063, 1069, 1072, 1150, 1153, 1168, 1171, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246, 1249, 1252].includes(code)) return <CloudRain className="h-6 w-6" />;
    if ([1066, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1255, 1258, 1261, 1264].includes(code)) return <CloudSnow className="h-6 w-6" />;
    if ([1087, 1273, 1276, 1279, 1282].includes(code)) return <Zap className="h-6 w-6" />;
    return <Cloud className="h-6 w-6" />;
  };

  // Get air quality status
  const getAirQualityStatus = (index: number) => {
    if (index <= 1) return { text: 'Good', color: 'bg-green-500', textColor: 'text-green-700' };
    if (index <= 2) return { text: 'Moderate', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (index <= 3) return { text: 'Unhealthy for Sensitive', color: 'bg-orange-500', textColor: 'text-orange-700' };
    if (index <= 4) return { text: 'Unhealthy', color: 'bg-red-500', textColor: 'text-red-700' };
    if (index <= 5) return { text: 'Very Unhealthy', color: 'bg-purple-500', textColor: 'text-purple-700' };
    return { text: 'Hazardous', color: 'bg-red-700', textColor: 'text-red-900' };
  };

  // Get UV index level
  const getUVLevel = (uv: number) => {
    if (uv <= 2) return { text: 'Low', color: 'text-green-600' };
    if (uv <= 5) return { text: 'Moderate', color: 'text-yellow-600' };
    if (uv <= 7) return { text: 'High', color: 'text-orange-600' };
    if (uv <= 10) return { text: 'Very High', color: 'text-red-600' };
    return { text: 'Extreme', color: 'text-purple-600' };
  };

  // Fetch weather data based on detected location
  const fetchWeatherData = async () => {
    if (!location) {
      console.log('No location available for weather fetch');
      return;
    }

    try {
      setError(null);
      let weatherResponse;
      
      // Use coordinates for GPS location, city name for others
      if (location.source === 'gps' && location.latitude && location.longitude) {
        console.log('🌤️ Fetching weather for GPS coordinates:', location.latitude, location.longitude);
        const query = `${location.latitude},${location.longitude}`;
        weatherResponse = await apiClient.get('/weather/location', {
          params: { q: query, aqi: 'yes' }
        });
      } else if (location.city && location.region) {
        console.log('🌤️ Fetching weather for city:', `${location.city}, ${location.region}`);
        const query = `${location.city}, ${location.region}, ${location.country || 'India'}`;
        weatherResponse = await apiClient.get('/weather/location', {
          params: { q: query, aqi: 'yes' }
        });
      } else {
        // Fallback to institution weather endpoint
        console.log('🏫 Falling back to institution weather');
        weatherResponse = await apiClient.get('/weather/current');
      }

      if (weatherResponse.data.success) {
        setWeatherData(weatherResponse.data.data);
        setLastUpdated(new Date());
      } else {
        setError('Failed to fetch weather data');
      }
    } catch (err: any) {
      console.error('Weather fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load weather information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location && !locationLoading) {
      fetchWeatherData();
    }
  }, [location, locationLoading]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchWeatherData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    fetchWeatherData();
  };

  // Show location permission request if needed
  if (!location && locationError && hasPermission === null) {
    return (
      <Card className={cn("border-blue-200 bg-blue-50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Navigation2 className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-800">Location Access</h3>
              <p className="text-sm text-blue-700 mb-3">
                Allow location access for more accurate weather information for your area.
              </p>
              <Button variant="outline" size="sm" onClick={requestLocation}>
                <Crosshair className="h-4 w-4 mr-2" />
                Enable Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-yellow-200 bg-yellow-50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-800">Weather Unavailable</h3>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if ((loading || locationLoading) && !weatherData) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!weatherData) {
    return null;
  }

  const airQuality = weatherData.current.air_quality ? getAirQualityStatus(weatherData.current.air_quality.us_epa_index) : null;
  const uvLevel = getUVLevel(weatherData.current.uv);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-blue-50 to-sky-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {location?.source === 'gps' ? (
              <Crosshair className="h-5 w-5 text-green-600" />
            ) : location?.source === 'institution' ? (
              <MapPin className="h-5 w-5 text-blue-600" />
            ) : (
              <Navigation2 className="h-5 w-5 text-gray-600" />
            )}
            <CardTitle className="text-lg text-blue-900">
              {weatherData.location.name}, {weatherData.location.region}
            </CardTitle>
            {location?.source === 'gps' && (
              <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                Your Location
              </Badge>
            )}
            {location?.source === 'institution' && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                School Location
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {weatherData.is_stale && (
              <Badge variant="outline" className="text-xs">Cached</Badge>
            )}
            {hasPermission === false && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={requestLocation}
                className="text-xs px-2 py-1"
              >
                <Navigation2 className="h-3 w-3 mr-1" />
                Enable GPS
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading || locationLoading}>
              <RefreshCw className={cn("h-4 w-4", (loading || locationLoading) && "animate-spin")} />
            </Button>
          </div>
        </div>
        {lastUpdated && (
          <div className="flex items-center gap-1 text-xs text-blue-700">
            <Clock className="h-3 w-3" />
            Last updated {format(lastUpdated, "h:mm a")}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        {/* Current Weather */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl font-bold text-foreground">
                {Math.round(weatherData.current.temp_c)}°C
              </span>
              <div className="text-lg text-muted-foreground">
                / {Math.round(weatherData.current.temp_f)}°F
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{weatherData.current.condition.text}</p>
            <p className="text-sm text-muted-foreground">
              Feels like {Math.round(weatherData.current.feelslike_c)}°C
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-sky-100 rounded-full mb-2">
              {getWeatherIcon(weatherData.current.condition.code, weatherData.current.is_day)}
            </div>
          </div>
        </div>

        {showDetails && (
          <>
            <Separator className="my-4" />

            {/* Weather Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Wind className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Wind</p>
                  <p className="font-medium">{weatherData.current.wind_kph} km/h</p>
                  <p className="text-xs text-muted-foreground">{weatherData.current.wind_dir}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Droplets className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Humidity</p>
                  <p className="font-medium">{weatherData.current.humidity}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Eye className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Visibility</p>
                  <p className="font-medium">{weatherData.current.vis_km} km</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Gauge className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Pressure</p>
                  <p className="font-medium">{weatherData.current.pressure_mb} mb</p>
                </div>
              </div>
            </div>

            {/* Air Quality and UV Index */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {airQuality && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Air Quality</h3>
                    <Badge variant="outline" className={cn("text-xs", airQuality.textColor)}>
                      {airQuality.text}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>PM2.5</span>
                      <span>{weatherData.current.air_quality?.pm2_5?.toFixed(1)} μg/m³</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>PM10</span>
                      <span>{weatherData.current.air_quality?.pm10?.toFixed(1)} μg/m³</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">UV Index</h3>
                  <Badge variant="outline" className={cn("text-xs", uvLevel.color)}>
                    {uvLevel.text}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <span className="text-2xl font-bold">{weatherData.current.uv}</span>
                  <span className="text-sm text-muted-foreground">/ 11+</span>
                </div>
              </div>
            </div>

            {/* Weather Alerts */}
            {weatherData.alerts && weatherData.alerts.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Weather Alerts
                  </h3>
                  {weatherData.alerts.map((alert, index) => (
                    <Alert key={index} className="border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        <div className="space-y-1">
                          <p className="font-medium">{alert.headline}</p>
                          <p className="text-sm">{alert.desc}</p>
                          {alert.instruction && (
                            <p className="text-sm font-medium">Instructions: {alert.instruction}</p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </>
            )}

            {/* Safety Recommendations */}
            {weatherData.safety_recommendations && weatherData.safety_recommendations.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Safety Recommendations
                  </h3>
                  <div className="space-y-2">
                    {weatherData.safety_recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={cn(
                          "p-3 rounded-lg border-l-4 text-sm",
                          rec.type === 'warning' && "bg-red-50 border-red-400 text-red-700",
                          rec.type === 'caution' && "bg-yellow-50 border-yellow-400 text-yellow-700",
                          rec.type === 'info' && "bg-blue-50 border-blue-400 text-blue-700"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{rec.icon}</span>
                          <p>{rec.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;