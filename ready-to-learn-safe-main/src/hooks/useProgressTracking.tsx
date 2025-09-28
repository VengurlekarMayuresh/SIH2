import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { apiClient } from '../utils/api';

interface ProgressData {
  userId: string;
  moduleId: string;
  chapterId?: string;
  contentId?: string;
  action: string;
  timestamp: Date;
  timeSpent: number;
  progress: number;
  metadata?: any;
}

interface ModuleProgress {
  moduleId: string;
  progress: number;
  timeSpent: number;
  startedAt: Date;
  lastAccessedAt: Date;
  completedAt?: Date;
  chaptersProgress: ChapterProgress[];
  quizScores: QuizScore[];
  badges: Badge[];
}

interface ChapterProgress {
  chapterId: string;
  progress: number;
  timeSpent: number;
  completedAt?: Date;
  watchedVideos: string[];
  completedActivities: string[];
}

interface QuizScore {
  quizId: string;
  score: number;
  percentage: number;
  completedAt: Date;
  attempts: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

interface VideoProgress {
  videoId: string;
  watchTime: number;
  totalDuration: number;
  completed: boolean;
  lastPosition: number;
}

class ProgressTracker {
  private static instance: ProgressTracker;
  private progressQueue: ProgressData[] = [];
  private isOnline: boolean = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker();
    }
    return ProgressTracker.instance;
  }

  constructor() {
    this.setupEventListeners();
    this.startSyncProcess();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncProgress();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Auto-save on page unload
    window.addEventListener('beforeunload', () => {
      this.syncProgress();
    });

    // Periodic sync
    this.syncInterval = setInterval(() => {
      if (this.isOnline) {
        this.syncProgress();
      }
    }, 30000); // Sync every 30 seconds
  }

  private startSyncProcess() {
    // Start background sync process
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        return registration.sync.register('background-sync');
      });
    }
  }

  async trackProgress(data: ProgressData) {
    // Add to queue
    this.progressQueue.push(data);
    
    // Store in localStorage as backup
    this.storeProgressLocally(data);

    // Try to sync immediately if online
    if (this.isOnline) {
      await this.syncProgress();
    }
  }

  private storeProgressLocally(data: ProgressData) {
    try {
      const stored = localStorage.getItem('progressQueue');
      const queue = stored ? JSON.parse(stored) : [];
      queue.push(data);
      localStorage.setItem('progressQueue', JSON.stringify(queue.slice(-100))); // Keep last 100 items
    } catch (error) {
      console.error('Failed to store progress locally:', error);
    }
  }

  private async syncProgress() {
    if (this.progressQueue.length === 0) return;

    try {
      const dataToSync = [...this.progressQueue];
      this.progressQueue = [];

      // Send to backend using apiClient
      await apiClient.post('/student/progress/batch', dataToSync);

      // Clear local storage on successful sync
      localStorage.removeItem('progressQueue');
    } catch (error) {
      console.error('Progress sync failed:', error);
      // Re-add to queue on failure
      this.progressQueue.unshift(...dataToSync);
      // Data remains in queue for next sync attempt
    }
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('beforeunload', this.syncProgress);
  }
}

export const useProgressTracking = () => {
  // Get user data from localStorage
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  };
  
  const [currentProgress, setCurrentProgress] = useState<ModuleProgress | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  const [currentModule, setCurrentModule] = useState<string>('');
  const [currentChapter, setCurrentChapter] = useState<string>('');

  const tracker = ProgressTracker.getInstance();

  // Initialize tracking session
  const startTracking = useCallback((moduleId: string, chapterId?: string) => {
    setCurrentModule(moduleId);
    setCurrentChapter(chapterId || '');
    setSessionStartTime(new Date());
    setIsTracking(true);

    // Track session start
    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId,
      chapterId,
      action: 'session_start',
      timestamp: new Date(),
      timeSpent: 0,
      progress: 0,
      metadata: { platform: navigator.platform, userAgent: navigator.userAgent }
    });
  }, [tracker]);

  // Stop tracking session
  const stopTracking = useCallback(() => {
    if (!isTracking) return;

    const timeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
    
    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId: currentModule,
      chapterId: currentChapter,
      action: 'session_end',
      timestamp: new Date(),
      timeSpent,
      progress: 0,
      metadata: { totalSessionTime: timeSpent }
    });

    setIsTracking(false);
  }, [isTracking, sessionStartTime, currentModule, currentChapter, tracker]);

  // Track video progress
  const trackVideoProgress = useCallback((videoId: string, watchTime: number, totalDuration: number, currentPosition: number) => {
    const progress = Math.min((watchTime / totalDuration) * 100, 100);
    const completed = progress >= 80; // Consider video completed at 80%

    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId: currentModule,
      chapterId: currentChapter,
      contentId: videoId,
      action: completed ? 'video_completed' : 'video_progress',
      timestamp: new Date(),
      timeSpent: watchTime,
      progress,
      metadata: { 
        videoId, 
        watchTime, 
        totalDuration, 
        currentPosition,
        completed 
      }
    });
  }, [currentModule, currentChapter, tracker]);

  // Track chapter completion
  const trackChapterCompletion = useCallback((chapterId: string, timeSpent: number) => {
    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId: currentModule,
      chapterId: chapterId,
      action: 'chapter_completed',
      timestamp: new Date(),
      timeSpent,
      progress: 100,
      metadata: { completedAt: new Date() }
    });
  }, [currentModule, tracker]);

  // Track module completion
  const trackModuleCompletion = useCallback((moduleId: string, totalTimeSpent: number, finalScore?: number) => {
    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId: moduleId,
      action: 'module_completed',
      timestamp: new Date(),
      timeSpent: totalTimeSpent,
      progress: 100,
      metadata: { 
        completedAt: new Date(), 
        finalScore,
        certificateEarned: finalScore ? finalScore >= 70 : true
      }
    });
  }, [tracker]);

  // Track quiz attempt
  const trackQuizAttempt = useCallback((quizId: string, score: number, percentage: number, timeSpent: number, answers: any[]) => {
    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId: currentModule,
      contentId: quizId,
      action: 'quiz_completed',
      timestamp: new Date(),
      timeSpent,
      progress: percentage,
      metadata: {
        quizId,
        score,
        percentage,
        passed: percentage >= 70,
        answers: answers.length,
        correctAnswers: answers.filter(a => a.correct).length
      }
    });
  }, [currentModule, tracker]);

  // Track engagement events
  const trackEngagement = useCallback((action: string, contentId?: string, metadata?: any) => {
    const user = getCurrentUser();
    tracker.trackProgress({
      userId: user?.id || user?._id || '',
      moduleId: currentModule,
      chapterId: currentChapter,
      contentId,
      action,
      timestamp: new Date(),
      timeSpent: Math.floor((Date.now() - sessionStartTime.getTime()) / 1000),
      progress: 0,
      metadata
    });
  }, [currentModule, currentChapter, sessionStartTime, tracker]);

  // Get current progress for a module
  const getModuleProgress = useCallback(async (moduleId: string): Promise<ModuleProgress | null> => {
    try {
      const response = await apiClient.get(`/student/progress/${moduleId}`);
      setCurrentProgress(response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
    return null;
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - sessionStartTime.getTime()) / 1000);
      const user = getCurrentUser();
      
      tracker.trackProgress({
        userId: user?.id || user?._id || '',
        moduleId: currentModule,
        chapterId: currentChapter,
        action: 'auto_save',
        timestamp: new Date(),
        timeSpent,
        progress: 0,
        metadata: { autoSave: true }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [isTracking, sessionStartTime, currentModule, currentChapter, tracker]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    // State
    isTracking,
    currentProgress,
    sessionStartTime,
    currentModule,
    currentChapter,
    
    // Actions
    startTracking,
    stopTracking,
    trackVideoProgress,
    trackChapterCompletion,
    trackModuleCompletion,
    trackQuizAttempt,
    trackEngagement,
    getModuleProgress
  };
};

// Video Progress Hook for YouTube embed
export const useVideoProgress = (videoId: string, totalDuration: number) => {
  const [watchTime, setWatchTime] = useState(0);
  const [lastPosition, setLastPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const { trackVideoProgress } = useProgressTracking();

  const updateProgress = useCallback((currentTime: number) => {
    setLastPosition(currentTime);
    
    // Only count forward progress (prevent seeking back from inflating watch time)
    if (currentTime > lastPosition) {
      setWatchTime(prev => prev + (currentTime - lastPosition));
    }

    const progress = (watchTime / totalDuration) * 100;
    
    if (progress >= 80 && !isCompleted) {
      setIsCompleted(true);
      trackVideoProgress(videoId, watchTime, totalDuration, currentTime);
    } else if (Math.floor(progress) % 10 === 0) {
      // Track every 10% progress
      trackVideoProgress(videoId, watchTime, totalDuration, currentTime);
    }
  }, [lastPosition, watchTime, totalDuration, isCompleted, videoId, trackVideoProgress]);

  const resetProgress = useCallback(() => {
    setWatchTime(0);
    setLastPosition(0);
    setIsCompleted(false);
  }, []);

  return {
    watchTime,
    lastPosition,
    isCompleted,
    progress: Math.min((watchTime / totalDuration) * 100, 100),
    updateProgress,
    resetProgress
  };
};

// Enhanced YouTube Player Component with Progress Tracking
export const TrackedYouTubeEmbed = ({ 
  videoUrl, 
  title, 
  onVideoComplete 
}: { 
  videoUrl: string; 
  title: string; 
  onVideoComplete?: () => void;
}) => {
  const [player, setPlayer] = useState<any>(null);
  const [videoId, setVideoId] = useState<string>('');
  const [duration, setDuration] = useState<number>(0);
  const { updateProgress, progress, isCompleted } = useVideoProgress(videoId, duration);

  // Extract video ID from URL
  useEffect(() => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = videoUrl.match(regex);
    if (match) {
      setVideoId(match[1]);
    }
  }, [videoUrl]);

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }
  }, [videoId]);

  const initializePlayer = () => {
    if (!videoId) return;

    const ytPlayer = new window.YT.Player(`youtube-player-${videoId}`, {
      height: '390',
      width: '640',
      videoId: videoId,
      events: {
        onReady: (event: any) => {
          setDuration(event.target.getDuration());
          setPlayer(event.target);
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            startProgressTracking();
          }
        }
      }
    });
  };

  const startProgressTracking = () => {
    const interval = setInterval(() => {
      if (player && player.getCurrentTime) {
        const currentTime = player.getCurrentTime();
        updateProgress(currentTime);
        
        if (isCompleted && onVideoComplete) {
          onVideoComplete();
          clearInterval(interval);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  if (!videoId) {
    return (
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p>Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="aspect-video rounded-lg overflow-hidden">
        <div id={`youtube-player-${videoId}`} className="w-full h-full" />
      </div>
      
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{title}</span>
          <span>{Math.round(progress)}% completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            <span>Video completed!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default useProgressTracking;
