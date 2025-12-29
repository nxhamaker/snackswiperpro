import { Restaurant } from '../types';

// These are just fallback restaurants in case location services fail
export const mockRestaurants: Restaurant[] = [];

// This function is no longer used - we fetch real restaurants based on GPS location
export const generateNearbyRestaurants = (userLat: number, userLng: number): Restaurant[] => {
  return [];
};