import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SwipeDeckScreen } from './src/screens/SwipeDeckScreen';
import { MapScreen } from './src/screens/MapScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap;

              if (route.name === 'Swipe') {
                iconName = focused ? 'heart' : 'heart-outline';
              } else if (route.name === 'Map') {
                iconName = focused ? 'map' : 'map-outline';
              } else if (route.name === 'Profile') {
                iconName = focused ? 'person' : 'person-outline';
              } else {
                iconName = 'help-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#FF6B35',
            tabBarInactiveTintColor: 'gray',
            headerShown: false,
          })}
        >
          <Tab.Screen 
            name="Swipe" 
            component={SwipeDeckScreen}
            options={{ title: 'Swipe Deck' }}
          />
          <Tab.Screen 
            name="Map" 
            component={MapScreen}
            options={{ title: 'Explore' }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}