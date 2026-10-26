import { z } from "zod";

export const ClusterSchema = z.object({
  label: z.string(),
  plain_name: z.string(),
  count: z.number().int().nonnegative(),
  risk: z.enum(["high", "med", "low"]),
  why_it_matters: z.string(),
  quotes: z.array(z.string()).length(2),
  reteach: z.object({
    title: z.string(),
    minutes: z.number().int().positive(),
    steps: z.array(z.string()).min(1),
    check_question: z.string(),
  }),
  diagnostic_question: z.string(),
});

export const UnsureSchema = z.object({
  answer: z.string(),
  why: z.string(),
});

export const AnalysisResultSchema = z.object({
  clusters: z.array(ClusterSchema),
  unsure: z.array(UnsureSchema),
});

export type Cluster = z.infer<typeof ClusterSchema>;
export type Unsure = z.infer<typeof UnsureSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
