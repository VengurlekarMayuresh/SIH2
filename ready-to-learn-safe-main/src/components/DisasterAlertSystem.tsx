import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';
import useLocation from '@/hooks/useLocation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertTriangle,
  Shield,
  Clock,
  RefreshCw,
  Bell,
  BellRing,
  MapPin,
  Calendar,
  Zap,
  CloudRain,
  Wind,
  Flame,
  Mountain,
  Waves,
  Snowflake,
  Sun,
  Eye,
  Activity,
  Users,
  Phone,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// API calls now use centralized API client

interface DisasterAlert {
  headline: string;
  msgtype: string;
  severity: string;
  urgency: string;
  areas: string;
  category: string;
  certainty: string;
  event: string;
  note: string;
  effective: string;
  expires: string;
  desc: string;
  instruction: string;
  severity_level?: string;
  alert_type?: string;
  urgency_level?: string;
  affected_areas?: string[];
  local_time?: string;
  timezone?: string;
  coordinates?: {
    lat: number;
    lon: number;
  };
}

interface RiskAssessment {
  overall_risk: 'low' | 'medium' | 'high' | 'critical';
  immediate_risks: Array<{
    type: string;
    severity: string;
    description: string;
    urgency: string;
  }>;
  upcoming_risks: Array<{
    type: string;
    severity: string;
    description: string;
    date: string;
    days_ahead: number;
  }>;
  safety_recommendations: string[];
}

interface DisasterData {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
  };
  current_weather: any;
  alerts: DisasterAlert[];
  alert_count: number;
  highest_severity: string;
  has_active_alerts: boolean;
  last_updated: string;
}

interface AssessmentData {
  location: any;
  current_conditions: any;
  active_alerts: DisasterAlert[];
  forecast_alerts: any[];
  risk_assessment: RiskAssessment;
  last_updated: string;
}

interface DisasterAlertSystemProps {
  userData?: any;
  className?: string;
  showDetails?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxAlerts?: number;
}

const DisasterAlertSystem: React.FC<DisasterAlertSystemProps> = ({
  userData,
  className,
  showDetails = true,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes for disaster alerts
  maxAlerts = 5
}) => {
  const [disasterData, setDisasterData] = useState<DisasterData | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<DisasterAlert | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Use location hook for automatic location detection
  const { location, loading: locationLoading } = useLocation(userData);

  // Get disaster type icon
  const getDisasterIcon = (type: string) => {
    const typeMap: { [key: string]: any } = {
      'flood': Waves,
      'hurricane': Wind,
      'tornado': Wind,
      'storm': CloudRain,
      'heat': Sun,
      'cold': Snowflake,
      'snow': Snowflake,
      'wind': Wind,
      'fog': Eye,
      'fire': Flame,
      'earthquake': Mountain,
      'weather': CloudRain,
      'general': AlertTriangle
    };
    return typeMap[type.toLowerCase()] || AlertTriangle;
  };

  // Get severity color class
  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'extreme':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'major':
      case 'severe':
        return 'border-orange-500 bg-orange-50 text-orange-800';
      case 'moderate':
      case 'medium':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'minor':
      case 'low':
        return 'border-blue-500 bg-blue-50 text-blue-800';
      default:
        return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  // Get urgency color
  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case 'immediate':
        return 'bg-red-600 text-white';
      case 'expected':
        return 'bg-orange-600 text-white';
      case 'future':
        return 'bg-yellow-600 text-white';
      case 'past':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Get risk level color
  const getRiskLevelColor = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'high':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Fetch disaster alerts based on detected location
  const fetchDisasterAlerts = async () => {
    if (!location) {
      console.log('No location available for disaster alerts fetch');
      return;
    }

    try {
      setError(null);
      let query: string;
      
      // Build query based on location source
      if (location.source === 'gps' && location.latitude && location.longitude) {
        query = `${location.latitude},${location.longitude}`;
        console.log('🚨 Fetching disaster alerts for GPS coordinates:', query);
      } else if (location.city && location.region) {
        query = `${location.city}, ${location.region}, ${location.country || 'India'}`;
        console.log('🚨 Fetching disaster alerts for city:', query);
      } else {
        query = 'Mumbai, Maharashtra, India'; // Final fallback
        console.log('🚨 Using fallback location for disaster alerts');
      }

      // Fetch disaster alerts and risk assessment with location
      const [alertsResponse, assessmentResponse] = await Promise.allSettled([
        apiClient.get('/disaster/alerts/location', {
          params: { q: query }
        }),
        apiClient.get('/disaster/assessment/location', {
          params: { q: query }
        })
      ]);

      // Process disaster alerts
      if (alertsResponse.status === 'fulfilled' && alertsResponse.value.data.success) {
        setDisasterData(alertsResponse.value.data.data);
      }

      // Process risk assessment
      if (assessmentResponse.status === 'fulfilled' && assessmentResponse.value.data.success) {
        setAssessmentData(assessmentResponse.value.data.data);
      }

      // If location-based alerts fail, try institution-specific endpoints
      if (alertsResponse.status === 'rejected' && assessmentResponse.status === 'rejected') {
        try {
          console.log('🏫 Falling back to institution-based alerts');
          const [instAlertsResponse, instAssessmentResponse] = await Promise.allSettled([
            apiClient.get('/disaster/alerts'),
            apiClient.get('/disaster/assessment')
          ]);

          if (instAlertsResponse.status === 'fulfilled' && instAlertsResponse.value.data.success) {
            setDisasterData(instAlertsResponse.value.data.data);
          }
          if (instAssessmentResponse.status === 'fulfilled' && instAssessmentResponse.value.data.success) {
            setAssessmentData(instAssessmentResponse.value.data.data);
          }
        } catch (fallbackError) {
          console.error('Institution fallback disaster alerts failed:', fallbackError);
        }
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('Disaster alerts fetch error:', err);
      setError(err.response?.data?.message || 'Failed to load disaster alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location && !locationLoading) {
      fetchDisasterAlerts();
    }
  }, [location, locationLoading]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchDisasterAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    fetchDisasterAlerts();
  };

  const handleAlertClick = (alert: DisasterAlert) => {
    setSelectedAlert(alert);
    setIsDialogOpen(true);
  };

  // Check if there are any critical alerts
  const hasCriticalAlerts = disasterData?.alerts.some(alert => 
    alert.severity_level === 'extreme' || alert.urgency_level === 'immediate'
  ) || false;

  const hasActiveAlerts = (disasterData?.alert_count || 0) > 0 || (assessmentData?.active_alerts?.length || 0) > 0;

  if ((loading || locationLoading) && !disasterData && !assessmentData) {
    return (
      <Card className={className}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
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
              <h3 className="font-medium text-yellow-800">Disaster Alerts Unavailable</h3>
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

  // If no active alerts and low risk, show minimal widget
  if (!hasActiveAlerts && assessmentData?.risk_assessment?.overall_risk === 'low') {
    return (
      <Card className={cn("border-green-200 bg-green-50", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <h3 className="font-medium text-green-800">All Clear</h3>
              <p className="text-sm text-green-700">No active disaster alerts in your area</p>
              {lastUpdated && (
                <p className="text-xs text-green-600 mt-1">
                  Last checked {format(lastUpdated, "h:mm a")}
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleAlerts = disasterData?.alerts?.slice(0, maxAlerts) || [];
  const locationName = disasterData?.location?.name || assessmentData?.location?.name || 'Your Area';

  return (
    <div className={cn("space-y-4", className)}>
      {/* Critical Alert Banner */}
      {hasCriticalAlerts && (
        <Alert className="border-red-200 bg-red-50 animate-pulse">
          <BellRing className="h-4 w-4" />
          <AlertDescription className="text-red-800 font-medium">
            ⚠️ CRITICAL ALERT: Emergency conditions detected in your area. Take immediate safety precautions!
          </AlertDescription>
        </Alert>
      )}

      {/* Main Disaster Alerts Card */}
      <Card className="overflow-hidden">
        <CardHeader className={cn(
          "pb-4",
          hasCriticalAlerts ? "bg-gradient-to-r from-red-50 to-orange-50" : 
          hasActiveAlerts ? "bg-gradient-to-r from-yellow-50 to-orange-50" : 
          "bg-gradient-to-r from-green-50 to-blue-50"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">
                Disaster Alerts - {locationName}
              </CardTitle>
              {hasActiveAlerts && (
                <Badge variant="destructive" className="animate-pulse">
                  {disasterData?.alert_count || assessmentData?.active_alerts?.length || 0} Active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
          {lastUpdated && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last updated {format(lastUpdated, "h:mm a")}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6">
          {/* Risk Assessment Summary */}
          {assessmentData?.risk_assessment && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Risk Assessment
                </h3>
                <Badge className={cn("text-xs font-medium", getRiskLevelColor(assessmentData.risk_assessment.overall_risk))}>
                  {assessmentData.risk_assessment.overall_risk.toUpperCase()} RISK
                </Badge>
              </div>
              
              {/* Immediate Risks */}
              {assessmentData.risk_assessment.immediate_risks.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-red-700">Immediate Risks:</h4>
                  {assessmentData.risk_assessment.immediate_risks.map((risk, index) => {
                    const IconComponent = getDisasterIcon(risk.type);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                        <IconComponent className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-800">{risk.description}</span>
                        <Badge variant="outline" className={getUrgencyColor(risk.urgency)}>
                          {risk.urgency}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upcoming Risks */}
              {assessmentData.risk_assessment.upcoming_risks.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-orange-700">Upcoming Risks:</h4>
                  {assessmentData.risk_assessment.upcoming_risks.slice(0, 3).map((risk, index) => {
                    const IconComponent = getDisasterIcon(risk.type);
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                        <IconComponent className="h-4 w-4 text-orange-600" />
                        <span className="text-sm text-orange-800">{risk.description}</span>
                        <Badge variant="outline" className="text-xs">
                          {risk.days_ahead} days
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Active Disaster Alerts */}
          {visibleAlerts.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-red-500" />
                  Active Alerts
                </h3>
                {visibleAlerts.map((alert, index) => {
                  const IconComponent = getDisasterIcon(alert.alert_type || alert.event);
                  return (
                    <Card 
                      key={index} 
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
                        getSeverityColor(alert.severity_level || alert.severity)
                      )}
                      onClick={() => handleAlertClick(alert)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white/50 rounded-full">
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-sm line-clamp-2">{alert.headline || alert.event}</h4>
                              {alert.urgency_level && (
                                <Badge className={cn("text-xs ml-2", getUrgencyColor(alert.urgency_level))}>
                                  {alert.urgency_level}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {alert.desc || alert.note}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {alert.effective && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(alert.effective), "MMM d, h:mm a")}
                                </span>
                              )}
                              {alert.affected_areas && alert.affected_areas.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {alert.affected_areas[0]}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}

          {/* Safety Recommendations */}
          {assessmentData?.risk_assessment?.safety_recommendations && assessmentData.risk_assessment.safety_recommendations.length > 0 && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3">
                <h3 className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  Safety Recommendations
                </h3>
                <div className="space-y-2">
                  {assessmentData.risk_assessment.safety_recommendations.slice(0, 5).map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-blue-800">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Emergency Contacts */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-600" />
              Emergency Contacts
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="font-medium">Emergency Services</p>
                <p className="text-muted-foreground">📞 112 (National Emergency)</p>
              </div>
              <div>
                <p className="font-medium">Disaster Management</p>
                <p className="text-muted-foreground">📞 1070 (NDRF)</p>
              </div>
              <div>
                <p className="font-medium">Local Police</p>
                <p className="text-muted-foreground">📞 100</p>
              </div>
              <div>
                <p className="font-medium">Fire Services</p>
                <p className="text-muted-foreground">📞 101</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Alert Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedAlert && getDisasterIcon(selectedAlert.alert_type || selectedAlert.event)({ className: "h-5 w-5" })}
              Alert Details
            </DialogTitle>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-yellow-50">
                <h3 className="font-semibold text-lg mb-2">{selectedAlert.headline || selectedAlert.event}</h3>
                <p className="text-muted-foreground mb-3">{selectedAlert.desc}</p>
                {selectedAlert.instruction && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Instructions:</h4>
                    <p className="text-blue-700 text-sm">{selectedAlert.instruction}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Severity</p>
                  <Badge className={getSeverityColor(selectedAlert.severity_level || selectedAlert.severity)}>
                    {selectedAlert.severity_level || selectedAlert.severity}
                  </Badge>
                </div>
                <div>
                  <p className="font-medium">Urgency</p>
                  <Badge className={getUrgencyColor(selectedAlert.urgency_level || selectedAlert.urgency)}>
                    {selectedAlert.urgency_level || selectedAlert.urgency}
                  </Badge>
                </div>
                {selectedAlert.effective && (
                  <div>
                    <p className="font-medium">Effective From</p>
                    <p className="text-muted-foreground">{format(new Date(selectedAlert.effective), "PPp")}</p>
                  </div>
                )}
                {selectedAlert.expires && (
                  <div>
                    <p className="font-medium">Expires</p>
                    <p className="text-muted-foreground">{format(new Date(selectedAlert.expires), "PPp")}</p>
                  </div>
                )}
              </div>

              {selectedAlert.affected_areas && selectedAlert.affected_areas.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Affected Areas</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlert.affected_areas.map((area, index) => (
                      <Badge key={index} variant="outline">{area}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisasterAlertSystem;