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
  prompt: `You are a Jakarta traffic expert AI. Provide multi-modal route predictions.

  **Context:**
  - Start: {{{location}}}
  - Destination: {{{destination}}}
  - Traffic: {{{trafficStatus}}}
  - Weather: {{{weather}}}, {{{temperature}}}°C

  **Requirements:**
  1. **predictions**:
     - **car**: Account for congestion and Ganjil-Genap.
     - **motorcycle**: Account for filtering ability but higher rain impact.
     - **publicTransport**: Suggest TransJakarta, MRT, or LRT where applicable.
  2. **distance**: Estimate total distance in KM.
  3. **suggestedRoute**: Primary road corridor.
  4. **weatherImpact**: Specifics (e.g., "Rain makes motorcycle travel dangerous/slow").
  5. **travelAdvisory**: Mention Jakarta-specific rules (Ganjil-Genap, floods).
  6. **comfortScore**: 1-10 rating for the overall journey quality.

  Respond with a valid JSON object.`,
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
