import type { AnalysisResult } from "@/lib/schema";
import seasonsAnswers from "./example-answers.json";
import seasonsResult from "./example-result.json";
import fractionsAnswers from "./example-fractions-answers.json";
import fractionsResult from "./example-fractions-result.json";
import photoAnswers from "./example-photosynthesis-answers.json";
import photoResult from "./example-photosynthesis-result.json";
import ww1Answers from "./example-ww1-answers.json";
import ww1Result from "./example-ww1-result.json";

export interface ExampleClassroom {
  id: string;
  name: string;
  subject: string;
  question: string;
  answers: string[];
  result: AnalysisResult;
}

/** Cached example classrooms (zero network, the demo safety net from the PRD). */
export const EXAMPLES: ExampleClassroom[] = [
  {
    id: "seasons",
    name: "Why do we have seasons?",
    subject: "Science · Earth & space",
    question: "Why do we have seasons?",
    answers: (seasonsAnswers as { answers: string[] }).answers,
    result: {
      ...(seasonsResult as unknown as AnalysisResult),
      question: "Why do we have seasons?",
      meta: { source: "example", total: 28, generatedAt: "2026-10-26T00:00:00.000Z" },
    },
  },
  {
    id: "fractions",
    name: "Adding fractions (½ + ⅓)",
    subject: "Maths · Fractions",
    question: (fractionsAnswers as { question: string }).question,
    answers: (fractionsAnswers as { answers: string[] }).answers,
    result: fractionsResult as unknown as AnalysisResult,
  },
  {
    id: "photosynthesis",
    name: "Where does a tree's mass come from?",
    subject: "Science · Photosynthesis",
    question: (photoAnswers as { question: string }).question,
    answers: (photoAnswers as { answers: string[] }).answers,
    result: photoResult as unknown as AnalysisResult,
  },
  {
    id: "ww1",
    name: "What caused the First World War?",
    subject: "History · Causation",
    question: (ww1Answers as { question: string }).question,
    answers: (ww1Answers as { answers: string[] }).answers,
    result: ww1Result as unknown as AnalysisResult,
  },
];
