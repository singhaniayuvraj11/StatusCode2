'use server';

/**
 * @fileOverview A document summarization AI agent with customization options.
 *
 * - summarizeDocument - A function that handles the document summarization process.
 * - SummarizeDocumentInput - The input type for the summarizeDocument function.
 * - SummarizeDocumentOutput - The return type for the summarizeDocument function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const DocumentInputSchema = z.object({
  dataUri: z.string().describe(
    "The document content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});

const SummarizeDocumentInputSchema = z.object({
  documentText: z.string().optional().describe('The text content of the document to summarize.'),
  document: DocumentInputSchema.optional().describe('The document to summarize.'),
  detailLevel: z.enum(['short', 'medium', 'detailed']).optional()
    .describe("The level of detail in the summary. Options: short, medium, detailed."),
  customLength: z.string().optional()
    .describe("Custom length request, e.g. '100 words', '5 bullet points', '1 page'."),
  tone: z.enum(['academic', 'simplified', 'business', 'bullet']).optional()
    .describe("Tone or style of the summary."),
});

const SummarizeDocumentOutputSchema = z.object({
  summary: z.string().describe('A summary of the document according to requested settings.'),
});

export async function summarizeDocument(input) {
  return summarizeDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeDocumentPrompt',
  input: { schema: SummarizeDocumentInputSchema },
  output: { schema: SummarizeDocumentOutputSchema },
  prompt: `You are an expert summarizer. Summarize the provided content with the following customization:

  {{#if detailLevel}}
  Detail level: {{detailLevel}}
  {{/if}}

  {{#if customLength}}
  Custom length: {{customLength}}
  {{/if}}

  {{#if tone}}
  Tone/Style: {{tone}}
  {{/if}}

  {{#if document}}
  Document: {{media url=document.dataUri}}
  {{/if}}

  {{#if documentText}}
  Content: {{{documentText}}}
  {{/if}}

  Provide the final output as plain text.
  `,
});

const summarizeDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeDocumentFlow',
    inputSchema: SummarizeDocumentInputSchema,
    outputSchema: SummarizeDocumentOutputSchema,
  },
  async input => {
    if (!input.documentText && !input.document) {
      throw new Error('Either text or a document must be provided.');
    }
    const { output } = await prompt(input);
    return output;
  }
);
