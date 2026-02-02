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
  prompt: `You are a highly intelligent route prediction AI for Jakarta. Your goal is to provide a comprehensive and insightful route prediction.

  **Input Data:**
  - Start Location: {{{location}}}
  - Destination: {{{destination}}}
  - Current Traffic Status: {{{trafficStatus}}}
  - Current Weather: {{{weather}}}, {{{temperature}}}°C

  **Your Task:**
  Generate a detailed route prediction with the following components:

  1.  **predictedTravelTime**: A realistic travel time as a range in minutes (e.g., "25-35 minutes"). This MUST be higher for 'Heavy' traffic.
  2.  **distance**: Estimate the total distance in kilometers (e.g., "15.2 km").
  3.  **suggestedRoute**: Suggest a plausible primary route using major roads in Jakarta (e.g., "Via Jl. Gatot Subroto and the Inner-City Toll Road.").
  4.  **alternativeRoute**: (Optional) Suggest a plausible alternative route, especially if traffic is heavy. If none is suitable, you can omit this field.
  5.  **weatherInfo**: Provide a concise, one-sentence comment on how the current weather might impact the journey. (e.g., "The heavy rain may cause localized flooding and reduce visibility, so drive with extra caution.").
  6.  **transportSuggestion**: Based on traffic AND weather, provide a smart suggestion for the best mode of transport. Be specific. For example: "Given the heavy traffic and rain, using a ride-hailing car or the MRT would be more comfortable than a motorcycle." or "With clear skies and smooth traffic, a motorcycle will be the fastest option."
  7.  **explanation**: Provide a concise, one-sentence summary that ties everything together. For example: "The suggested route via Jl. Gatot Subroto avoids the worst of the congestion, but expect moderate delays on the 15 km trip due to the weather."

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
