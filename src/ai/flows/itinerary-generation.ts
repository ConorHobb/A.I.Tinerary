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
  prompt: `You are an expert travel agent AI. Create a personalized, day-by-day itinerary based on user input. Generate a full and engaging schedule for each day. Be concise to save tokens.
**User Request:**
- **Destination:** {{destination}}
- **Start Date:** {{startDate}}
- **Duration:** {{length}} days
- **Total Budget:** \${{budget}} USD
- **Interests & Preferences:** {{preferences}}
- **Pace:** {{pace}}
{{#if accessibilityNeeds}}- **Accessibility Needs:** {{accessibilityNeeds}}{{/if}}

**Your Task:**
Generate a detailed itinerary in Markdown format. For each day, provide a title and a list of activities. Provide exactly the number of days requested. The number of activities should depend on the requested pace: generate 6-7 activities for a 'busy' pace, 4-5 for 'moderate', and 2-3 for 'relaxed'.

**Output Format (Strict Markdown - Follow This Exactly):**
Use this exact format. Do not deviate. Ensure the daily activities support the overall budget utilization goal.

Generate the itinerary for exactly {{length}} days. Each day section MUST start with \`## Day [Day Number]: [Day Title]\` where [Day Number] is the sequential day number (1, 2, 3, ... up to {{length}}). There should be no content before the first day header or between day sections that is not part of the activity or day structure.
For each activity under a day header, use the following strict markdown format:

\`**Your Task:**
Generate a personalized, day-by-day itinerary in Markdown format for {{length}} days in {{destination}}. The itinerary should consider the user's preferences ({{preferences}}), desired pace ({{pace}}), and budget (\${{budget}}). For each day, create a full and engaging schedule, packing in activities. Consider accessibility needs {{accessibilityNeeds}}.\`

- **[Activity Name]:** ([Category]) - [Short, engaging description.]
  - **Cost:** [Estimated cost in USD, e.g., $20 USD]
  - **Opening Hours:** [Realistic opening hours for the activity, e.g., 9:00 AM - 5:00 PM]
  - **Distance:** [Estimated distance from the previous activity, e.g., 1.5 km]
  - **Coordinates:** [Latitude,Longitude for the activity, e.g., 48.8584,2.2945]
  - **Rationale:** [A brief explanation of why this activity was chosen based on user preferences.]
  - **Booking URL:** [Optional booking URL if available. Include the full URL.]

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
