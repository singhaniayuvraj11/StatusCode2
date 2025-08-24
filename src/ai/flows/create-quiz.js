// src/ai/flows/create-quiz.js
'use server';
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// --- Schema ---
const DocumentInputSchema = z.object({
  dataUri: z.string().describe("The document content as a data URI."),
});

const CreateQuizInputSchema = z.object({
  studyMaterials: z.string().optional(),
  document: DocumentInputSchema.optional(),
  questionTypes: z.enum(['multiple-choice', 'true/false', 'mixed']).describe("Allowed values: 'multiple-choice', 'true/false', or 'mixed'."),
  difficultyLevel: z.string(),
  numberOfQuestions: z.number(),
});

const QuizQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  questionType: z.enum(['multiple-choice', 'true/false']),
});

const CreateQuizOutputSchema = z.object({
  quiz: z.array(QuizQuestionSchema),
});

export async function createQuiz(input) {
  return createQuizFlow(input);
}

// --- Prompt ---
const prompt = ai.definePrompt({
  name: 'createQuizPrompt',
  input: { schema: CreateQuizInputSchema },
  output: { schema: CreateQuizOutputSchema },
  prompt: `
You are an expert quiz creator for students.

You will be given study materials as text or document. Generate quiz questions with ONLY the specified types.

Rules:
- If questionTypes = "true/false": Generate only true/false questions. Each must have options ["True","False"] and one correct answer.
- If questionTypes = "multiple-choice": Generate only multiple-choice questions. Each must have 4-5 options, only one correct.
- If questionTypes = "mixed": Generate a mix of true/false and multiple-choice only. No short-answer questions allowed.

{{#if document}}
Document: {{media url=document.dataUri}}
{{/if}}

{{#if studyMaterials}}
Content: {{{studyMaterials}}}
{{/if}}

Question Types: {{{questionTypes}}}
Difficulty Level: {{{difficultyLevel}}}
Number of Questions: {{{numberOfQuestions}}}
`,
});

// --- Flow ---
const createQuizFlow = ai.defineFlow(
  {
    name: 'createQuizFlow',
    inputSchema: CreateQuizInputSchema,
    outputSchema: CreateQuizOutputSchema,
  },
  async (input) => {
    if (!input.studyMaterials && !input.document) {
      throw new Error('Either text or a document must be provided.');
    }
    const { output } = await prompt(input);
    return output;
  }
);
