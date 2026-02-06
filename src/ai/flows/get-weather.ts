'use server';

/**
 * @fileOverview Retrieves the current weather for a given location with improved transition logic.
 *
 * - getWeather - A function that gets the weather.
 * - GetWeatherInput - The input type for the getWeather function.
 * - GetWeatherOutput - The return type for the getWeather function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const GetWeatherInputSchema = z.object({
  location: z.string().describe('The city name to get the weather for.'),
  currentWeather: z.string().optional().describe('The current weather condition to help simulate transitions.'),
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
  prompt: `You are a specialized weather simulation API for Jakarta. Your goal is to provide HIGHLY DYNAMIC weather changes.

Location: {{{location}}}
Current Weather Context: {{{currentWeather}}}

Instructions:
1. DO NOT always return 'Sunny'. If the current weather is 'Sunny', there is a 40% chance it should transition to 'Cloudy' or 'Rainy'.
2. The weather MUST be one of: 'Sunny', 'Cloudy', 'Rainy', or 'Thunderstorm'.
3. **STRICT TEMPERATURE RULES (Crucial):**
   - If 'Rainy' or 'Thunderstorm': Temperature MUST be between 23.5°C and 25.8°C.
   - If 'Cloudy': Temperature MUST be between 26.5°C and 28.5°C.
   - If 'Sunny': Temperature MUST be between 30.0°C and 33.5°C.
4. If the location just changed or is being searched, feel free to start with 'Rainy' to show the variety.
5. Provide realistic decimal values (e.g., 24.2, 25.7, 31.4).

Respond with valid JSON only.`,
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
