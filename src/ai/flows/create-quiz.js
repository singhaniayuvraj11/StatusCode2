// src/ai/flows/create-quiz.js
'use server';
/**
 * @fileOverview A quiz creation AI agent.
 *
 * - createQuiz - A function that handles the quiz creation process.
 * - CreateQuizInput - The input type for the createQuiz function.
 * - CreateQuizOutput - The return type for the createQuiz function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- NEW: Added a dedicated schema for document input, mirroring the reference ---
const DocumentInputSchema = z.object({
  dataUri: z.string().describe("The document content as a data URI, including a MIME type and Base64 encoding. Format: 'data:<mimetype>;base64,<encoded_data>'."),
});

// --- MODIFIED: The main input schema now uses the nested DocumentInputSchema ---
const CreateQuizInputSchema = z.object({
  studyMaterials: z
    .string()
    .optional()
    .describe("The study materials as text to generate a quiz from."),
  document: DocumentInputSchema.optional()
    .describe("The document to generate the quiz from. This is the primary source if provided."),
  questionTypes: z
    .string()
    .describe("The types of questions to include in the quiz (e.g., multiple choice, true/false)."),
  difficultyLevel: z
    .string()
    .describe("The difficulty level of the quiz (e.g., easy, medium, hard)."),
  numberOfQuestions: z
    .number()
    .describe("The number of questions to generate for the quiz."),
});

const QuizQuestionSchema = z.object({
    question: z.string().describe('The question text.'),
    options: z.array(z.string()).describe('An array of possible answers. For true/false, this should be ["True", "False"].'),
    answer: z.string().describe('The correct answer from the options array.'),
    questionType: z.enum(['multiple-choice', 'true/false', 'short-answer']).describe('The type of question.'),
});

const CreateQuizOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema).describe("The array of generated quiz questions."),
});


export async function createQuiz(input) {
  return createQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createQuizPrompt',
  input: { schema: CreateQuizInputSchema },
  output: { schema: CreateQuizOutputSchema },
  // --- MODIFIED: The prompt now uses the robust {{media}} helper for documents ---
  prompt: `You are an expert quiz creator for students.

You will be given study materials either as text or as an uploaded document. You must use the content from these materials to generate a quiz with the specified question types, difficulty level, and number of questions.

{{#if document}}
Document: {{media url=document.dataUri}}
{{/if}}

{{#if studyMaterials}}
Content: {{{studyMaterials}}}
{{/if}}

Question Types: {{{questionTypes}}}
Difficulty Level: {{{difficultyLevel}}}
Number of Questions: {{{numberOfQuestions}}}

Generate a list of quiz questions, each with a question, a set of options, and the correct answer. For true/false questions, the options array must be ["True", "False"]. For multiple-choice, provide a few options. For short answer, the options array can be empty, and the answer field contains the ideal short answer.
`,  
});

const createQuizFlow = ai.defineFlow(
  {
    name: 'createQuizFlow',
    inputSchema: CreateQuizInputSchema,
    outputSchema: CreateQuizOutputSchema,
  },
  async (input) => {
    // This validation logic is correct and remains the same.
    if (!input.studyMaterials && !input.document) {
      throw new Error('Either text or a document must be provided.');
    }
    
    const { output } = await prompt(input);
    return output;
  }
);