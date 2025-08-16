# **App Name**: WanderWise

## Core Features:

- Trip Form: Onboarding flow with trip form, including destination autocomplete, date/length selection, budget input, preference selection (food, museums, etc.), pace setting, and accessibility needs input.
- Itinerary Generation: AI-powered itinerary generation using Gemini to create a day-by-day plan based on user preferences, budget, and nearby POIs. The AI tool must factor opening hours.
- Results Screen: Display of per-day schedules with time slots for each activity, including name, category, description, cost, opening hours, distance, map pin, booking URL, and rationale. Display budget tracker and mini-map.
- Edit Itinerary: Ability to regenerate a single day's itinerary or swap an activity using Gemini, based on user constraints (e.g., "more kid-friendly lunch", "lower cost museum"). The AI tool must make choices depending on context.
- Save Itinerary: Saving itineraries to Firestore under the user's account.
- Share Itinerary: Generating shareable read-only links to itineraries (without user PII).
- Export Schedule: Generate a printable PDF and .ics calendar file with the schedule (client-side).

## Style Guidelines:

- Primary color: A vibrant blue (#2E9AFE), suggestive of open skies and travel. The association to sky will also help give it a slightly techy and computerized feel.
- Background color: A very light blue (#EBF4FF), nearly white but still sharing a strong association with the primary color to produce a pleasing composition.
- Accent color: A warm orange (#FFB347), used for calls to action and highlighting important elements to catch the user's attention.
- Font pairing: 'Space Grotesk' (sans-serif) for headlines and 'Inter' (sans-serif) for body text to maintain a balance of modernity and readability.
- Use clear and intuitive icons to represent activity categories and actions.
- Mobile-first design with a card-based interface for activities and tabs for day-by-day navigation.
- Subtle animations for transitions and interactions to enhance user experience.