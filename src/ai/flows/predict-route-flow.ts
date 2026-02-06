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
  prompt: `You are a Senior Jakarta Traffic Consultant AI. Your goal is to provide highly sophisticated, multi-modal route predictions in English.

  **Context:**
  - **Start**: {{{location}}}
  - **Destination**: {{{destination}}}
  - **Traffic Condition**: {{{trafficStatus}}}
  - **Weather**: {{{weather}}}, {{{temperature}}}°C

  **Instructions for Outputs:**
  1. **predictions**:
     - **car**: Factor in Jakarta's Ganjil-Genap (Odd-Even) rules based on common knowledge of major corridors. Include realistic fuel/toll/parking cost estimates.
     - **motorcycle**: Factor in "filtering" through queues but emphasize risks/delays during rain or extreme heat.
     - **publicTransport**: Be specific (e.g., "Take TransJakarta Corridor 1" or "MRT North-South line"). Use standard flat fares (Rp 3,500 - 14,000).
  2. **bestMode**: Select the objectively superior mode based on a balance of time efficiency, cost, and physical comfort given the current weather.
  3. **distance**: Provide a realistic estimate in KM between the start and destination.
  4. **suggestedRoute**: Name the primary road corridor (e.g., "Jl. Jend. Sudirman", "Tol Dalam Kota").
  5. **primaryCongestionPoint**: Identify the specific street, intersection, or interchange that is currently the main cause of traffic in this route (e.g., "Kuningan Underpass", "Tomang Interchange").
  6. **weatherImpact**: How does the {{{weather}}} specifically affect visibility, road grip, or passenger comfort for each mode?
  7. **travelAdvisory**: Critical local context (e.g., "Semanggi interchange construction", "Flood risk near Grogol", "Odd-Even today").
  8. **peakTimeAdvisory**: Predict the trend for the next 60 minutes (e.g., "Commuter peak is starting; expect speeds to drop by 40%").
  9. **comfortScore**: 1-10 rating for the journey.
  10. **explanation (THE TRIP SUMMARY)**: This is your most important output. Provide a **highly insightful, 2-3 sentence executive synthesis**. Do not just repeat stats. Instead, explain the 'why'. 
     *Example*: "While the car offers a dry environment in this thunderstorm, the MRT is the tactical winner today as it bypasses the predicted 45-minute congestion at the Kuningan intersection, saving you nearly half the travel time for a fraction of the cost."

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
