'use server';
/**
 * @fileOverview Determines the primary factor contributing to traffic congestion.
 *
 * - determineCongestionFactor - A function that analyzes traffic data to find the main cause of congestion.
 * - DetermineCongestionFactorInput - The input type for the determineCongestionFactor function.
 * - DetermineCongestionFactorOutput - The return type for the determineCongestionFactor function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetermineCongestionFactorInputSchema = z.object({
  trafficStatus: z
    .string()
    .describe("The current traffic status ('Smooth', 'Moderate', or 'Heavy')."),
  carVolume: z.number().describe('The current volume of cars.'),
  motorcycleVolume: z.number().describe('The current volume of motorcycles.'),
  averageSpeed: z.number().describe('The current average speed in km/h.'),
});
export type DetermineCongestionFactorInput = z.infer<
  typeof DetermineCongestionFactorInputSchema
>;

const DetermineCongestionFactorOutputSchema = z.object({
  congestionFactor: z
    .string()
    .describe('The primary factor causing the current traffic condition.'),
});
export type DetermineCongestionFactorOutput = z.infer<
  typeof DetermineCongestionFactorOutputSchema
>;

export async function determineCongestionFactor(
  input: DetermineCongestionFactorInput
): Promise<DetermineCongestionFactorOutput> {
  return determineCongestionFactorFlow(input);
}

const determineCongestionFactorPrompt = ai.definePrompt({
  name: 'determineCongestionFactorPrompt',
  input: {schema: DetermineCongestionFactorInputSchema},
  output: {schema: DetermineCongestionFactorOutputSchema},
  prompt: `You are a traffic analysis AI. Based on the provided data, identify the single, most significant factor contributing to the current traffic status.

  Current Traffic Status: {{{trafficStatus}}}
  Car Volume: {{{carVolume}}}
  Motorcycle Volume: {{{motorcycleVolume}}}
  Average Speed: {{{averageSpeed}}} km/h

  Analyze the data and determine the primary congestion factor. This could be 'High car volume', 'High motorcycle volume', 'Overall high volume', 'Low average speed', or 'Normal flow' if traffic is smooth. Be concise.

  Return a JSON object with the identified factor.

  Example:
  {
    "congestionFactor": "High motorcycle volume"
  }`,
});

const determineCongestionFactorFlow = ai.defineFlow(
  {
    name: 'determineCongestionFactorFlow',
    inputSchema: DetermineCongestionFactorInputSchema,
    outputSchema: DetermineCongestionFactorOutputSchema,
  },
  async input => {
    const {output} = await determineCongestionFactorPrompt(input);
    return output!;
  }
);
