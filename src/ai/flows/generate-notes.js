'use server';
/**
 * @fileOverview Generates notes from document or text input using AI summarization and keyword extraction.
 *
 * - generateNotes - A function that generates notes from input text or a document.
 * - GenerateNotesInput - The input type for the generateNotes function.
 * - GenerateNotesOutput - The return type for the generateNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DocumentInputSchema = z.object({
  dataUri: z.string().describe("The document content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const GenerateNotesInputSchema = z.object({
  text: z.string().optional().describe('The text content to generate notes from.'),
  document: DocumentInputSchema.optional().describe('The document to generate notes from.'),
});

const GenerateNotesOutputSchema = z.object({
  bullets: z.string().describe('Concise notes in bullet-point format.'),
  summary: z.string().describe('A smooth-flowing paragraph summary of the content.'),
  table: z.array(z.object({
    topic: z.string().describe('The main topic or concept.'),
    keyPoints: z.string().describe('The key points related to the topic.'),
    examples: z.string().describe('Examples illustrating the topic.'),
  })).describe('A tabular representation of the notes with columns for topic, key points, and examples.'),
  qna: z.array(z.object({
    question: z.string().describe('A viva-style question.'),
    answer: z.string().describe('The answer to the question.'),
  })).describe('A list of question-answer pairs.'),
});


export async function generateNotes(input) {
  return generateNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: {
    schema: z.object({
      document: DocumentInputSchema.optional(),
      text: z.string().optional(),
    }),
  },
  output: {schema: GenerateNotesOutputSchema},
  prompt: `You are an AI assistant designed to generate comprehensive study notes from lectures and study material in multiple formats.

  Create informative notes from the following content. Generate the notes in all of the following formats:
  1.  **Concise Bullets:** Key concepts and important points in a bulleted list.
  2.  **Paragraph Summary:** A well-structured, smooth-flowing summary of the entire content.
  3.  **Tabular Format:** A table with three columns: "Topic", "Key Points", and "Examples".
  4.  **Question-Answer Style:** Short, viva-style questions with their corresponding answers.

  {{#if document}}
  Document: {{media url=document.dataUri}}
  {{/if}}
  
  {{#if text}}
  Content: {{{text}}}
  {{/if}}
  `,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async (input) => {
    if (!input.text && !input.document) {
      throw new Error('Either text or a document must be provided.');
    }

    const {output} = await prompt(input);
    return output;
  }
);
