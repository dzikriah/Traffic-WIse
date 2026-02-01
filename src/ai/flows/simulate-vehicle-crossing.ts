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

Generate one event for a vehicle. The vehicle can be a 'Car', 'Motorcycle', 'Bus', or 'Truck'.
Generate a random but realistic speed for the vehicle type. Buses and trucks are generally slower than cars and motorcycles.

- If traffic is 'Smooth', the vehicle should pass through at a reasonable speed (e.g., Cars: 30-50 km/h, Motorcycles: 35-55 km/h, Buses/Trucks: 20-40 km/h). The event description should be simple, like "Car passed through green light." or "Truck maintaining speed."
- If traffic is 'Moderate', the speed should be lower (e.g., Cars: 15-30 km/h, Motorcycles: 20-35 km/h, Buses/Trucks: 10-25 km/h) and the description might indicate some waiting, like "Motorcycle passed after a short wait." or "Bus proceeds with caution."
- If traffic is 'Heavy', the speed will be very low (e.g., 0-15 km/h) and the description should reflect congestion, e.g., "Vehicle is part of a dense queue at the red light.", "Bus is waiting for passengers.", or "Truck slowly moves through intersection."

Generate a realistic and varied event description based on the vehicle type and traffic status.

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
