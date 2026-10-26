import type { AnalysisResult } from "../schema";

export interface AnalyzeOptions {
  /** The question the class was answering, if the teacher provided one. */
  question?: string;
  /**
   * Language for the *prose* the engine writes — belief names, why-it-matters,
   * reteach cards and diagnostics. Student quotes are never touched, and the
   * `plain_name`/`label` fields are the only model-authored text a teacher reads.
   */
  locale?: string;
}

export interface LLMProvider {
  analyze(answers: string[], opts?: AnalyzeOptions): Promise<AnalysisResult>;
}
