'use server';

/**
 * @fileOverview A conversational AI flow for the Jakarta Traffic Assistant.
 *
 * - trafficChat - A function that handles user chat messages with traffic context.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const TrafficChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  location: z.string().optional().describe('The current location context.'),
  trafficStatus: z.string().optional().describe('The current traffic status.'),
  weather: z.string().optional().describe('The current weather condition.'),
  temperature: z.number().optional().describe('The current temperature.'),
});
export type TrafficChatInput = z.infer<typeof TrafficChatInputSchema>;

const TrafficChatOutputSchema = z.object({
  reply: z.string().describe('The AI generated reply.'),
});
export type TrafficChatOutput = z.infer<typeof TrafficChatOutputSchema>;

export async function trafficChat(input: TrafficChatInput): Promise<TrafficChatOutput> {
  return trafficChatFlow(input);
}

const prompt = ai.definePrompt({
  name: 'trafficChatPrompt',
  input: { schema: TrafficChatInputSchema },
  output: { schema: TrafficChatOutputSchema },
  prompt: `You are a helpful and professional Jakarta Traffic Assistant AI.
  
  Your goal is to help users navigate Jakarta and understand current traffic conditions. Be concise, friendly, and informative.
  
  **Current Context (at the monitor's location):**
  - Location: {{{location}}}
  - Traffic: {{{trafficStatus}}}
  - Weather: {{{weather}}} ({{{temperature}}}°C)
  
  **User Message:**
  {{{message}}}
  
  **Instructions:**
  1. If the user asks about the current situation, refer to the context provided.
  2. If the user asks for travel advice, provide practical tips based on the weather and traffic (e.g., "It's heavy traffic and raining, maybe take the MRT").
  3. If the user asks general questions about Jakarta, stay helpful but bring it back to travel/traffic if possible.
  4. Use a friendly tone.
  
  Respond in English.`,
});

const trafficChatFlow = ai.defineFlow(
  {
    name: 'trafficChatFlow',
    inputSchema: TrafficChatInputSchema,
    outputSchema: TrafficChatOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
