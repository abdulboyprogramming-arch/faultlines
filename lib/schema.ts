import { z } from "zod";

/** Limits shared by client + server so both enforce the same contract. */
export const MAX_ANSWERS = 120;
export const MAX_ANSWER_CHARS = 2000;
export const MAX_QUESTION_CHARS = 300;

export const ClusterSchema = z.object({
  label: z.string().min(1).max(300),
  plain_name: z.string().min(1).max(120),
  count: z.number().int().positive(),
  risk: z.enum(["high", "med", "low"]),
  why_it_matters: z.string().min(1).max(600),
  quotes: z.array(z.string().min(1).max(MAX_ANSWER_CHARS)).min(1).max(3),
  reteach: z.object({
    title: z.string().min(1).max(160),
    minutes: z.number().int().positive().max(60),
    steps: z.array(z.string().min(1).max(400)).min(1).max(8),
    check_question: z.string().min(1).max(400),
  }),
  diagnostic_question: z.string().min(1).max(400),
});

export const UnsureSchema = z.object({
  answer: z.string(),
  why: z.string().min(1).max(300),
});

export const AnalysisMetaSchema = z
  .object({
    source: z.enum(["llm", "mock", "example"]),
    total: z.number().int().nonnegative(),
    generatedAt: z.string(),
    /** True when a real provider was requested but we fell back to the heuristic. */
    degraded: z.boolean().optional(),
  })
  .optional();

export const AnalysisResultSchema = z.object({
  clusters: z.array(ClusterSchema).max(30),
  unsure: z.array(UnsureSchema).max(MAX_ANSWERS),
  question: z.string().max(MAX_QUESTION_CHARS).optional(),
  meta: AnalysisMetaSchema,
});

/** Interface languages a report's prose can be written in. */
export const REPORT_LOCALES = ["en", "fr", "es", "de", "pt", "yo", "ar"] as const;
export type ReportLocale = (typeof REPORT_LOCALES)[number];

export const AnalyzeRequestSchema = z.object({
  answers: z.array(z.string().max(MAX_ANSWER_CHARS)).min(1).max(MAX_ANSWERS),
  question: z.string().max(MAX_QUESTION_CHARS).optional(),
  /** Optional: the language the report's prose should be written in. */
  locale: z.enum(REPORT_LOCALES).optional(),
});

export type Cluster = z.infer<typeof ClusterSchema>;
export type Unsure = z.infer<typeof UnsureSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type AnalyzeRequest = z.infer<typeof AnalyzeRequestSchema>;

/** Risk ordering used everywhere (high damage first, per PRD). */
export const RISK_ORDER: Record<Cluster["risk"], number> = { high: 0, med: 1, low: 2 };
