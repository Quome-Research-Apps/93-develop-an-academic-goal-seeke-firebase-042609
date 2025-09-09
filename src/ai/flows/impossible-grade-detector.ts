'use server';

/**
 * @fileOverview Determines if a desired grade is impossible to achieve based on current scores and weighting.
 *
 * - impossibleGradeDetector - A function that checks if the desired grade is impossible.
 * - ImpossibleGradeDetectorInput - The input type for the impossibleGradeDetector function.
 * - ImpossibleGradeDetectorOutput - The return type for the impossibleGradeDetector function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImpossibleGradeDetectorInputSchema = z.object({
  currentWeightedScore: z
    .number()
    .describe('The student\'s current weighted score in the course (0-100).'),
  finalExamWeight: z
    .number()
    .describe('The weight of the final exam as a percentage (0-100).'),
  desiredGrade: z
    .number()
    .describe('The student\'s desired final grade in the course (0-100).'),
});
export type ImpossibleGradeDetectorInput = z.infer<
  typeof ImpossibleGradeDetectorInputSchema
>;

const ImpossibleGradeDetectorOutputSchema = z.object({
  isImpossible: z
    .boolean()
    .describe(
      'Whether the desired grade is impossible to achieve given the current weighted score and final exam weight.'
    ),
  message: z
    .string()
    .describe(
      'A message explaining why the grade is impossible, or an empty string if the grade is possible.'
    ),
});
export type ImpossibleGradeDetectorOutput = z.infer<
  typeof ImpossibleGradeDetectorOutputSchema
>;

export async function impossibleGradeDetector(
  input: ImpossibleGradeDetectorInput
): Promise<ImpossibleGradeDetectorOutput> {
  return impossibleGradeDetectorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'impossibleGradeDetectorPrompt',
  input: {schema: ImpossibleGradeDetectorInputSchema},
  output: {schema: ImpossibleGradeDetectorOutputSchema},
  prompt: `You are a grade calculation expert. Your job is to determine whether a student's desired grade is impossible to achieve, given their current weighted score, the final exam weight, and the desired grade.

Here are the details:

Current Weighted Score: {{currentWeightedScore}}%
Final Exam Weight: {{finalExamWeight}}%
Desired Grade: {{desiredGrade}}%

First, determine if the desired grade is mathematically impossible. A grade is impossible if the current weighted score is already higher than the desired grade AND the final exam weight is not zero, or if achieving 100% on the final exam would still not reach the desired grade.

Based on your determination, set the \"isImpossible\" field to true or false.
If the grade is impossible to achieve, generate a helpful message explaining why in the \"message\" field. Be concise and direct. If the grade is possible, the message should be empty.

Example Impossible Cases:
* Current Weighted Score: 95%, Final Exam Weight: 10%, Desired Grade: 90% (already above desired, and final can\'t lower it)
* Current Weighted Score: 60%, Final Exam Weight: 20%, Desired Grade: 90% (even 100% on the final isn\'t enough)

Example Possible Cases:
* Current Weighted Score: 70%, Final Exam Weight: 30%, Desired Grade: 90%
* Current Weighted Score: 85%, Final Exam Weight: 15%, Desired Grade: 88%
`,
});

const impossibleGradeDetectorFlow = ai.defineFlow(
  {
    name: 'impossibleGradeDetectorFlow',
    inputSchema: ImpossibleGradeDetectorInputSchema,
    outputSchema: ImpossibleGradeDetectorOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
