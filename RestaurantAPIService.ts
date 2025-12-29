import { Restaurant } from '../types';

export class RestaurantAPIService {
  static fetchNearbyRestaurants(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 5
  ): Restaurant[] {
    return [
      {
        id: '1',
        name: 'McDonald\'s',
        cuisine: 'Fast Food',
        priceRange: 1,
        tags: ['burgers', 'fast-food'],
        location: { latitude: latitude + 0.001, longitude: longitude + 0.001 },
        popularity: 85,
        isUnlocked: true,
        isTreasure: false,
        mood: 75,
        compatibilityScore: 70
      },
      {
        id: '2',
        name: 'Starbucks',
        cuisine: 'Coffee',
        priceRange: 2,
        tags: ['coffee', 'casual'],
        location: { latitude: latitude - 0.001, longitude: longitude + 0.002 },
        popularity: 90,
        isUnlocked: true,
        isTreasure: false,
        mood: 80,
        compatibilityScore: 75
      },
      {
        id: '3',
        name: 'Pizza Hut',
        cuisine: 'Italian',
        priceRange: 2,
        tags: ['pizza', 'italian'],
        location: { latitude: latitude + 0.002, longitude: longitude - 0.001 },
        popularity: 78,
        isUnlocked: true,
        isTreasure: true,
        mood: 85,
        compatibilityScore: 80
      },
      {
        id: '4',
        name: 'KFC',
        cuisine: 'Fast Food',
        priceRange: 1,
        tags: ['chicken', 'fast-food'],
        location: { latitude: latitude - 0.002, longitude: longitude - 0.002 },
        popularity: 82,
        isUnlocked: true,
        isTreasure: false,
        mood: 70,
        compatibilityScore: 65
      },
      {
        id: '5',
        name: 'Subway',
        cuisine: 'Fast Food',
        priceRange: 1,
        tags: ['sandwiches', 'healthy'],
        location: { latitude: latitude + 0.003, longitude: longitude + 0.003 },
        popularity: 75,
        isUnlocked: true,
        isTreasure: false,
        mood: 65,
        compatibilityScore: 72
      }
    ];
  }
}