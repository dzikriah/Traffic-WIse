'use server';
/**
 * @fileOverview Predicts travel time and suggests a route based on traffic conditions.
 *
 * - predictRoute - A function that predicts the route details.
 */

import {ai} from '@/ai/genkit';
import {
    PredictRouteInput,
    PredictRouteInputSchema,
    PredictRouteOutput,
    PredictRouteOutputSchema
} from "@/lib/types";


export async function predictRoute(
  input: PredictRouteInput
): Promise<PredictRouteOutput> {
  return predictRouteFlow(input);
}

const predictRoutePrompt = ai.definePrompt({
  name: 'predictRoutePrompt',
  input: {schema: PredictRouteInputSchema},
  output: {schema: PredictRouteOutputSchema},
  prompt: `You are a route prediction AI for Jakarta. Based on the start location, destination, and current traffic status, provide a comprehensive route prediction.

  Start Location: {{{location}}}
  Destination: {{{destination}}}
  Current Traffic Status: {{{trafficStatus}}}

  - Predict a realistic travel time as a range in minutes (e.g., "25-35 minutes"). Travel time should be higher for 'Heavy' traffic.
  - Suggest a plausible primary route using major roads in Jakarta.
  - Estimate the total distance as a string with units (e.g., "15.2 km").
  - Provide a concise, one-sentence explanation for your prediction, linking the route, travel time, and distance to the current traffic status. For example: "The suggested route via Jl. Gatot Subroto avoids the heaviest congestion, but expect moderate delays on the 15 km trip."

  Respond with valid JSON.`,
});

const predictRouteFlow = ai.defineFlow(
  {
    name: 'predictRouteFlow',
    inputSchema: PredictRouteInputSchema,
    outputSchema: PredictRouteOutputSchema,
  },
  async input => {
    const {output} = await predictRoutePrompt(input);
    return output!;
  }
);
