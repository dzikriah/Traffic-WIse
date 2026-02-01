'use server';

/**
 * @fileOverview This file defines a Genkit flow for explaining significant traffic changes in a city.
 *
 * - explainTrafficChange - A function that takes previous and current traffic data and returns an explanation.
 * - ExplainTrafficChangeInput - The input type for the explainTrafficChange function.
 * - ExplainTrafficChangeOutput - The return type for the explainTrafficChange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExplainTrafficChangeInputSchema = z.object({
  location: z.string().describe('The location of the traffic observation.'),
  previousTotalVolume: z.number().describe('The previous total vehicle volume.'),
  currentTotalVolume: z.number().describe('The current total vehicle volume.'),
  previousAverageSpeed: z.number().describe('The previous average speed.'),
  currentAverageSpeed: z.number().describe('The current average speed.'),
  previousTrafficStatus: z.string().describe('The previous traffic status.'),
  currentTrafficStatus: z.string().describe('The current traffic status.'),
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
  prompt: `You are an AI that explains changes in urban traffic conditions in Jakarta.

  Here's the current situation at {{{location}}}:
  Timestamp: {{{timestamp}}}
  Previous Traffic Status: {{{previousTrafficStatus}}} (Volume: {{{previousTotalVolume}}}, Speed: {{{previousAverageSpeed}}} km/h)
  Current Traffic Status: {{{currentTrafficStatus}}} (Volume: {{{currentTotalVolume}}}, Speed: {{{currentAverageSpeed}}} km/h)

  Explain the change in traffic conditions in a concise and easy-to-understand manner for a general audience. Focus on the most significant changes (volume and/or speed) and their likely impact.
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
