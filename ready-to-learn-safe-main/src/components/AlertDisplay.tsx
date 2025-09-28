import React, { useState, useEffect } from 'react';
import { apiClient } from '@/utils/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Bell,
  AlertTriangle,
  Info,
  Settings,
  X,
  Clock,
  Users
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// API calls now use centralized API client

interface AlertData {
  _id: string;
  title: string;
  message: string;
  type: 'emergency' | 'warning' | 'info' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isActive: boolean;
  expiresAt: string | null;
  targetAudience: 'all' | 'students' | 'specific_class';
  targetClass?: string;
  targetDivision?: string;
  createdAt: string;
  createdBy: {
    name: string;
    institutionId: string;
  };
}

interface AlertDisplayProps {
  institutionId?: string;
  studentClass?: string;
  targetAudience?: string;
  className?: string;
  maxAlerts?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const AlertDisplay: React.FC<AlertDisplayProps> = ({
  institutionId,
  studentClass,
  targetAudience = 'students',
  className,
  maxAlerts = 5,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Fetch active alerts
  const fetchAlerts = async () => {
    if (!institutionId) {
      console.log('AlertDisplay: No institutionId provided');
      return;
    }
    
    console.log('AlertDisplay: Fetching alerts for institution:', institutionId);
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (targetAudience) params.append('targetAudience', targetAudience);
      if (studentClass) params.append('targetClass', studentClass);

      const url = `/alerts/active/${institutionId}?${params}`;
      console.log('AlertDisplay: Making request to:', url);
      
      const response = await apiClient.get(url);
      
      console.log('AlertDisplay: Received response:', response.data);
      setAlerts(response.data.alerts || []);
    } catch (err: any) {
      console.error('AlertDisplay: Failed to fetch alerts:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: `/alerts/active/${institutionId}`
      });
      setError(`Failed to load alerts: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [institutionId, studentClass, targetAudience]);

  useEffect(() => {
    if (autoRefresh && institutionId) {
      const interval = setInterval(fetchAlerts, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, institutionId]);

  // Get type icon and color
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'info': return <Info className="h-4 w-4" />;
      case 'maintenance': return <Settings className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'border-red-200 bg-red-50 text-red-800';
      case 'warning': return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info': return 'border-blue-200 bg-blue-50 text-blue-800';
      case 'maintenance': return 'border-gray-200 bg-gray-50 text-gray-800';
      default: return 'border-gray-200 bg-gray-50 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'emergency': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      case 'maintenance': return 'outline';
      default: return 'secondary';
    }
  };

  // Handle alert dismissal
  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  // Filter alerts
  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert._id))
    .slice(0, maxAlerts);

  if (!institutionId) {
    return null;
  }

  if (loading && alerts.length === 0) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className={cn("border-yellow-200 bg-yellow-50", className)}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="text-yellow-800">{error}</AlertDescription>
      </Alert>
    );
  }

  if (visibleAlerts.length === 0) {
    return null; // Don't show anything if there are no alerts
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h3 className="font-medium text-sm text-foreground">Important Alerts</h3>
        <Badge variant="secondary" className="ml-auto">
          {visibleAlerts.length}
        </Badge>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {visibleAlerts.map((alert) => (
          <Alert key={alert._id} className={cn("relative", getTypeColor(alert.type))}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                {/* Priority indicator */}
                <div className={cn("w-1 h-full rounded-full self-stretch", getPriorityColor(alert.priority))} />
                
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  {getTypeIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{alert.title}</h4>
                      <Badge variant={getBadgeVariant(alert.type) as any} className="text-xs">
                        {alert.type}
                      </Badge>
                      {alert.priority === 'urgent' && (
                        <Badge variant="destructive" className="text-xs animate-pulse">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mb-2 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center gap-3 text-xs opacity-75">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                      </span>
                      {alert.targetAudience === 'specific_class' && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Class {alert.targetClass}
                          {alert.targetDivision && ` (${alert.targetDivision})`}
                        </span>
                      )}
                      {alert.expiresAt && (
                        <span>
                          Expires {format(new Date(alert.expiresAt), "MMM d")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Dismiss button */}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                onClick={() => handleDismiss(alert._id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        ))}
      </div>

      {/* Show more indicator */}
      {alerts.length > maxAlerts && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {alerts.length - maxAlerts} more alert{alerts.length - maxAlerts !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default AlertDisplay;