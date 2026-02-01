'use server';

/**
 * @fileOverview Simulates a single vehicle crossing at a traffic light.
 *
 * - simulateVehicleCrossing - A function that simulates a vehicle event.
 */

import {ai} from '@/ai/genkit';
import {
    SimulateVehicleCrossingInput,
    SimulateVehicleCrossingInputSchema,
    SimulateVehicleCrossingOutput,
    SimulateVehicleCrossingOutputSchema
} from "@/lib/types";


export async function simulateVehicleCrossing(
  input: SimulateVehicleCrossingInput
): Promise<SimulateVehicleCrossingOutput> {
  return simulateVehicleCrossingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateVehicleCrossingPrompt',
  input: {schema: SimulateVehicleCrossingInputSchema},
  output: {schema: SimulateVehicleCrossingOutputSchema},
  prompt: `You are a traffic simulation system for a single traffic light in Jakarta.
Your task is to generate a single, realistic vehicle crossing event based on the current traffic status.

Current Traffic Status: {{{trafficStatus}}}

Generate one event for a vehicle. The vehicle can be a 'Car' or 'Motorcycle'.
- If traffic is 'Smooth', the vehicle should pass through at a reasonable speed (e.g., 30-50 km/h). The event description should be simple, like "Vehicle passed through green light."
- If traffic is 'Moderate', the speed should be lower (e.g., 15-30 km/h) and the description might indicate some waiting, like "Vehicle passed after a short wait."
- If traffic is 'Heavy', the speed will be very low (e.g., 0-15 km/h) and the description should reflect congestion, e.g., "Vehicle is part of a dense queue at the red light." or "Vehicle slowly moves through intersection."

Set the timestamp to the current time.

Respond with a valid JSON object.`,
});

const simulateVehicleCrossingFlow = ai.defineFlow(
  {
    name: 'simulateVehicleCrossingFlow',
    inputSchema: SimulateVehicleCrossingInputSchema,
    outputSchema: SimulateVehicleCrossingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
        ...output!,
        timestamp: new Date().toISOString(),
    };
  }
);
