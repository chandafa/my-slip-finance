'use server';

/**
 * @fileOverview Defines a Genkit flow for generating smart insights and alerts based on user's financial data.
 *
 * @exports aiSmartAlerts - An async function that takes transaction history and returns a concise alert message.
 * @exports AiSmartAlertsInput - The input type for the aiSmartAlerts function.
 * @exports AiSmartAlertsOutput - The output type for the aiSmartAlerts function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Define the input schema for the smart alerts flow.
const AiSmartAlertsInputSchema = z.object({
  transactionHistory: z.string().describe('A JSON string of the user’s recent transaction history.'),
  userContext: z.string().optional().describe('Optional context about the user, like their budget or financial goals.'),
});
export type AiSmartAlertsInput = z.infer<typeof AiSmartAlertsInputSchema>;

// Define the output schema for the smart alerts flow.
const AiSmartAlertsOutputSchema = z.object({
  alert: z.string().optional().describe('A single, concise, and actionable alert message. Examples: "Peringatan Anggaran: Anda sudah menggunakan 90% dari anggaran \'Makan & Minum\' bulan ini." or "Deteksi Pengeluaran Tak Biasa: Pengeluaran Anda untuk \'Belanja Online\' minggu ini 50% lebih tinggi dari rata-rata." or "Ringkasan Mingguan: Total Pemasukan minggu ini Rp X, Total Pengeluaran Rp Y."'),
});
export type AiSmartAlertsOutput = z.infer<typeof AiSmartAlertsOutputSchema>;


/**
 * Asynchronously generates a smart alert based on the provided transaction history.
 *
 * @param {AiSmartAlertsInput} input - The input data containing transaction history.
 * @returns {Promise<AiSmartAlertsOutput>} A promise that resolves to an object containing a potential alert message.
 */
export async function aiSmartAlerts(input: AiSmartAlertsInput): Promise<AiSmartAlertsOutput> {
  return aiSmartAlertsFlow(input);
}


// Define the prompt for generating smart alerts.
const aiSmartAlertsPrompt = ai.definePrompt({
  name: 'aiSmartAlertsPrompt',
  input: { schema: AiSmartAlertsInputSchema },
  output: { schema: AiSmartAlertsOutputSchema },
  prompt: `You are a proactive financial assistant. Your task is to analyze the user's transaction history and generate a SINGLE, short, and impactful alert if you find something noteworthy.

Here are the types of alerts you can generate:
1.  **Budget Alert**: Warn the user if their spending in a category is close to or exceeding a typical budget (e.g., "Anda sudah menggunakan 90% dari anggaran 'Makan & Minum' bulan ini.").
2.  **Unusual Spending Detection**: Notify the user about spending that is significantly higher than their average (e.g., "Pengeluaran Anda untuk 'Belanja Online' minggu ini 50% lebih tinggi dari rata-rata.").
3.  **Weekly Summary**: Provide a brief summary of their financial activity at the end of a week (e.g., "Berikut ringkasan keuanganmu minggu ini: Total Pemasukan Rp X, Total Pengeluaran Rp Y.").

**IMPORTANT RULES:**
-   Only generate an alert if there is a truly significant insight. It is okay to return an empty alert.
-   The alert MUST be concise and easy to read.
-   The alert MUST be in Bahasa Indonesia.
-   Do not generate an alert every time. Be selective.

Analyze the following data:
-   **Transaction History**: {{{transactionHistory}}}
-   **User Context**: {{{userContext}}}

Generate an alert message if applicable.`,
});

// Define the Genkit flow for generating smart alerts.
const aiSmartAlertsFlow = ai.defineFlow(
  {
    name: 'aiSmartAlertsFlow',
    inputSchema: AiSmartAlertsInputSchema,
    outputSchema: AiSmartAlertsOutputSchema,
  },
  async input => {
    // Add a random factor to reduce the frequency of alerts
    if (Math.random() > 0.4) { // 60% chance to skip analysis
      return { alert: undefined };
    }

    try {
      JSON.parse(input.transactionHistory);
    } catch (e) {
      // Don't throw an error, just return no alert
      return { alert: undefined };
    }

    const { output } = await aiSmartAlertsPrompt(input);
    return output!;
  }
);
