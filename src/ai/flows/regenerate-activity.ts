'use server';

/**
 * @fileOverview An AI agent that regenerates a single activity in a given itinerary based on user constraints.
 *
 * - regenerateActivity - A function that handles the activity regeneration process.
 * - RegenerateActivityInput - The input type for the regenerateActivity function.
 * - RegenerateActivityOutput - The return type for the regenerateActivity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RegenerateActivityInputSchema = z.object({
  itinerary: z.string().describe('The full itinerary as a stringified JSON.'),
  dayIndex: z.number().describe('The index of the day to regenerate (0-indexed).'),
  activityIndex: z.number().describe('The index of the activity to swap (0-indexed).'),
  constraints: z.string().describe('User constraints for regenerating the activity (e.g., more kid-friendly lunch, lower cost museum).'),
});
export type RegenerateActivityInput = z.infer<typeof RegenerateActivityInputSchema>;

const RegenerateActivityOutputSchema = z.object({
  regeneratedActivity: z.object({
    name: z.string().describe('The name of the activity.'),
    category: z.string().describe('The category of the activity.'),
    description: z.string().describe('A description of the activity.'),
    cost: z.number().describe('The estimated cost of the activity.'),
    openingHours: z.string().describe('The opening hours of the activity.'),
    distance: z.string().describe('The distance to the activity.'),
    mapPin: z.string().describe('The map pin for the activity.'),
    bookingUrl: z.string().optional().describe('The booking URL for the activity, if available.'),
    rationale: z.string().describe('The rationale for choosing this activity based on user preferences and constraints.'),
  }).describe('The regenerated activity details.'),
});
export type RegenerateActivityOutput = z.infer<typeof RegenerateActivityOutputSchema>;

export async function regenerateActivity(input: RegenerateActivityInput): Promise<RegenerateActivityOutput> {
  return regenerateActivityFlow(input);
}

const regenerateActivityPrompt = ai.definePrompt({
  name: 'regenerateActivityPrompt',
  input: {schema: RegenerateActivityInputSchema},
  output: {schema: RegenerateActivityOutputSchema},
  prompt: `You are an AI travel assistant specializing in itinerary adjustments. A user has requested to regenerate a specific activity within their itinerary based on certain constraints. 

Here is the itinerary: {{{itinerary}}}

The user wants to regenerate activity at index {{activityIndex}} of day {{dayIndex}} with the following constraints: {{{constraints}}}.

Consider the existing itinerary, user preferences, and constraints to suggest a new activity that fits better. The new activity should still be relevant to the overall itinerary and the day's plan.

Ensure that the rationale clearly explains why this activity is a good replacement, taking into account the constraints and the user's original preferences. Remember to respond with a valid JSON object.
`,
});

const regenerateActivityFlow = ai.defineFlow(
  {
    name: 'regenerateActivityFlow',
    inputSchema: RegenerateActivityInputSchema,
    outputSchema: RegenerateActivityOutputSchema,
  },
  async input => {
    const {output} = await regenerateActivityPrompt(input);
    return output!;
  }
);
