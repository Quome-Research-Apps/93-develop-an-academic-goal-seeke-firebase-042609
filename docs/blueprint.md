# **App Name**: GradeAchiever

## Core Features:

- Course Category Input: UI to input course categories (e.g., Homework, Midterm). Each category includes fields for 'Weight (%)' and 'Score (%)'.
- Final Exam Weight: Input field for the weight (%) of the final exam.
- Desired Grade Input: Input field for the desired final grade (%) in the course.
- Weight Validation: Validate that the sum of all category weights (including the final exam) equals 100%. Display an error message if not.
- Calculation Engine: Calculate the required final exam score using the formula: `RequiredScore = (DesiredGrade - CurrentWeightedScore) / FinalExamWeight`.
- Impossible Grade Detector: A tool that scans input variables for edge case parameters. The tool recognizes when user settings have made the desired grade mathematically impossible to achieve. In such case, the tool provides an understandable message to the user instead of providing a calculated result.
- Result Display: Display the calculated required score in a clear sentence (e.g., 'You need to score at least an 88.5% on the Final Exam to get a 90% in the course.').

## Style Guidelines:

- Primary color: Deep sky blue (#64B5F6), evokes a sense of calm and intellectual focus.
- Background color: Light blue (#E3F2FD), very lightly saturated to avoid distracting from the main content.
- Accent color: Cyan (#4DD0E1), provides visual contrast and highlights important elements.
- Font: 'Inter', sans-serif, for a clean and modern look.
- Clean, single-column layout with clearly defined sections for input and results.
- Subtle transitions when calculating and displaying results.