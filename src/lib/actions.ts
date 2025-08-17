'use server';

import { z } from 'zod';
import { generateItinerary } from '@/ai/flows/itinerary-generation';
import { regenerateActivity } from '@/ai/flows/regenerate-activity';
import { parseItineraryMarkdown } from './parser';
import type { Activity } from './types';

const generateItinerarySchema = z.object({
  destination: z.string(),
  startDate: z.string(),
  length: z.number(),
  budget: z.number(),
  preferences: z.string(),
  pace: z.string(),
  accessibilityNeeds: z.string().optional(),
});

export async function generateItineraryAction(input: z.infer<typeof generateItinerarySchema>) {
  const validatedInput = generateItinerarySchema.parse(input);
  const result = await generateItinerary(validatedInput);
  console.log(result.itinerary);
  return parseItineraryMarkdown(result.itinerary);
}

const regenerateActivitySchema = z.object({
    itinerary: z.string(),
    dayIndex: z.number(),
    activityIndex: z.number(),
    constraints: z.string(),
});

// The AI's output for a regenerated activity might not have all fields,
// especially lat/lng which come from a different part of the prompt.
// We make all fields optional here and merge them with old data.
const RegeneratedActivityPartialSchema = z.object({
    name: z.string(),
    category: z.string(),
    description: z.string(),
    cost: z.number(),
    openingHours: z.string(),
    distance: z.string(),
    mapPin: z.string().optional(), // mapPin is deprecated
    bookingUrl: z.string().optional(),
    rationale: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
});


export async function regenerateActivityAction(input: z.infer<typeof regenerateActivitySchema>): Promise<Activity> {
    const validatedInput = regenerateActivitySchema.parse(input);
    const { regeneratedActivity } = await regenerateActivity(validatedInput);

    const parsedRegenerated = RegeneratedActivityPartialSchema.parse(regeneratedActivity);

    // The AI might not return coordinates, so we'll just have to accept that for now.
    // A more advanced version might make a separate call to geocode the new location.
    return {
        name: parsedRegenerated.name,
        category: parsedRegenerated.category,
        description: parsedRegenerated.description,
        cost: parsedRegenerated.cost,
        openingHours: parsedRegenerated.openingHours,
        distance: parsedRegenerated.distance,
        bookingUrl: parsedRegenerated.bookingUrl,
        rationale: parsedRegenerated.rationale,
        lat: parsedRegenerated.lat || 0,
        lng: parsedRegenerated.lng || 0,
        mapPin: '', // Deprecated, but needs to be on the object
    };
}
