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
  itinerary: z
    .string()
    .describe('A day-by-day itinerary for the trip in Markdown format.'),
});
export type ItineraryOutput = z.infer<typeof ItineraryOutputSchema>;

export async function generateItinerary(input: ItineraryInput): Promise<ItineraryOutput> {
  return itineraryFlow(input);
}

const itineraryPrompt = ai.definePrompt({
  name: 'itineraryPrompt',
  input: {schema: ItineraryInputSchema},
  output: {schema: ItineraryOutputSchema},
  prompt: `You are an expert travel agent AI. Your task is to create a personalized, day-by-day itinerary.

**User Request:**
- **Destination:** {{destination}}
- **Start Date:** {{startDate}}
- **Duration:** {{length}} days
- **Total Budget:** \${{budget}} USD
- **Interests & Preferences:** {{preferences}}
- **Pace:** {{pace}}
{{#if accessibilityNeeds}}- **Accessibility Needs:** {{accessibilityNeeds}}{{/if}}

**Your Task:**
Generate a detailed itinerary in Markdown format. For each day, provide a title and a list of activities. For each activity, you MUST include the following details.

**Crucially, all information you provide must be factual and verifiable. Do not invent information. If you cannot find specific information (like opening hours or exact cost), provide a realistic estimate and explicitly state that it is an estimate (e.g., "Estimated Cost", "Hours may vary").**

- A short, engaging description.
- The category of the activity (e.g., Food, Sightseeing, Museum, Shopping, Outdoor, Entertainment).
- Estimated cost in USD.
- Realistic opening hours.
- Estimated distance from the previous activity.
- A rationale for why this activity was chosen based on the user's preferences.

**Output Format (Strict Markdown):**
Use this exact format. Do not deviate.

## Day 1: [Day 1 Title]
- **[Activity 1 Name]:** ([Category]) - [Description]
  - **Cost:** $[Cost]
  - **Opening Hours:** [Hours]
  - **Distance:** [Distance]
  - **Rationale:** [Rationale]

- **[Activity 2 Name]:** ([Category]) - [Description]
  - **Cost:** $[Cost]
  - **Opening Hours:** [Hours]
  - **Distance:** [Distance]
  - **Rationale:** [Rationale]

## Day 2: [Day 2 Title]
... and so on for all {{length}} days.
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
