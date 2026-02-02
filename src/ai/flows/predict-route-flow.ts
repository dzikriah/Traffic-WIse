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
  prompt: `You are a route prediction AI for Jakarta. Based on the start location, destination, and current traffic status, predict the travel time, suggest a primary route, and provide a brief explanation.

  Start Location: {{{location}}}
  Destination: {{{destination}}}
  Current Traffic Status: {{{trafficStatus}}}

  - Predict a realistic travel time in minutes. Travel time should be higher for 'Heavy' traffic and lower for 'Smooth' traffic.
  - Suggest a plausible primary route using major roads in Jakarta.
  - Provide a concise, one-sentence explanation for your suggestion, linking it to the current traffic status. For example: "The suggested route via Jl. Gatot Subroto avoids the heaviest congestion, but expect moderate delays."

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
