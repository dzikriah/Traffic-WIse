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
  prompt: `You are a Jakarta traffic expert AI. Provide multi-modal route predictions in English.

  **Context:**
  - Start: {{{location}}}
  - Destination: {{{destination}}}
  - Traffic: {{{trafficStatus}}}
  - Weather: {{{weather}}}, {{{temperature}}}°C

  **Requirements:**
  1. **predictions**:
     - **car**: Account for congestion and Ganjil-Genap (Odd-Even) rules.
     - **motorcycle**: Account for filtering ability but higher impact from rain/heat.
     - **publicTransport**: Suggest TransJakarta, MRT, or LRT where applicable.
  2. **distance**: Estimate total distance in KM.
  3. **suggestedRoute**: Primary road corridor.
  4. **weatherImpact**: Specifics on how the current weather affects each mode.
  5. **travelAdvisory**: Mention Jakarta-specific rules (Odd-Even, active construction, flood risks).
  6. **comfortScore**: 1-10 rating for the overall journey quality.
  7. **explanation**: Provide a concise "Executive Summary" of the trip recommendation.

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
