"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import {
  AlertCircle,
  Calculator,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
  Trophy,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { impossibleGradeDetector } from "@/ai/flows/impossible-grade-detector";

const categorySchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  weight: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .min(0, "Cannot be negative.")
    .max(100, "Cannot be over 100."),
  score: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .min(0, "Cannot be negative.")
    .max(100, "Cannot be over 100."),
});

const formSchema = z.object({
  categories: z
    .array(categorySchema)
    .min(1, "At least one category is required."),
  finalExamWeight: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .min(0, "Weight must be positive.")
    .max(100, "Cannot be over 100."),
  desiredGrade: z.coerce
    .number({ invalid_type_error: "Must be a number." })
    .min(0, "Cannot be negative.")
    .max(100, "Cannot be over 100."),
});

type ResultState = {
  type: "success" | "impossible" | "achieved";
  message: string;
};

export default function GradeCalculator() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResultState | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categories: [
        { name: "Homework", weight: 20, score: 95 },
        { name: "Midterm 1", weight: 25, score: 88 },
      ],
      finalExamWeight: 30,
      desiredGrade: 90,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "categories",
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);

    try {
      const totalWeight =
        values.categories.reduce((sum, cat) => sum + cat.weight, 0) +
        values.finalExamWeight;

      if (Math.abs(totalWeight - 100) > 0.01) {
        toast({
          variant: "destructive",
          title: "Invalid Weights",
          description: `The sum of all weights must be 100%. Current sum: ${totalWeight.toFixed(
            2
          )}%`,
        });
        return;
      }

      const currentWeightedScore = values.categories.reduce(
        (sum, cat) => sum + (cat.score / 100) * cat.weight,
        0
      );

      const aiResult = await impossibleGradeDetector({
        currentWeightedScore,
        finalExamWeight: values.finalExamWeight,
        desiredGrade: values.desiredGrade,
      });

      if (aiResult.isImpossible) {
        setResult({ type: "impossible", message: aiResult.message });
        return;
      }

      if (values.finalExamWeight === 0) {
        if (currentWeightedScore >= values.desiredGrade) {
            setResult({ type: "achieved", message: `With a final grade of ${currentWeightedScore.toFixed(1)}%, you have already achieved your goal!` });
        } else {
            setResult({ type: "impossible", message: `With a final exam weight of 0, it's impossible to change your current grade of ${currentWeightedScore.toFixed(1)}%.` });
        }
        return;
      }

      const requiredScore =
        ((values.desiredGrade - currentWeightedScore) / values.finalExamWeight) * 100;

      if (requiredScore > 100) {
        setResult({
          type: "impossible",
          message: `To achieve a ${values.desiredGrade}%, you would need to score ${requiredScore.toFixed(
            1
          )}% on the final exam, which is not possible.`,
        });
      } else if (requiredScore <= 0) {
        setResult({
          type: "achieved",
          message: `You've already secured your desired grade of ${values.desiredGrade}%! You can get a 0% on the final and still pass with your target.`,
        });
      } else {
        setResult({
          type: "success",
          message: `You need to score at least ${requiredScore.toFixed(
            1
          )}% on the Final Exam to get a ${values.desiredGrade}% in the course.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An Error Occurred",
        description:
          "There was a problem with the calculation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Grade Calculator</CardTitle>
          <CardDescription>
            Enter your current grades and course weights to find out what you
            need on the final exam.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Graded Categories</h3>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col sm:flex-row gap-2 items-start"
                    >
                      <FormField
                        control={form.control}
                        name={`categories.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-grow w-full sm:w-1/2">
                            <FormLabel className="sr-only">
                              Category Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Category Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2 w-full sm:w-1/2">
                        <FormField
                          control={form.control}
                          name={`categories.${index}.weight`}
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                              <FormLabel className="sr-only">Weight</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Weight (%)"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`categories.${index}.score`}
                          render={({ field }) => (
                            <FormItem className="flex-grow">
                              <FormLabel className="sr-only">Score</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="Score (%)"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0"
                        aria-label="Remove category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => append({ name: "", weight: 0, score: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Button>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Goal Seeking</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="finalExamWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Exam Weight (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="desiredGrade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Final Grade (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <CardFooter className="px-0 pb-0 pt-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="mr-2 h-4 w-4" />
                  )}
                  Calculate Required Score
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <Card className="mt-8 animate-in fade-in-50 duration-500">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              {result.type === 'success' && <CheckCircle2 className="w-12 h-12 text-green-500" />}
              {result.type === 'achieved' && <Trophy className="w-12 h-12 text-yellow-500" />}
              {result.type === 'impossible' && <AlertCircle className="w-12 h-12 text-red-500" />}
              <p className="text-lg font-medium">{result.message}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
