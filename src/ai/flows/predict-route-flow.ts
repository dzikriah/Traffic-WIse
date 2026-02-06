'use server';
/**
 * @fileOverview Predicts travel time and suggests a route based on traffic conditions with deep insights.
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
  prompt: `You are a highly intelligent, expert route prediction AI specializing in Jakarta's complex traffic ecosystem. Your goal is to provide a comprehensive, actionable, and insightful route prediction.

  **Input Context:**
  - Start Location: {{{location}}}
  - Destination: {{{destination}}}
  - Current Traffic Status: {{{trafficStatus}}}
  - Current Weather: {{{weather}}}, {{{temperature}}}°C

  **Your Task:**
  Generate a detailed route prediction with deep insights into Jakarta's unique conditions.

  1.  **predictedTravelTime**: A realistic range in minutes. Scale this significantly for 'Heavy' traffic.
  2.  **distance**: Estimated total distance in kilometers.
  3.  **suggestedRoute**: Primary route using major Jakarta roads (e.g., Sudirman, Thamrin, Gatot Subroto, or specific Toll roads).
  4.  **alternativeRoute**: A valid secondary route to avoid typical bottlenecks.
  5.  **weatherInfo**: How the specific weather (Rainy, Thunderstorm, Sunny) interacts with the route (e.g., "Rain often causes pooling on Jl. S. Parman").
  6.  **transportSuggestion**: Be bold and smart. If it's heavy rain and heavy traffic, strongly suggest MRT or TransJakarta. If it's clear and smooth, suggest a motorcycle for speed.
  7.  **explanation**: A cohesive summary of the strategy for this trip.
  8.  **travelAdvisory**: Mention Jakarta-specific factors: Odd-Even (Ganjil-Genap) rules, major construction (like MRT/LRT extensions), or known flood-prone areas relevant to the path.
  9.  **comfortScore**: A rating from 1 (Extreme stress/Gridlock) to 10 (Seamless/Pleasant).

  **Jakarta Insights to include if applicable:**
  - Mention "Jalur Busway" if suggested for public transport.
  - Consider the time of day implicitly for peak hours.
  - Suggest "Ojek Online" for short, congested gaps.

  Respond with a valid JSON object adhering to the specified schema.`,
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
