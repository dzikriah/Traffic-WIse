'use server';

/**
 * @fileOverview Retrieves the current weather for a given location.
 *
 * - getWeather - A function that gets the weather.
 * - GetWeatherInput - The input type for the getWeather function.
 * - GetWeatherOutput - The return type for the getWeather function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GetWeatherInputSchema = z.object({
  location: z.string().describe('The city name to get the weather for.'),
});
export type GetWeatherInput = z.infer<typeof GetWeatherInputSchema>;

const GetWeatherOutputSchema = z.object({
  weather: z.enum(['Sunny', 'Cloudy', 'Rainy', 'Thunderstorm']).describe("The current weather condition."),
  temperature: z.number().describe('The current temperature in Celsius.'),
});
export type GetWeatherOutput = z.infer<typeof GetWeatherOutputSchema>;

export async function getWeather(
  input: GetWeatherInput
): Promise<GetWeatherOutput> {
  return getWeatherFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWeatherPrompt',
  input: {schema: GetWeatherInputSchema},
  output: {schema: GetWeatherOutputSchema},
  prompt: `You are a weather service API. Provide a realistic current weather condition and temperature in Celsius for the given location.

Location: {{{location}}}

Instructions:
1. The weather can only be one of 'Sunny', 'Cloudy', 'Rainy', or 'Thunderstorm'.
2. The temperature should be realistic for Jakarta or similar tropical cities.
3. Range requirements:
   - If 'Sunny', temperatures should be higher (30°C - 34°C).
   - If 'Cloudy', temperatures should be moderate (27°C - 29°C).
   - If 'Rainy' or 'Thunderstorm', temperatures MUST be lower (24°C - 26°C).
4. Do not always return the same values. Vary the output significantly based on these conditions.

Respond with valid JSON.`,
});

const getWeatherFlow = ai.defineFlow(
  {
    name: 'getWeatherFlow',
    inputSchema: GetWeatherInputSchema,
    outputSchema: GetWeatherOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
