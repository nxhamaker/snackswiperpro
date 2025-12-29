import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { TasteProfile, UserStats } from '../types';
import { StorageService } from '../services/StorageService';

export const ProfileScreen: React.FC = () => {
  const [tasteProfile, setTasteProfile] = useState<TasteProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      const profile = await StorageService.getTasteProfile();
      const stats = await StorageService.getUserStats();
      setTasteProfile(profile);
      setUserStats(stats);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetProfile = () => {
    Alert.alert(
      'Reset Taste Profile',
      'Are you sure you want to reset your taste profile? This will clear all your preferences and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultProfile: TasteProfile = {
              spicePreference: 50,
              budgetPreference: 50,
              cuisinePreferences: {},
              tagPreferences: {},
              lastUpdated: new Date().toISOString()
            };
            await StorageService.saveTasteProfile(defaultProfile);
            setTasteProfile(defaultProfile);
            Alert.alert('Profile Reset', 'Your taste profile has been reset to defaults.');
          }
        }
      ]
    );
  };

  const resetStats = () => {
    Alert.alert(
      'Reset Statistics',
      'Are you sure you want to reset all your statistics? This will clear your swipe history and achievements.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultStats: UserStats = {
              swipeEnergy: 100,
              totalSwipes: 0,
              treasuresFound: 0,
              favoriteRestaurants: [],
              wishlist: []
            };
            await StorageService.saveUserStats(defaultStats);
            setUserStats(defaultStats);
            Alert.alert('Statistics Reset', 'Your statistics have been reset.');
          }
        }
      ]
    );
  };

  const getPreferenceBar = (value: number, label: string, color: string = '#FF6B35') => (
    <View style={styles.preferenceItem}>
      <View style={styles.preferenceHeader}>
        <Text style={styles.preferenceLabel}>{label}</Text>
        <Text style={styles.preferenceValue}>{Math.round(value)}%</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  const getTopPreferences = (preferences: { [key: string]: number }, limit: number = 5) => {
    return Object.entries(preferences)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  const getAchievements = () => {
    const achievements = [];
    if (userStats) {
      if (userStats.totalSwipes >= 50) achievements.push('🎯 Swipe Master');
      if (userStats.treasuresFound >= 5) achievements.push('💎 Treasure Hunter');
      if (userStats.favoriteRestaurants.length >= 10) achievements.push('❤️ Food Lover');
      if (userStats.wishlist.length >= 15) achievements.push('⭐ Wishlist Collector');
      if (userStats.totalSwipes >= 100) achievements.push('🏆 Swipe Legend');
    }
    return achievements;
  };

  if (isLoading || !tasteProfile || !userStats) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>Loading your profile...</Text>
      </View>
    );
  }

  const achievements = getAchievements();

  return (
    <ScrollView style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={[styles.header, darkMode && styles.darkHeader]}>
        <Text style={[styles.title, darkMode && styles.darkText]}>Your Taste Profile</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.resetButton} onPress={resetProfile}>
            <Text style={styles.resetButtonText}>Reset Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics Section */}
      <View style={[styles.section, darkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.totalSwipes}</Text>
            <Text style={styles.statLabel}>Total Swipes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.swipeEnergy}</Text>
            <Text style={styles.statLabel}>Current Energy</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.treasuresFound}</Text>
            <Text style={styles.statLabel}>Treasures Found</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.favoriteRestaurants.length}</Text>
            <Text style={styles.statLabel}>Favorites</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.wishlist.length}</Text>
            <Text style={styles.statLabel}>Wishlist Items</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {userStats.totalSwipes > 0 ? Math.round((userStats.favoriteRestaurants.length / userStats.totalSwipes) * 100) : 0}%
            </Text>
            <Text style={styles.statLabel}>Like Rate</Text>
          </View>
        </View>
      </View>

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <View style={[styles.section, darkMode && styles.darkSection]}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Achievements</Text>
          <View style={styles.achievementsContainer}>
            {achievements.map((achievement, index) => (
              <View key={index} style={styles.achievementBadge}>
                <Text style={styles.achievementText}>{achievement}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Core Preferences Section */}
      <View style={[styles.section, darkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Core Preferences</Text>
        {getPreferenceBar(tasteProfile.spicePreference, 'Spice Tolerance', '#FF4444')}
        {getPreferenceBar(tasteProfile.budgetPreference, 'Budget Consciousness', '#4CAF50')}
      </View>

      {/* Cuisine Preferences Section */}
      <View style={[styles.section, darkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Favorite Cuisines</Text>
        {getTopPreferences(tasteProfile.cuisinePreferences).map(([cuisine, score]) => (
          <View key={cuisine}>
            {getPreferenceBar(score, cuisine, '#2196F3')}
          </View>
        ))}
        {Object.keys(tasteProfile.cuisinePreferences).length === 0 && (
          <Text style={[styles.emptyText, darkMode && styles.darkText]}>
            Start swiping to discover your cuisine preferences!
          </Text>
        )}
      </View>

      {/* Tag Preferences Section */}
      <View style={[styles.section, darkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Favorite Tags</Text>
        {getTopPreferences(tasteProfile.tagPreferences).map(([tag, score]) => (
          <View key={tag}>
            {getPreferenceBar(score, tag, '#9C27B0')}
          </View>
        ))}
        {Object.keys(tasteProfile.tagPreferences).length === 0 && (
          <Text style={[styles.emptyText, darkMode && styles.darkText]}>
            Your tag preferences will appear as you swipe!
          </Text>
        )}
      </View>

      {/* Settings Section */}
      <View style={[styles.section, darkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={[styles.settingLabel, darkMode && styles.darkText]}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#767577', true: '#FF6B35' }}
            thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.dangerButton} onPress={resetStats}>
          <Text style={styles.dangerButtonText}>Reset All Statistics</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Info */}
      <View style={[styles.section, darkMode && styles.darkSection]}>
        <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Profile Information</Text>
        <Text style={[styles.infoText, darkMode && styles.darkText]}>
          Last updated: {new Date(tasteProfile.lastUpdated).toLocaleDateString()}
        </Text>
        <Text style={[styles.infoText, darkMode && styles.darkText]}>
          Profile created based on {userStats.totalSwipes} swipe interactions
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  darkText: {
    color: '#ffffff',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  resetButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  darkSection: {
    backgroundColor: '#1e1e1e',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  achievementsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  achievementBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  achievementText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  preferenceItem: {
    marginBottom: 15,
  },
  preferenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  preferenceValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  dangerButton: {
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  dangerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});