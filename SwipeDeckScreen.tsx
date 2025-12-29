import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Alert, TouchableOpacity } from 'react-native';
import { SwipeCard } from '../components/SwipeCard';
import { Restaurant, TasteProfile, UserStats, SwipeAction } from '../types';
import { TasteProfileEngine } from '../services/TasteProfileEngine';
import { StorageService } from '../services/StorageService';
import { LocationService } from '../services/LocationService';
import { RestaurantAPIService } from '../services/RestaurantAPIService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SwipeDeckScreen: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setIsLoading(true);
    
    const profile = await StorageService.getTasteProfile();
    const stats = await StorageService.getUserStats();
    const location = await LocationService.getCurrentLocation();
    
    if (location) {
      setUserLocation(location);
      const restaurants = RestaurantAPIService.fetchNearbyRestaurants(location.latitude, location.longitude);
      setRestaurants(restaurants);
    }
    
    setTasteProfile(profile);
    setUserStats(stats);
    setIsLoading(false);
  };

  const handleSwipe = async (direction: 'left' | 'right' | 'up' | 'down') => {
    if (!tasteProfile || !userStats || currentIndex >= restaurants.length) return;

    const restaurant = restaurants[currentIndex];
    
    // Check energy
    if (userStats.swipeEnergy <= 0) {
      Alert.alert(
        'Out of Energy!', 
        'Your swipe energy is depleted. Explore the map to discover new restaurants and restore energy!',
        [{ text: 'OK' }]
      );
      return;
    }

    let actionType: SwipeAction['type'];
    switch (direction) {
      case 'right': actionType = 'like'; break;
      case 'left': actionType = 'reject'; break;
      case 'up': actionType = 'wishlist'; break;
      case 'down': actionType = 'skip'; break;
    }

    // Create swipe action
    const swipeAction: SwipeAction = {
      type: actionType,
      item: restaurant,
      timestamp: new Date().toISOString()
    };

    // Update taste profile
    const updatedProfile = TasteProfileEngine.updateProfile(tasteProfile, swipeAction);
    setTasteProfile(updatedProfile);
    await StorageService.saveTasteProfile(updatedProfile);

    // Update user stats
    const energyCost = actionType === 'skip' ? 0.5 : 1;
    const updatedStats = {
      ...userStats,
      swipeEnergy: Math.max(0, userStats.swipeEnergy - energyCost),
      totalSwipes: userStats.totalSwipes + 1,
      treasuresFound: restaurant.isTreasure && actionType === 'like' 
        ? userStats.treasuresFound + 1 
        : userStats.treasuresFound,
      favoriteRestaurants: actionType === 'like' 
        ? [...new Set([...userStats.favoriteRestaurants, restaurant.id])]
        : userStats.favoriteRestaurants,
      wishlist: actionType === 'wishlist'
        ? [...new Set([...userStats.wishlist, restaurant.id])]
        : userStats.wishlist
    };

    setUserStats(updatedStats);
    await StorageService.saveUserStats(updatedStats);

    // Update restaurant popularity
    const updatedRestaurants = restaurants.map(r => {
      if (r.id === restaurant.id) {
        let popularityChange = 0;
        switch (actionType) {
          case 'like': popularityChange = 2; break;
          case 'wishlist': popularityChange = 3; break;
          case 'reject': popularityChange = -1; break;
          case 'skip': popularityChange = -0.5; break;
        }
        return {
          ...r,
          popularity: Math.max(0, Math.min(100, r.popularity + popularityChange))
        };
      }
      return r;
    });

    setRestaurants(updatedRestaurants);

    // Show special alerts
    if (restaurant.isTreasure && actionType === 'like') {
      Alert.alert(
        '💎 Treasure Found!', 
        `You discovered ${restaurant.name}! This rare find gives you bonus points and energy!`,
        [{ text: 'Amazing!' }]
      );
      // Bonus energy for treasure
      const bonusStats = { ...updatedStats, swipeEnergy: Math.min(100, updatedStats.swipeEnergy + 5) };
      setUserStats(bonusStats);
      await StorageService.saveUserStats(bonusStats);
    }

    if (actionType === 'wishlist') {
      Alert.alert(
        '⭐ Added to Wishlist!', 
        `${restaurant.name} has been saved to your wishlist for future visits.`,
        [{ text: 'Great!' }]
      );
    }

    setCurrentIndex(currentIndex + 1);
  };

  const refreshLocation = async () => {
    setIsLoading(true);
    await initializeData();
  };

  const getCurrentCards = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingState}>
          <Text style={styles.loadingText}>🚀 Loading restaurants...</Text>
        </View>
      );
    }

    if (currentIndex >= restaurants.length) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No restaurants found nearby!</Text>
          <Text style={styles.emptySubtext}>
            {userStats?.swipeEnergy === 0 
              ? "You're out of energy! Explore the map to restore it."
              : "No restaurants found in your area. Try moving to a different location or refresh to search again."
            }
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshLocation}>
            <Text style={styles.refreshButtonText}>🔄 Refresh Location</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return restaurants.slice(currentIndex, currentIndex + 2).map((restaurant, index) => (
      <SwipeCard
        key={restaurant.id}
        restaurant={restaurant}
        onSwipe={handleSwipe}
        isTop={index === 0}
      />
    ));
  };

  const getEnergyColor = (energy: number) => {
    if (energy >= 70) return '#4CAF50';
    if (energy >= 40) return '#FFC107';
    if (energy >= 20) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.statItem}>
          <Text style={[styles.energy, { color: getEnergyColor(userStats?.swipeEnergy || 0) }]}>
            ⚡ {userStats?.swipeEnergy || 0}
          </Text>
          <Text style={styles.statLabel}>Energy</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.swipes}>🎯 {userStats?.totalSwipes || 0}</Text>
          <Text style={styles.statLabel}>Swipes</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.treasures}>💎 {userStats?.treasuresFound || 0}</Text>
          <Text style={styles.statLabel}>Treasures</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.location}>
            📍 {userLocation ? 'Located' : 'No GPS'}
          </Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        {getCurrentCards()}
      </View>

      {!isLoading && currentIndex < restaurants.length && (
        <View style={styles.actionHints}>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>👎</Text>
            <Text style={styles.hintText}>Reject</Text>
          </View>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>⏭️</Text>
            <Text style={styles.hintText}>Skip</Text>
          </View>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>⭐</Text>
            <Text style={styles.hintText}>Wishlist</Text>
          </View>
          <View style={styles.hintItem}>
            <Text style={styles.hintIcon}>❤️</Text>
            <Text style={styles.hintText}>Like</Text>
          </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  energy: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  swipes: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  treasures: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  location: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  refreshButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  actionHints: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hintItem: {
    alignItems: 'center',
  },
  hintIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  hintText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
});