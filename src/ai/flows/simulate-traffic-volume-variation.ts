'use server';

/**
 * @fileOverview Simulates changes in vehicle volume within a defined range (+/- 5 to +/- 20 vehicles) using GenAI.
 *
 * - simulateTrafficVolumeVariation - A function that simulates traffic volume variation.
 * - SimulateTrafficVolumeVariationInput - The input type for the simulateTrafficVolumeVariation function.
 * - SimulateTrafficVolumeVariationOutput - The return type for the simulateTrafficVolumeVariation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimulateTrafficVolumeVariationInputSchema = z.object({
  currentVehicleVolume: z.number().describe('The current vehicle volume.'),
});
export type SimulateTrafficVolumeVariationInput = z.infer<
  typeof SimulateTrafficVolumeVariationInputSchema
>;

const SimulateTrafficVolumeVariationOutputSchema = z.object({
  newVehicleVolume: z
    .number()
    .describe('The new vehicle volume after the simulated change.'),
  explanation: z.string().describe('Explanation of why traffic volume changed.'),
});
export type SimulateTrafficVolumeVariationOutput = z.infer<
  typeof SimulateTrafficVolumeVariationOutputSchema
>;

export async function simulateTrafficVolumeVariation(
  input: SimulateTrafficVolumeVariationInput
): Promise<SimulateTrafficVolumeVariationOutput> {
  return simulateTrafficVolumeVariationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simulateTrafficVolumeVariationPrompt',
  input: {schema: SimulateTrafficVolumeVariationInputSchema},
  output: {schema: SimulateTrafficVolumeVariationOutputSchema},
  prompt: `You are a real-time traffic simulation system.

You will simulate a change in vehicle volume. The change should be between -20 and 20, and you should explain why the volume changed.

Current vehicle volume: {{{currentVehicleVolume}}}

Respond with valid JSON:
{
  "newVehicleVolume": <new vehicle volume>,
    "explanation": <explanation of why traffic volume changed>
}
`,
});

const simulateTrafficVolumeVariationFlow = ai.defineFlow(
  {
    name: 'simulateTrafficVolumeVariationFlow',
    inputSchema: SimulateTrafficVolumeVariationInputSchema,
    outputSchema: SimulateTrafficVolumeVariationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
