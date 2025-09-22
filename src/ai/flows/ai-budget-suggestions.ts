'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI-driven budget suggestions based on user income and expenses.
 *
 * @exports aiBudgetSuggestions - An asynchronous function that takes income and expense data as input and returns budget suggestions.
 * @exports AiBudgetSuggestionsInput - The input type for the aiBudgetSuggestions function, defining the structure of income and expense data.
 * @exports AiBudgetSuggestionsOutput - The output type for the aiBudgetSuggestions function, defining the structure of the budget suggestions returned by the AI.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema for the AI budget suggestions flow.
const AiBudgetSuggestionsInputSchema = z.object({
  income: z.number().describe('The user monthly income.'),
  expenses: z.array(
    z.object({
      category: z.string().describe('The category of the expense.'),
      amount: z.number().describe('The amount spent on the expense.'),
    })
  ).describe('A list of expenses with category and amount.'),
});
export type AiBudgetSuggestionsInput = z.infer<typeof AiBudgetSuggestionsInputSchema>;

// Define the output schema for the AI budget suggestions flow.
const AiBudgetSuggestionsOutputSchema = z.object({
  suggestions: z.string().describe('AI-driven budget suggestions based on the provided income and expenses.'),
});
export type AiBudgetSuggestionsOutput = z.infer<typeof AiBudgetSuggestionsOutputSchema>;

/**
 * Asynchronously generates AI-driven budget suggestions based on the provided income and expenses.
 *
 * @param {AiBudgetSuggestionsInput} input - The input data containing user income and expenses.
 * @returns {Promise<AiBudgetSuggestionsOutput>} A promise that resolves to an object containing budget suggestions.
 */
export async function aiBudgetSuggestions(input: AiBudgetSuggestionsInput): Promise<AiBudgetSuggestionsOutput> {
  return aiBudgetSuggestionsFlow(input);
}

// Define the prompt for generating AI budget suggestions.
const aiBudgetSuggestionsPrompt = ai.definePrompt({
  name: 'aiBudgetSuggestionsPrompt',
  input: {schema: AiBudgetSuggestionsInputSchema},
  output: {schema: AiBudgetSuggestionsOutputSchema},
  prompt: `You are a personal finance advisor. Based on the user's income and expenses, provide budget suggestions. Consider suggesting ways to reduce expenses or increase income.

User Income: {{{income}}}
User Expenses:
{{#each expenses}}
  - Category: {{{category}}}, Amount: {{{amount}}}
{{/each}}

Budget Suggestions:`,
});

// Define the Genkit flow for generating AI budget suggestions.
const aiBudgetSuggestionsFlow = ai.defineFlow(
  {
    name: 'aiBudgetSuggestionsFlow',
    inputSchema: AiBudgetSuggestionsInputSchema,
    outputSchema: AiBudgetSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await aiBudgetSuggestionsPrompt(input);
    return output!;
  }
);
