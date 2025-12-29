import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Restaurant } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 100;

interface SwipeCardProps {
  restaurant: Restaurant;
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void;
  isTop: boolean;
}

export const SwipeCard: React.FC<SwipeCardProps> = ({ restaurant, onSwipe, isTop }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onStart: () => {},
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      opacity.value = 1 - Math.abs(event.translationX) / SCREEN_WIDTH * 0.3;
    },
    onEnd: (event) => {
      const { translationX, translationY } = event;
      
      // Determine swipe direction based on which axis has more movement
      if (Math.abs(translationX) > Math.abs(translationY)) {
        // Horizontal swipe
        if (translationX > SWIPE_THRESHOLD) {
          // Right swipe - Like
          translateX.value = withSpring(SCREEN_WIDTH);
          runOnJS(onSwipe)('right');
        } else if (translationX < -SWIPE_THRESHOLD) {
          // Left swipe - Reject
          translateX.value = withSpring(-SCREEN_WIDTH);
          runOnJS(onSwipe)('left');
        } else {
          // Return to center
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      } else {
        // Vertical swipe
        if (translationY < -SWIPE_THRESHOLD) {
          // Up swipe - Add to Wishlist
          translateY.value = withSpring(-SCREEN_WIDTH);
          runOnJS(onSwipe)('up');
        } else if (translationY > SWIPE_THRESHOLD) {
          // Down swipe - Skip
          translateY.value = withSpring(SCREEN_WIDTH);
          runOnJS(onSwipe)('down');
        } else {
          // Return to center
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
          opacity.value = withSpring(1);
        }
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${translateX.value / 10}deg` },
    ],
    opacity: opacity.value,
  }));

  const getPriceSymbol = (range: number) => '$'.repeat(range);

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isTop}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.name}>{restaurant.name}</Text>
          <Text style={styles.price}>{getPriceSymbol(restaurant.priceRange)}</Text>
        </View>
        
        <Text style={styles.cuisine}>{restaurant.cuisine}</Text>
        
        <View style={styles.tagsContainer}>
          {restaurant.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Compatibility</Text>
            <Text style={styles.statValue}>{restaurant.compatibilityScore}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Mood</Text>
            <Text style={styles.statValue}>{restaurant.mood}%</Text>
          </View>
        </View>
        
        {restaurant.isTreasure && (
          <View style={styles.treasureBadge}>
            <Text style={styles.treasureText}>💎 TREASURE</Text>
          </View>
        )}
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH * 0.9,
    height: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
  },
  price: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  cuisine: {
    fontSize: 16,
    color: '#888',
    marginBottom: 15,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  treasureBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  treasureText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
  },
});