# SnackSwipePro

A mobile application where users swipe through restaurants and dishes in a game-like environment with rule-based mechanics, taste profiling, and map exploration.

## Features

### 🎯 Core Features
- **Swipe Deck System**: Horizontal swipe cards with restaurant information, compatibility scores, and mood stats
- **Rule-based Taste Profile Engine**: Deterministic preference updates based on user swipes
- **Map Exploration Mode**: Discover and unlock restaurants by exploring map locations
- **Popularity Simulation**: Restaurant popularity changes based on user interactions

### 🎮 Swipe Actions
- **Right Swipe**: Like restaurant (increases preferences)
- **Left Swipe**: Reject restaurant (decreases preferences)  
- **Up Swipe**: Add to wishlist (strong preference boost)
- **Down Swipe**: Skip (minor preference decrease)

### 🗺️ Map Features
- Restaurant pins with unlock radius (500m)
- Hidden treasure restaurants with bonus rewards
- Real-time location-based unlocking
- Swipe energy restoration when discovering new places

### 📊 Profile System
- Dynamic taste profile with cuisine and tag preferences
- Spice tolerance and budget consciousness tracking
- Statistics dashboard with swipe counts and achievements
- Profile reset functionality

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Run on device/simulator:
```bash
npm run android  # For Android
npm run ios      # For iOS
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── SwipeCard.tsx
├── screens/        # Main app screens
│   ├── SwipeDeckScreen.tsx
│   ├── MapScreen.tsx
│   └── ProfileScreen.tsx
├── services/       # Business logic services
│   ├── TasteProfileEngine.ts
│   └── StorageService.ts
├── types/          # TypeScript type definitions
│   └── index.ts
└── data/           # Mock data and constants
    └── restaurants.ts
```

## Technical Implementation

### State Management
- Local state with React hooks
- Persistent storage with AsyncStorage
- Real-time profile updates based on swipe actions

### Rule-based Engine
- Deterministic taste profile calculations
- Weighted preference updates based on action types
- Compatibility scoring algorithm

### Map Integration
- React Native Maps with location services
- Geofencing for restaurant unlocking
- Dynamic pin colors based on status

## Game Mechanics

### Energy System
- Users start with 100 swipe energy
- Each swipe consumes 1 energy point
- Discovering new restaurants restores 10 energy

### Treasure System
- Hidden treasure restaurants provide bonus rewards
- Special visual indicators on map and cards
- Achievement tracking for treasure discoveries

### Popularity Dynamics
- Restaurant popularity increases with likes (+2)
- Popularity decreases with rejections (-1)
- Affects future availability and pricing

## Development Notes

- Built with React Native and Expo for cross-platform compatibility
- TypeScript for type safety and better development experience
- Gesture handling with react-native-gesture-handler and reanimated
- Offline-capable with local data persistence

## Future Enhancements

- Daily treasure map quests
- Social features and restaurant sharing
- Advanced filtering and search
- Push notifications for nearby treasures
- Dark mode theme support