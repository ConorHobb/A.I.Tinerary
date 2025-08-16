import { Landmark, Utensils, ShoppingCart, Hotel, TramFront, Plane, Mountain, Palette, Beer, Film, Mic2, TreePine } from 'lucide-react';
import type React from 'react';

export const categoryIcons: Record<string, React.ElementType> = {
  sightseeing: Landmark,
  landmark: Landmark,
  museum: Landmark,
  food: Utensils,
  restaurant: Utensils,
  cafe: Utensils,
  bar: Beer,
  shopping: ShoppingCart,
  accommodation: Hotel,
  hotel: Hotel,
  transportation: TramFront,
  travel: Plane,
  activity: Mountain,
  outdoor: TreePine,
  art: Palette,
  gallery: Palette,
  entertainment: Film,
  music: Mic2,
  show: Film,
  default: Landmark,
};

export const getCategoryIcon = (category: string) => {
  if (!category) return categoryIcons.default;
  const normalizedCategory = category.toLowerCase();
  for (const key in categoryIcons) {
    if (normalizedCategory.includes(key)) {
      return categoryIcons[key];
    }
  }
  return categoryIcons.default;
};
