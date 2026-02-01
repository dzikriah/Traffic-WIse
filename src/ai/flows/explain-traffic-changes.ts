'use server';

/**
 * @fileOverview This file defines a Genkit flow for explaining significant traffic changes.
 *
 * - explainTrafficChange - A function that takes the previous and current traffic data and returns an explanation for the changes.
 * - ExplainTrafficChangeInput - The input type for the explainTrafficChange function.
 * - ExplainTrafficChangeOutput - The return type for the explainTrafficChange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTrafficChangeInputSchema = z.object({
  previousVehicleVolume: z.number().describe('The previous vehicle volume.'),
  currentVehicleVolume: z.number().describe('The current vehicle volume.'),
  previousTrafficStatus: z.string().describe('The previous traffic status.'),
  currentTrafficStatus: z.string().describe('The current traffic status.'),
  tollGate: z.string().describe('The current toll gate.'),
  timestamp: z.string().describe('The current timestamp.'),
});
export type ExplainTrafficChangeInput = z.infer<typeof ExplainTrafficChangeInputSchema>;

const ExplainTrafficChangeOutputSchema = z.object({
  explanation: z.string().describe('An explanation for the traffic changes.'),
});
export type ExplainTrafficChangeOutput = z.infer<typeof ExplainTrafficChangeOutputSchema>;

export async function explainTrafficChange(input: ExplainTrafficChangeInput): Promise<ExplainTrafficChangeOutput> {
  return explainTrafficChangeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTrafficChangePrompt',
  input: {schema: ExplainTrafficChangeInputSchema},
  output: {schema: ExplainTrafficChangeOutputSchema},
  prompt: `You are an AI that explains changes in traffic conditions at a toll gate.

  Here's the current situation:
  Timestamp: {{{timestamp}}}
  Toll Gate: {{{tollGate}}}
  Previous Vehicle Volume: {{{previousVehicleVolume}}}
  Current Vehicle Volume: {{{currentVehicleVolume}}}
  Previous Traffic Status: {{{previousTrafficStatus}}}
  Current Traffic Status: {{{currentTrafficStatus}}}

  Explain the change in traffic conditions, focusing on the factors that may have caused the change in a concise manner.
  `,
});

const explainTrafficChangeFlow = ai.defineFlow(
  {
    name: 'explainTrafficChangeFlow',
    inputSchema: ExplainTrafficChangeInputSchema,
    outputSchema: ExplainTrafficChangeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
