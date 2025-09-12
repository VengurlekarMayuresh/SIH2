import { useState, useEffect } from 'react';

interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
  region?: string;
  country?: string;
  accuracy?: number;
  source: 'gps' | 'institution' | 'fallback';
}

interface LocationError {
  code: number;
  message: string;
}

interface UseLocationResult {
  location: LocationData | null;
  loading: boolean;
  error: LocationError | null;
  requestLocation: () => void;
  hasPermission: boolean | null;
}

// Fallback locations
const FALLBACK_LOCATIONS = {
  mumbai: {
    latitude: 19.0760,
    longitude: 72.8777,
    city: 'Mumbai',
    region: 'Maharashtra',
    country: 'India',
    source: 'fallback' as const
  },
  delhi: {
    latitude: 28.6139,
    longitude: 77.2090,
    city: 'Delhi',
    region: 'Delhi',
    country: 'India', 
    source: 'fallback' as const
  }
};

const useLocation = (userData?: any): UseLocationResult => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check if geolocation is supported
  const isGeolocationSupported = 'geolocation' in navigator;

  // Get institution location from userData
  const getInstitutionLocation = (): LocationData | null => {
    if (!userData?.institutionId?.location && !userData?.institution?.location) {
      return null;
    }

    const instLocation = userData.institutionId?.location || userData.institution?.location;
    
    // For institution location, we need to convert city/state to coordinates
    // This is a simplified approach - in production you might want to geocode these
    const locationMap: { [key: string]: { lat: number; lon: number } } = {
      'mumbai': { lat: 19.0760, lon: 72.8777 },
      'delhi': { lat: 28.6139, lon: 77.2090 },
      'bangalore': { lat: 12.9716, lon: 77.5946 },
      'chennai': { lat: 13.0827, lon: 80.2707 },
      'kolkata': { lat: 22.5726, lon: 88.3639 },
      'hyderabad': { lat: 17.3850, lon: 78.4867 },
      'pune': { lat: 18.5204, lon: 73.8567 },
      'ahmedabad': { lat: 23.0225, lon: 72.5714 },
      'jaipur': { lat: 26.9124, lon: 75.7873 },
      'lucknow': { lat: 26.8467, lon: 80.9462 }
    };

    const cityKey = instLocation.city?.toLowerCase();
    const coords = locationMap[cityKey];

    if (coords) {
      return {
        latitude: coords.lat,
        longitude: coords.lon,
        city: instLocation.city,
        region: instLocation.state,
        country: 'India',
        source: 'institution'
      };
    }

    return null;
  };

  // Get user's current GPS location
  const getCurrentPosition = (): Promise<LocationData> => {
    return new Promise((resolve, reject) => {
      if (!isGeolocationSupported) {
        reject({
          code: 0,
          message: 'Geolocation is not supported by this browser'
        });
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds
        maximumAge: 300000 // 5 minutes cache
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          resolve({
            latitude,
            longitude,
            accuracy,
            source: 'gps'
          });
        },
        (geoError) => {
          let message = 'Unknown location error';
          
          switch (geoError.code) {
            case geoError.PERMISSION_DENIED:
              message = 'Location access denied by user';
              setHasPermission(false);
              break;
            case geoError.POSITION_UNAVAILABLE:
              message = 'Location information unavailable';
              break;
            case geoError.TIMEOUT:
              message = 'Location request timed out';
              break;
          }

          reject({
            code: geoError.code,
            message
          });
        },
        options
      );
    });
  };

  // Request location with fallback chain
  const requestLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check permission status first
      if ('permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          setHasPermission(permission.state === 'granted');
          
          if (permission.state === 'denied') {
            throw new Error('Location permission denied');
          }
        } catch (permError) {
          // Permissions API not supported, continue with geolocation
        }
      }

      // Try GPS location first
      try {
        console.log('🗺️ Requesting GPS location...');
        const gpsLocation = await getCurrentPosition();
        console.log('✅ GPS location obtained:', gpsLocation);
        setLocation(gpsLocation);
        setHasPermission(true);
        
        // Try to get city name from coordinates using reverse geocoding
        try {
          // Note: In production, you might want to use a proper reverse geocoding service
          const locationWithCity = {
            ...gpsLocation,
            city: 'Current Location', // Placeholder
            country: 'India'
          };
          setLocation(locationWithCity);
        } catch (geocodeError) {
          console.log('Reverse geocoding failed, using coordinates only');
        }
        
        return;
      } catch (gpsError: any) {
        console.log('❌ GPS location failed:', gpsError.message);
        setError(gpsError);
        setHasPermission(false);
      }

      // Fallback to institution location
      const institutionLocation = getInstitutionLocation();
      if (institutionLocation) {
        console.log('🏫 Using institution location:', institutionLocation);
        setLocation(institutionLocation);
        return;
      }

      // Final fallback to Mumbai
      console.log('🏙️ Using fallback location: Mumbai');
      setLocation(FALLBACK_LOCATIONS.mumbai);

    } catch (err: any) {
      console.error('Location detection failed completely:', err);
      setError({
        code: -1,
        message: 'Failed to detect location'
      });
      
      // Use fallback location even on complete failure
      setLocation(FALLBACK_LOCATIONS.mumbai);
    } finally {
      setLoading(false);
    }
  };

  // Auto-request location on mount
  useEffect(() => {
    // Check if we have cached location preference
    const cachedPermission = localStorage.getItem('location_permission');
    
    if (cachedPermission === 'granted') {
      requestLocation();
    } else if (cachedPermission === 'denied') {
      // Skip GPS, go straight to fallbacks
      setHasPermission(false);
      const institutionLocation = getInstitutionLocation();
      setLocation(institutionLocation || FALLBACK_LOCATIONS.mumbai);
    } else {
      // First time - try to get location
      requestLocation();
    }
  }, [userData]);

  // Cache permission status
  useEffect(() => {
    if (hasPermission !== null) {
      localStorage.setItem('location_permission', hasPermission ? 'granted' : 'denied');
    }
  }, [hasPermission]);

  return {
    location,
    loading,
    error,
    requestLocation,
    hasPermission
  };
};

export default useLocation;