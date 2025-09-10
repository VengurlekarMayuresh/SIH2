// Performance optimization utilities

import { lazy, Suspense, ComponentType, ReactElement, ReactNode } from 'react';

// Cache Management
class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private memoryCache: Map<string, any> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Set data in cache with TTL (time to live in milliseconds)
  set(key: string, data: any, ttl: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Also store in localStorage for persistence
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        ttl
      }));
    } catch (error) {
      console.warn('Failed to store in localStorage:', error);
    }
  }

  // Get data from cache
  get(key: string): any | null {
    // Check memory cache first
    const memoryData = this.memoryCache.get(key);
    if (memoryData) return memoryData;

    // Check main cache
    const cached = this.cache.get(key);
    if (cached) {
      if (Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      } else {
        this.delete(key);
      }
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(`cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.timestamp < parsed.ttl) {
          // Restore to memory cache
          this.cache.set(key, parsed);
          return parsed.data;
        } else {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve from localStorage:', error);
    }

    return null;
  }

  // Delete specific cache entry
  delete(key: string): void {
    this.cache.delete(key);
    this.memoryCache.delete(key);
    localStorage.removeItem(`cache_${key}`);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.memoryCache.clear();
    
    // Clear localStorage cache items
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Set data in memory cache (faster access, no persistence)
  setMemory(key: string, data: any): void {
    this.memoryCache.set(key, data);
  }

  // Check if data is cached
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Get cache statistics
  getStats(): { totalEntries: number; memoryEntries: number; localStorageSize: number } {
    let localStorageSize = 0;
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorageSize += localStorage.getItem(key)?.length || 0;
      }
    });

    return {
      totalEntries: this.cache.size,
      memoryEntries: this.memoryCache.size,
      localStorageSize
    };
  }
}

// API Cache Hook
export const useApiCache = () => {
  const cache = CacheManager.getInstance();

  const cachedFetch = async (url: string, options?: RequestInit, ttl?: number): Promise<any> => {
    const cacheKey = `api_${url}_${JSON.stringify(options)}`;
    
    // Try cache first
    const cached = cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        cache.set(cacheKey, data, ttl);
        return data;
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    } catch (error) {
      console.error('API fetch failed:', error);
      throw error;
    }
  };

  const invalidateCache = (pattern?: string) => {
    if (pattern) {
      // Invalidate matching keys
      const keys = Array.from(cache['cache'].keys());
      keys.forEach(key => {
        if (key.includes(pattern)) {
          cache.delete(key);
        }
      });
    } else {
      cache.clear();
    }
  };

  return { cachedFetch, invalidateCache, cache };
};

// Image Lazy Loading Component
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==',
  onLoad,
  onError
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = new Image();
            img.onload = () => {
              setImageSrc(src);
              setIsLoaded(true);
              onLoad?.();
            };
            img.onerror = () => {
              onError?.();
            };
            img.src = src;
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, onLoad, onError]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} ${!isLoaded ? 'animate-pulse' : ''}`}
      loading="lazy"
    />
  );
};

// Code Splitting Utilities
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunction: () => Promise<{ default: T }>,
  fallback?: ReactElement
) => {
  const LazyComponent = lazy(importFunction);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback || <div className="animate-pulse h-32 bg-gray-200 rounded" />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Bundle size analyzer
export const BundleAnalyzer = {
  measureRenderTime: (componentName: string) => {
    return (WrappedComponent: ComponentType<any>) => {
      return function MeasuredComponent(props: any) {
        const startTime = performance.now();
        
        useEffect(() => {
          const endTime = performance.now();
          console.log(`${componentName} render time: ${endTime - startTime}ms`);
        });

        return <WrappedComponent {...props} />;
      };
    };
  },

  measureMemoryUsage: () => {
    if ('memory' in performance) {
      const memInfo = (performance as any).memory;
      return {
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit
      };
    }
    return null;
  }
};

// Virtual Scrolling for Large Lists
interface VirtualScrollProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => ReactNode;
  overscan?: number;
}

export const VirtualScroll: React.FC<VirtualScrollProps> = ({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const totalHeight = items.length * itemHeight;
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return (
    <div
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${startIndex * itemHeight}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Debounced Search Hook
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Performance Monitoring Hook
export const usePerformanceMonitor = (componentName: string) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    avgRenderTime: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        avgRenderTime: (prev.avgRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1),
        memoryUsage: BundleAnalyzer.measureMemoryUsage()?.usedJSHeapSize || 0
      }));
    };
  });

  const logMetrics = () => {
    console.group(`Performance Metrics: ${componentName}`);
    console.log('Render Count:', metrics.renderCount);
    console.log('Avg Render Time:', `${metrics.avgRenderTime.toFixed(2)}ms`);
    console.log('Memory Usage:', `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    console.groupEnd();
  };

  return { metrics, logMetrics };
};

// Preload Resources
export const ResourcePreloader = {
  preloadImage: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  },

  preloadImages: async (srcs: string[]): Promise<void> => {
    await Promise.all(srcs.map(src => ResourcePreloader.preloadImage(src)));
  },

  preloadScript: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },

  preloadCSS: (href: string): void => {
    if (document.querySelector(`link[href="${href}"]`)) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  }
};

// Service Worker Registration
export const ServiceWorkerManager = {
  register: async (swPath: string = '/sw.js') => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(swPath);
        console.log('Service Worker registered:', registration);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                window.dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
              }
            });
          }
        });
        
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  },

  unregister: async () => {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map(registration => registration.unregister()));
    }
  }
};

// Web Vitals Monitoring
export const WebVitals = {
  measureCLS: () => {
    let cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          cls += (entry as any).value;
        }
      }
      console.log('Cumulative Layout Shift:', cls);
    }).observe({ type: 'layout-shift', buffered: true });
  },

  measureFCP: () => {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.log('First Contentful Paint:', entry.startTime);
      }
    }).observe({ type: 'paint', buffered: true });
  },

  measureLCP: () => {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('Largest Contentful Paint:', lastEntry.startTime);
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  }
};

export default CacheManager;
