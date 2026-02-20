import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number | null;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permissão de localização negada');
        return false;
      }
      return true;
    } catch (err) {
      setError('Erro ao solicitar permissão de localização');
      return false;
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const locationData: LocationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || null,
      };

      setLocation(locationData);
      setLoading(false);
      return locationData;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao obter localização');
      setLoading(false);
      return null;
    }
  };

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
}
