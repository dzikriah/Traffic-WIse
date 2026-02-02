'use server';

/**
 * @fileOverview This file defines a Genkit flow for explaining significant traffic changes in a city.
 *
 * - explainTrafficChange - A function that takes previous and current traffic data and returns an explanation.
 * - ExplainTrafficChangeInput - The input type for the explainTrafficChange function.
 * - ExplainTrafficChangeOutput - The return type for the explainTrafficChange function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ExplainTrafficChangeInputSchema = z.object({
  location: z.string().describe('The location of the traffic observation.'),
  previousTotalVolume: z.number().describe('The previous total vehicle volume.'),
  currentTotalVolume: z.number().describe('The current total vehicle volume.'),
  previousAverageSpeed: z.number().describe('The previous average speed.'),
  currentAverageSpeed: z.number().describe('The current average speed.'),
  previousTrafficStatus: z.string().describe('The previous traffic status.'),
  currentTrafficStatus: z.string().describe('The current traffic status.'),
  timestamp: z.string().describe('The current timestamp.'),
  carVolume: z.number().describe('The current volume of cars.'),
  motorcycleVolume: z.number().describe('The current volume of motorcycles.'),
  weather: z.string().describe('The current weather condition (e.g., Sunny, Cloudy, Rainy).'),
  temperature: z.number().describe('The current temperature in Celsius.'),
});
export type ExplainTrafficChangeInput = z.infer<typeof ExplainTrafficChangeInputSchema>;

const ExplainTrafficChangeOutputSchema = z.object({
  explanation: z
    .string()
    .describe('A single, insightful paragraph analyzing the traffic changes.'),
});
export type ExplainTrafficChangeOutput = z.infer<typeof ExplainTrafficChangeOutputSchema>;

export async function explainTrafficChange(input: ExplainTrafficChangeInput): Promise<ExplainTrafficChangeOutput> {
  return explainTrafficChangeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainTrafficChangePrompt',
  input: {schema: ExplainTrafficChangeInputSchema},
  output: {schema: ExplainTrafficChangeOutputSchema},
  prompt: `You are a sophisticated traffic analysis AI for Jakarta. Your task is to provide an insightful, one-paragraph analysis of the traffic situation based on the data provided.

  Location: {{{location}}}
  Timestamp: {{{timestamp}}}
  Weather: {{{weather}}}, {{{temperature}}}°C

  Data Comparison:
  - Previous State: {{{previousTotalVolume}}} vehicles at {{{previousAverageSpeed}}} km/h (Status: {{{previousTrafficStatus}}})
  - Current State: {{{currentTotalVolume}}} vehicles at {{{currentAverageSpeed}}} km/h (Status: {{{currentTrafficStatus}}})

  Current Vehicle Breakdown:
  - Cars: {{{carVolume}}}
  - Motorcycles: {{{motorcycleVolume}}}

  Based on this data, generate a fluid, insightful paragraph. Your analysis MUST:
  1.  Start by stating the dominant vehicle type (e.g., "Motorcycles continue to dominate the traffic flow...").
  2.  Comment on the current average speed and what it means for travel time (e.g., "...with the average speed holding at a slow {{{currentAverageSpeed}}} km/h, indicating significant travel delays.").
  3.  Explain the *change* in traffic volume and speed, linking them together (e.g., "There has been a slight increase in total vehicle volume, which is contributing to the drop in speed.").
  4.  Incorporate the weather information into the analysis (e.g., "The clear weather is encouraging more motorcyclists onto the road...").
  5.  Conclude with a summary of the overall situation.

  Do not use lists or bullet points. Provide a single, well-written paragraph.
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
