import GradeCalculator from '@/components/grade-calculator';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight text-[hsl(var(--primary))] sm:text-5xl">
            GradeAchiever
          </h1>
          <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
            Your personal 'what-if' tool for academic success.
          </p>
        </div>
        <GradeCalculator />
      </div>
    </main>
  );
}
