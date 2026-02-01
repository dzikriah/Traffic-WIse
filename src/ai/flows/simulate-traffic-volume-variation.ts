'use server';

/**
 * @fileOverview Simulates changes in traffic flow for cars and motorcycles in a city environment.
 *
 * - simulateTrafficFlow - A function that simulates traffic flow variation.
 * - SimulateTrafficFlowInput - The input type for the simulateTrafficFlow function.
 * - SimulateTrafficFlowOutput - The return type for the simulateTrafficFlow function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateTrafficFlowInputSchema = z.object({
  location: z.string().describe('The current location in Jakarta.'),
  currentCarVolume: z.number().describe('The current number of cars.'),
  currentMotorcycleVolume: z.number().describe('The current number of motorcycles.'),
  currentAverageSpeed: z.number().describe('The current average speed in km/h.'),
});
export type SimulateTrafficFlowInput = z.infer<
  typeof SimulateTrafficFlowInputSchema
>;

const SimulateTrafficFlowOutputSchema = z.object({
  newCarVolume: z
    .number()
    .describe('The new car volume after the simulated change.'),
  newMotorcycleVolume: z
    .number()
    .describe('The new motorcycle volume after the simulated change.'),
  newAverageSpeed: z
    .number()
    .describe('The new average speed in km/h after the simulated change.'),
  explanation: z.string().describe('Brief explanation of the simulated traffic changes.'),
});
export type SimulateTrafficFlowOutput = z.infer<
  typeof SimulateTrafficFlowOutputSchema
>;

export async function simulateTrafficFlow(
  input: SimulateTrafficFlowInput
): Promise<SimulateTrafficFlowOutput> {
  return simulateTrafficFlowFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateTrafficFlowPrompt',
  input: {schema: SimulateTrafficFlowInputSchema},
  output: {schema: SimulateTrafficFlowOutputSchema},
  prompt: `You are a real-time traffic simulation system for Jakarta.

You will simulate a realistic change in vehicle volume (cars and motorcycles) and average speed for the given location. The change should be plausible for a city environment, considering factors like time of day (though not explicitly given, you can infer general patterns), and random events.

Current Location: {{{location}}}
Current Car Volume: {{{currentCarVolume}}}
Current Motorcycle Volume: {{{currentMotorcycleVolume}}}
Current Average Speed: {{{currentAverageSpeed}}} km/h

Simulate a new state. Vehicle volumes should fluctuate realistically (e.g., increase during rush hour, decrease at night). Average speed is inversely related to volume. Ensure volume and speed are non-negative. Provide a brief, one-sentence explanation for the change.

Respond with valid JSON.
`,
});

const simulateTrafficFlowFlow = ai.defineFlow(
  {
    name: 'simulateTrafficFlowFlow',
    inputSchema: SimulateTrafficFlowInputSchema,
    outputSchema: SimulateTrafficFlowOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
