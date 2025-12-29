import { TasteProfile, SwipeAction, Restaurant, Dish } from '../types';

export class TasteProfileEngine {
  static updateProfile(profile: TasteProfile, action: SwipeAction): TasteProfile {
    const newProfile = { ...profile };
    const item = action.item;
    const weight = this.getActionWeight(action.type);

    // Update cuisine preferences
    if (!newProfile.cuisinePreferences[item.cuisine]) {
      newProfile.cuisinePreferences[item.cuisine] = 50;
    }
    newProfile.cuisinePreferences[item.cuisine] = Math.max(0, Math.min(100,
      newProfile.cuisinePreferences[item.cuisine] + weight * 10
    ));

    // Update tag preferences
    item.tags.forEach(tag => {
      if (!newProfile.tagPreferences[tag]) {
        newProfile.tagPreferences[tag] = 50;
      }
      newProfile.tagPreferences[tag] = Math.max(0, Math.min(100,
        newProfile.tagPreferences[tag] + weight * 8
      ));
    });

    // Update spice preference
    if (item.tags.includes('spicy')) {
      newProfile.spicePreference = Math.max(0, Math.min(100,
        newProfile.spicePreference + weight * 15
      ));
    }

    // Update budget preference based on price
    const priceRange = 'priceRange' in item ? item.priceRange : this.getPriceRange(item.price);
    if (action.type === 'like' && priceRange <= 2) {
      newProfile.budgetPreference = Math.max(0, Math.min(100,
        newProfile.budgetPreference + 5
      ));
    } else if (action.type === 'reject' && priceRange >= 3) {
      newProfile.budgetPreference = Math.max(0, Math.min(100,
        newProfile.budgetPreference + 8
      ));
    }

    newProfile.lastUpdated = new Date().toISOString();
    return newProfile;
  }

  private static getActionWeight(type: SwipeAction['type']): number {
    switch (type) {
      case 'like': return 1;
      case 'reject': return -1;
      case 'wishlist': return 1.5;
      case 'skip': return -0.3;
      default: return 0;
    }
  }

  private static getPriceRange(price: number): number {
    if (price <= 10) return 1;
    if (price <= 25) return 2;
    if (price <= 50) return 3;
    return 4;
  }

  static calculateCompatibility(profile: TasteProfile, item: Restaurant | Dish): number {
    let score = 50; // Base score

    // Cuisine compatibility
    const cuisineScore = profile.cuisinePreferences[item.cuisine] || 50;
    score += (cuisineScore - 50) * 0.3;

    // Tag compatibility
    let tagScore = 0;
    item.tags.forEach(tag => {
      tagScore += (profile.tagPreferences[tag] || 50) - 50;
    });
    score += (tagScore / item.tags.length) * 0.4;

    // Spice compatibility
    if (item.tags.includes('spicy')) {
      score += (profile.spicePreference - 50) * 0.2;
    }

    // Budget compatibility
    const priceRange = 'priceRange' in item ? item.priceRange : this.getPriceRange(item.price);
    if (priceRange <= 2 && profile.budgetPreference > 60) {
      score += 10;
    } else if (priceRange >= 3 && profile.budgetPreference < 40) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}