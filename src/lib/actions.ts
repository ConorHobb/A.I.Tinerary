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

export async function regenerateActivityAction(input: z.infer<typeof regenerateActivitySchema>): Promise<Activity> {
    const validatedInput = regenerateActivitySchema.parse(input);
    const { regeneratedActivity } = await regenerateActivity(validatedInput);

    // The AI might return slightly different field names, so we normalize them.
    return {
        name: regeneratedActivity.name,
        category: regeneratedActivity.category,
        description: regeneratedActivity.description,
        cost: regeneratedActivity.cost,
        openingHours: regeneratedActivity.openingHours,
        distance: regeneratedActivity.distance,
        mapPin: regeneratedActivity.mapPin,
        bookingUrl: regeneratedActivity.bookingUrl,
        rationale: regeneratedActivity.rationale,
    };
}
