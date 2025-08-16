// This is a server-side file, mark it as such.
'use server';

/**
 * @fileOverview Generates a personalized day-by-day itinerary based on user preferences, budget, and destination.
 *
 * - generateItinerary - A function that generates the itinerary.
 * - ItineraryInput - The input type for the generateItinerary function.
 * - ItineraryOutput - The return type for the generateItinerary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ItineraryInputSchema = z.object({
  destination: z.string().describe('The destination for the trip.'),
  startDate: z.string().describe('The start date of the trip (YYYY-MM-DD).'),
  length: z.number().describe('The length of the trip in days.'),
  budget: z.number().describe('The budget for the entire trip in USD.'),
  preferences: z.string().describe('User preferences for activities and food.'),
  pace: z.string().describe('The desired pace of the trip (e.g., relaxed, moderate, busy).'),
  accessibilityNeeds: z.string().optional().describe('Any accessibility needs of the user.'),
});
export type ItineraryInput = z.infer<typeof ItineraryInputSchema>;

const ItineraryOutputSchema = z.object({
  itinerary: z.string().describe('A day-by-day itinerary for the trip.'),
});
export type ItineraryOutput = z.infer<typeof ItineraryOutputSchema>;

export async function generateItinerary(input: ItineraryInput): Promise<ItineraryOutput> {
  return itineraryFlow(input);
}

const itineraryPrompt = ai.definePrompt({
  name: 'itineraryPrompt',
  input: {schema: ItineraryInputSchema},
  output: {schema: ItineraryOutputSchema},
  prompt: `You are a travel agent specializing in creating personalized itineraries.

  Create a {{length}}-day itinerary for a trip to {{destination}}, starting on {{startDate}}.
  The total budget for the trip is {{budget}} USD. The user has the following preferences: {{preferences}}.
  The desired pace of the trip is {{pace}}.  {% if accessibilityNeeds %} The user has the following accessibility needs: {{accessibilityNeeds}}.{% endif %}

  Your itinerary MUST take into account realistic opening hours of locations.
  The itinerary should be in markdown format, with a heading for each day, and a list of activities for each day, including estimated cost, opening hours, distance between locations, and a short description for each activity.
`,
});

const itineraryFlow = ai.defineFlow(
  {
    name: 'itineraryFlow',
    inputSchema: ItineraryInputSchema,
    outputSchema: ItineraryOutputSchema,
  },
  async input => {
    const {output} = await itineraryPrompt(input);
    return output!;
  }
);
