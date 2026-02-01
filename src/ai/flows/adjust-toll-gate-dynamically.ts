'use server';
/**
 * @fileOverview Dynamically adjusts toll gate settings based on traffic conditions.
 *
 * - adjustTollGateDynamically - A function that adjusts toll gate settings.
 * - AdjustTollGateDynamicallyInput - The input type for the adjustTollGateDynamically function.
 * - AdjustTollGateDynamicallyOutput - The return type for the adjustTollGateDynamically function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdjustTollGateDynamicallyInputSchema = z.object({
  currentTrafficStatus: z
    .string()
    .describe("The current traffic status ('Smooth', 'Moderate', or 'Heavy')."),
  currentTollGate: z.string().describe('The current toll gate setting.'),
  vehicleVolume: z.number().describe('The current vehicle volume.'),
});
export type AdjustTollGateDynamicallyInput = z.infer<
  typeof AdjustTollGateDynamicallyInputSchema
>;

const AdjustTollGateDynamicallyOutputSchema = z.object({
  newTollGate: z
    .string()
    .describe('The new toll gate setting, adjusted for traffic conditions.'),
  explanation: z.string().describe('Explanation for why the toll gate was adjusted.'),
});
export type AdjustTollGateDynamicallyOutput = z.infer<
  typeof AdjustTollGateDynamicallyOutputSchema
>;

export async function adjustTollGateDynamically(
  input: AdjustTollGateDynamicallyInput
): Promise<AdjustTollGateDynamicallyOutput> {
  return adjustTollGateDynamicallyFlow(input);
}

const adjustTollGateDynamicallyPrompt = ai.definePrompt({
  name: 'adjustTollGateDynamicallyPrompt',
  input: {schema: AdjustTollGateDynamicallyInputSchema},
  output: {schema: AdjustTollGateDynamicallyOutputSchema},
  prompt: `You are responsible for dynamically adjusting toll gate settings based on real-time traffic conditions.

  Current Traffic Status: {{{currentTrafficStatus}}}
  Current Toll Gate: {{{currentTollGate}}}
  Vehicle Volume: {{{vehicleVolume}}}

  Based on the current traffic status and vehicle volume, determine if the toll gate needs to be adjusted. Only adjust the toll gate if there is a significant shift in traffic (e.g., from Smooth to Heavy or vice versa).

  Return a JSON object with the new toll gate setting and a brief explanation of why the adjustment was made.
  If no adjustment is needed, keep the current toll gate setting.

  Example:
  {
    "newTollGate": "Open all lanes",
    "explanation": "Traffic has increased to Heavy, requiring all lanes to be open."
  }`,
});

const adjustTollGateDynamicallyFlow = ai.defineFlow(
  {
    name: 'adjustTollGateDynamicallyFlow',
    inputSchema: AdjustTollGateDynamicallyInputSchema,
    outputSchema: AdjustTollGateDynamicallyOutputSchema,
  },
  async input => {
    const {output} = await adjustTollGateDynamicallyPrompt(input);
    return output!;
  }
);
