// src/ai/flows/create-quiz.js
'use server';
/**
 * @fileOverview A quiz creation AI agent.
 *
 * - createQuiz - A function that handles the quiz creation process.
 * - CreateQuizInput - The input type for the createQuiz function.
 * - CreateQuizOutput - The return type for the createQuiz function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateQuizInputSchema = z.object({
  studyMaterials: z
    .string()
    .describe("The study materials to generate a quiz from."),
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
  input: {schema: CreateQuizInputSchema},
  output: {schema: CreateQuizOutputSchema},
  prompt: `You are an expert quiz creator for students.

You will use the study materials to generate a quiz with the specified question types, difficulty level, and number of questions.

Study Materials: {{{studyMaterials}}}
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
  async input => {
    const {output} = await prompt(input);
    return output;
  }
);
