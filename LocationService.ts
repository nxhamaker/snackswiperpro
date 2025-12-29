import * as Location from 'expo-location';

export class LocationService {
  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return { latitude: 37.7749, longitude: -122.4194 };

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch {
      return { latitude: 37.7749, longitude: -122.4194 };
    }
  }

  static calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    return Math.abs(lat1 - lat2) + Math.abs(lon1 - lon2) * 111000;
  }

  static getNearbyRestaurants(restaurants: any[], location: any, radius: number) {
    return restaurants;
  }
}