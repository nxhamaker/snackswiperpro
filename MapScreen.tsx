import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import * as Location from 'expo-location';
import { Restaurant, UserStats } from '../types';
import { StorageService } from '../services/StorageService';
import { LocationService } from '../services/LocationService';
import { RestaurantAPIService } from '../services/RestaurantAPIService';

interface RestaurantWithDistance extends Restaurant {
  distance: number;
}

export const MapScreen: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeMap();
  }, []);

  const initializeMap = async () => {
    try {
      setIsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      let userLoc = { latitude: 37.7749, longitude: -122.4194 };
      
      if (status === 'granted') {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          
          userLoc = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
        } catch (locationError) {
          console.log('Using default location:', locationError);
        }
      }
      
      setUserLocation(userLoc);
      
      // Fetch real restaurants near user's location
      const nearbyRestaurants = await RestaurantAPIService.fetchNearbyRestaurants(
        userLoc.latitude, 
        userLoc.longitude, 
        10 // 10km radius for map view
      );
      
      const unlockedIds = await StorageService.getUnlockedRestaurants();
      const updatedRestaurants = nearbyRestaurants.map(r => ({
        ...r,
        isUnlocked: unlockedIds.includes(r.id) || r.isUnlocked,
        distance: LocationService.calculateDistance(
          userLoc.latitude, userLoc.longitude,
          r.location.latitude, r.location.longitude
        )
      })).sort((a, b) => a.distance - b.distance);
      
      setRestaurants(updatedRestaurants);
      
      const stats = await StorageService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error('Map initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantPress = async (restaurant: RestaurantWithDistance) => {
    const UNLOCK_RADIUS = 500; // meters

    if (restaurant.isUnlocked) {
      Alert.alert(
        restaurant.name,
        `${restaurant.cuisine} • ${restaurant.tags.join(', ')}\nPopularity: ${restaurant.popularity}%\nDistance: ${Math.round(restaurant.distance)}m away\n\n${restaurant.isTreasure ? '💎 This is a treasure restaurant!' : ''}`,
        [
          { text: 'OK' },
          { 
            text: 'Add to Favorites', 
            onPress: () => addToFavorites(restaurant.id)
          }
        ]
      );
      return;
    }

    if (!userLocation) {
      Alert.alert('Location Required', 'Enable location services to unlock restaurants');
      return;
    }

    if (restaurant.distance <= UNLOCK_RADIUS) {
      // Unlock restaurant
      const updatedRestaurants = restaurants.map(r =>
        r.id === restaurant.id ? { ...r, isUnlocked: true } : r
      );
      setRestaurants(updatedRestaurants);

      const unlockedIds = await StorageService.getUnlockedRestaurants();
      await StorageService.saveUnlockedRestaurants([...unlockedIds, restaurant.id]);

      if (userStats) {
        const energyBonus = restaurant.isTreasure ? 15 : 10;
        const updatedStats = {
          ...userStats,
          swipeEnergy: Math.min(100, userStats.swipeEnergy + energyBonus),
          treasuresFound: restaurant.isTreasure ? userStats.treasuresFound + 1 : userStats.treasuresFound
        };
        setUserStats(updatedStats);
        await StorageService.saveUserStats(updatedStats);
      }

      Alert.alert(
        '🎉 Restaurant Unlocked!',
        `${restaurant.name} is now available in your swipe deck!\n+${restaurant.isTreasure ? 15 : 10} Swipe Energy${restaurant.isTreasure ? '\n💎 Treasure Found!' : ''}`,
        [{ text: 'Great!' }]
      );
    } else {
      Alert.alert(
        'Too Far Away',
        `Get within ${UNLOCK_RADIUS}m to unlock ${restaurant.name}\n\nCurrent distance: ${Math.round(restaurant.distance)}m\n\n${restaurant.isTreasure ? '💎 This is a treasure restaurant - worth the journey!' : ''}`,
        [{ text: 'OK' }]
      );
    }
  };

  const addToFavorites = async (restaurantId: string) => {
    if (userStats) {
      const updatedStats = {
        ...userStats,
        favoriteRestaurants: [...new Set([...userStats.favoriteRestaurants, restaurantId])]
      };
      setUserStats(updatedStats);
      await StorageService.saveUserStats(updatedStats);
      Alert.alert('Added to Favorites', 'Restaurant added to your favorites!');
    }
  };

  const renderRestaurantItem = ({ item }: { item: RestaurantWithDistance }) => (
    <TouchableOpacity 
      style={styles.listItem} 
      onPress={() => handleRestaurantPress(item)}
    >
      <View style={styles.listItemHeader}>
        <Text style={styles.listItemName}>
          {item.isUnlocked ? item.name : '???'}
        </Text>
        <View style={styles.listItemBadges}>
          {item.isTreasure && <Text style={styles.treasureBadge}>💎</Text>}
          {userStats?.favoriteRestaurants.includes(item.id) && <Text style={styles.favoriteBadge}>❤️</Text>}
        </View>
      </View>
      <Text style={styles.listItemCuisine}>
        {item.isUnlocked ? item.cuisine : 'Locked'}
      </Text>
      <Text style={styles.listItemDistance}>
        {Math.round(item.distance)}m away
      </Text>
      {!item.isUnlocked && item.distance <= 500 && (
        <Text style={styles.unlockableText}>Tap to unlock!</Text>
      )}
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🔍 Finding restaurants near you...</Text>
        <Text style={styles.loadingSubtext}>Using GPS to discover local dining options</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Restaurants</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={initializeMap}>
          <Text style={styles.refreshText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      {userLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            📍 Found {restaurants.length} real restaurants near you
          </Text>
          <Text style={styles.locationSubtext}>
            Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </Text>
        </View>
      )}

      <FlatList
        data={restaurants}
        renderItem={renderRestaurantItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {userStats && (
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>⚡ {userStats.swipeEnergy}</Text>
          <Text style={styles.statsText}>💎 {userStats.treasuresFound}</Text>
          <Text style={styles.statsText}>❤️ {userStats.favoriteRestaurants.length}</Text>
          <Text style={styles.statsText}>📍 {restaurants.filter(r => r.isUnlocked).length}/{restaurants.length}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  refreshText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  locationInfo: {
    backgroundColor: '#E8F5E8',
    padding: 15,
    margin: 10,
    borderRadius: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  locationSubtext: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  list: {
    flex: 1,
    padding: 10,
  },
  listItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  listItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  listItemBadges: {
    flexDirection: 'row',
  },
  treasureBadge: {
    fontSize: 16,
    marginLeft: 5,
  },
  favoriteBadge: {
    fontSize: 16,
    marginLeft: 5,
  },
  listItemCuisine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  listItemDistance: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  unlockableText: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: 'bold',
    marginTop: 5,
  },
  statsBar: {
    backgroundColor: 'white',
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});