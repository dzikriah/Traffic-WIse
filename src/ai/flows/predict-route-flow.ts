'use server';
/**
 * @fileOverview Predicts travel time for various modes and suggests a route based on traffic conditions.
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
  prompt: `You are a Jakarta traffic expert AI. Provide highly insightful multi-modal route predictions in English.

  **Context:**
  - Start: {{{location}}}
  - Destination: {{{destination}}}
  - Traffic: {{{trafficStatus}}}
  - Weather: {{{weather}}}, {{{temperature}}}°C

  **Requirements:**
  1. **predictions**:
     - **car**: Account for congestion and Ganjil-Genap (Odd-Even) rules. Include fuel/parking cost estimates.
     - **motorcycle**: Account for filtering ability but higher impact from rain/heat. Include Ojek-online style cost estimates.
     - **publicTransport**: Suggest TransJakarta, MRT, or LRT where applicable. Use standard flat fares for costs.
  2. **bestMode**: Choose the most logical mode (balancing time, cost, and current weather).
  3. **distance**: Estimate total distance in KM.
  4. **suggestedRoute**: Primary road corridor.
  5. **weatherImpact**: Specifics on how the current weather affects each mode (e.g., "Rainy weather significantly increases motorcycle risk").
  6. **travelAdvisory**: Mention Jakarta-specific rules (Odd-Even, active construction, flood risks).
  7. **peakTimeAdvisory**: Based on typical Jakarta patterns, will it get better or worse soon?
  8. **comfortScore**: 1-10 rating for the overall journey quality.
  9. **explanation**: Provide a concise "Executive Summary" of why you chose the bestMode.

  Respond with a valid JSON object in English only.`,
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
