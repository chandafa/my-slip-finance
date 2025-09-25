'use server';

/**
 * @fileOverview This file defines a Genkit flow for a conversational AI chatbot.
 *
 * - `chatbot` - A function that takes conversation history and a new message, then returns a response.
 * - `ChatbotInput` - The input type for the chatbot function.
 * - `ChatbotOutput` - The output type for the chatbot function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    parts: z.array(z.object({ text: z.string() })),
});

const ChatbotInputSchema = z.object({
  history: z.array(MessageSchema).describe("The previous conversation history."),
  message: z.string().describe("The user's latest message."),
});
export type ChatbotInput = z.infer<typeof ChatbotInputSchema>;

const ChatbotOutputSchema = z.object({
  response: z.string().describe("The chatbot's response."),
});
export type ChatbotOutput = z.infer<typeof ChatbotOutputSchema>;

export async function chatbot(input: ChatbotInput): Promise<ChatbotOutput> {
  return chatbotFlow(input);
}

const chatbotPrompt = ai.definePrompt({
    name: 'chatbotPrompt',
    input: { schema: ChatbotInputSchema },
    output: { schema: ChatbotOutputSchema },
    system: `You are a friendly and helpful financial assistant for an application called MySlip. Your goal is to assist users with questions about their finances, how to use the app, and provide general financial advice. Be concise and easy to understand.`,
    prompt: `Based on the following conversation history and the user's new message, provide a helpful response.
  
  {{#each history}}
  {{#if (eq this.role 'model')}}
  Assistant: {{{this.parts.[0].text}}}
  {{else}}
  User: {{{this.parts.[0].text}}}
  {{/if}}
  {{/each}}
  
  User: {{{message}}}
  Assistant: `,
});

const chatbotFlow = ai.defineFlow(
  {
    name: 'chatbotFlow',
    inputSchema: ChatbotInputSchema,
    outputSchema: ChatbotOutputSchema,
  },
  async (input) => {
    const { output } = await chatbotPrompt(input);
    return output!;
  }
);
