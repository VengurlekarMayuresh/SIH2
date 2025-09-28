import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/utils/api';

interface LiveStats {
  totalStudents: number;
  averageProgress: number;
  activeToday: number;
  completionRate: number;
  totalModulesCompleted: number;
  totalQuizzesTaken: number;
  averageQuizScore: number;
  studentsActiveThisWeek: number;
  lastUpdated: string;
}

interface RecentActivity {
  type: 'quiz' | 'module';
  student: {
    _id: string;
    name: string;
    class: string;
    division: string;
    rollNo: string;
  };
  title: string;
  score?: number;
  timestamp: string;
  icon: string;
}

interface UseLiveStatsReturn {
  stats: LiveStats | null;
  activities: RecentActivity[];
  loading: boolean;
  error: string | null;
  refreshStats: () => Promise<void>;
}

export const useLiveStats = (refreshInterval: number = 30000): UseLiveStatsReturn => {
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      // Fetch both stats and activities in parallel
      const [statsResponse, activitiesResponse] = await Promise.all([
        apiClient.get('/institution/live-stats'),
        apiClient.get('/institution/recent-activity?limit=10')
      ]);

      setStats(statsResponse.data);
      setActivities(activitiesResponse.data.activities || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch live stats:', err);
      setError(err.response?.data?.message || 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    setLoading(true);
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // Initial fetch
    fetchStats();

    // Set up interval for auto-refresh
    if (refreshInterval > 0) {
      intervalRef.current = setInterval(fetchStats, refreshInterval);
    }

    // Cleanup interval on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStats, refreshInterval]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    stats,
    activities,
    loading,
    error,
    refreshStats
  };
};

// Hook for manual refresh with loading state
export const useStatsRefresh = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refresh = useCallback(async (refreshFunction: () => Promise<void>) => {
    setIsRefreshing(true);
    try {
      await refreshFunction();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return { isRefreshing, refresh };
};