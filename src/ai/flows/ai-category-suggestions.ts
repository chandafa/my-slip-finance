'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing AI-driven category suggestions
 *  based on a user's transaction history, aiming to simplify and automate expense tagging.
 *
 * - `getCategorySuggestions` -  A function that takes transaction history as input and returns category suggestions.
 * - `CategorySuggestionsInput` - The input type for the `getCategorySuggestions` function, which includes transaction history.
 * - `CategorySuggestionsOutput` - The output type for the `getCategorySuggestions` function, which provides a list of category suggestions.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorySuggestionsInputSchema = z.object({
  transactionHistory: z
    .string()
    .describe(
      'A string containing the user transaction history. Each transaction includes description, amount, date and any existing category.'
    ),
  newTransactionDescription: z.string().describe('The description of the new transaction to categorize.'),
});
export type CategorySuggestionsInput = z.infer<typeof CategorySuggestionsInputSchema>;

const CategorySuggestionsOutputSchema = z.object({
  categorySuggestions: z
    .array(z.string())
    .describe('An array of suggested categories for the new transaction.'),
});
export type CategorySuggestionsOutput = z.infer<typeof CategorySuggestionsOutputSchema>;

export async function getCategorySuggestions(input: CategorySuggestionsInput): Promise<CategorySuggestionsOutput> {
  return categorySuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorySuggestionsPrompt',
  input: {schema: CategorySuggestionsInputSchema},
  output: {schema: CategorySuggestionsOutputSchema},
  prompt: `You are an AI assistant specializing in categorizing financial transactions.

  Based on the user's past transaction history, provide category suggestions for the new transaction description provided.

  Transaction History: {{{transactionHistory}}}
  New Transaction Description: {{{newTransactionDescription}}}

  Provide a maximum of 5 category suggestions.
  Ensure that the category suggestions are relevant to the transaction history and description.
  Return the suggestions as a JSON array of strings. Do not provide any explanations or introductory text.
  The output should be a JSON array of strings.
  `,
});

const categorySuggestionsFlow = ai.defineFlow(
  {
    name: 'categorySuggestionsFlow',
    inputSchema: CategorySuggestionsInputSchema,
    outputSchema: CategorySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
