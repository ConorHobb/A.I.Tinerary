export interface Activity {
  name: string;
  category: string;
  description: string;
  cost: number;
  openingHours: string;
  distance: string;
  mapPin: string;
  bookingUrl?: string;
  rationale: string;
  lat: number;
  lng: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: Activity[];
}

export interface FullItinerary {
  destination: string;
  startDate: string;
  length: number;
  budget: number;
  days: ItineraryDay[];
}
