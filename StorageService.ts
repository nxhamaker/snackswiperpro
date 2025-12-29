import AsyncStorage from '@react-native-async-storage/async-storage';
import { TasteProfile, UserStats, Restaurant } from '../types';

export class StorageService {
  private static readonly KEYS = {
    TASTE_PROFILE: 'taste_profile',
    USER_STATS: 'user_stats',
    UNLOCKED_RESTAURANTS: 'unlocked_restaurants',
    LAST_MOOD_RESET: 'last_mood_reset',
    LAST_QUEST_DATE: 'last_quest_date'
  };

  static async getTasteProfile(): Promise<TasteProfile> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.TASTE_PROFILE);
      return data ? JSON.parse(data) : this.getDefaultTasteProfile();
    } catch {
      return this.getDefaultTasteProfile();
    }
  }

  static async saveTasteProfile(profile: TasteProfile): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.TASTE_PROFILE, JSON.stringify(profile));
  }

  static async getUserStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_STATS);
      return data ? JSON.parse(data) : this.getDefaultUserStats();
    } catch {
      return this.getDefaultUserStats();
    }
  }

  static async saveUserStats(stats: UserStats): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.USER_STATS, JSON.stringify(stats));
  }

  static async getUnlockedRestaurants(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.UNLOCKED_RESTAURANTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static async saveUnlockedRestaurants(restaurantIds: string[]): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.UNLOCKED_RESTAURANTS, JSON.stringify(restaurantIds));
  }

  static async shouldResetMood(): Promise<boolean> {
    try {
      const lastReset = await AsyncStorage.getItem(this.KEYS.LAST_MOOD_RESET);
      if (!lastReset) return true;
      
      const lastResetDate = new Date(lastReset);
      const today = new Date();
      return lastResetDate.toDateString() !== today.toDateString();
    } catch {
      return true;
    }
  }

  static async markMoodReset(): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.LAST_MOOD_RESET, new Date().toISOString());
  }

  static async getLastQuestDate(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.KEYS.LAST_QUEST_DATE);
    } catch {
      return null;
    }
  }

  static async setLastQuestDate(date: string): Promise<void> {
    await AsyncStorage.setItem(this.KEYS.LAST_QUEST_DATE, date);
  }

  private static getDefaultTasteProfile(): TasteProfile {
    return {
      spicePreference: 50,
      budgetPreference: 50,
      cuisinePreferences: {},
      tagPreferences: {},
      lastUpdated: new Date().toISOString()
    };
  }

  private static getDefaultUserStats(): UserStats {
    return {
      swipeEnergy: 100,
      totalSwipes: 0,
      treasuresFound: 0,
      favoriteRestaurants: [],
      wishlist: []
    };
  }
}