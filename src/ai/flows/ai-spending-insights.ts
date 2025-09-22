'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating AI-powered spending insights based on user transaction history.
 *
 * - `generateSpendingInsights` - A function that orchestrates the process of analyzing transaction data and generating insights.
 * - `SpendingInsightsInput` - The input type for the `generateSpendingInsights` function, including transaction history and user preferences.
 * - `SpendingInsightsOutput` - The output type for the `generateSpendingInsights` function, providing a structured format for the generated insights.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpendingInsightsInputSchema = z.object({
  transactionHistory: z.string().describe('A stringified JSON array of the user\u2019s transaction history. Each transaction should include details like date, amount, category, and description.'),
  userPreferences: z.string().optional().describe('Optional user preferences or goals related to their spending habits, provided as a JSON string.'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the user\u2019s spending patterns.'),
  keyInsights: z.array(z.string()).describe('An array of key insights derived from the transaction history, highlighting significant spending trends or anomalies.'),
  suggestions: z.array(z.string()).describe('An array of personalized suggestions for improving the user\u2019s financial habits based on the analysis.'),
  projectedSavings: z.string().optional().describe('A projection of potential savings if the user follows the suggestions.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function generateSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const spendingInsightsPrompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {
    schema: SpendingInsightsInputSchema,
  },
  output: {
    schema: SpendingInsightsOutputSchema,
  },
  prompt: `You are an AI-powered financial advisor. Analyze the user's transaction history and provide personalized spending insights and suggestions.

Transaction History: {{{transactionHistory}}}

User Preferences: {{{userPreferences}}}

Provide a summary of their spending patterns, key insights based on their spending trends, and personalized suggestions for improving their financial habits. Also, include a projection of potential savings if they follow the suggestions.

Ensure the output is well-structured and easy to understand.

Summary:
Key Insights:
Suggestions:
Projected Savings: `,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    try {
      // Validate that transactionHistory is valid JSON
      JSON.parse(input.transactionHistory);
    } catch (e) {
      throw new Error("Invalid JSON format for transactionHistory");
    }

    const { output } = await spendingInsightsPrompt(input);
    return output!;
  }
);
