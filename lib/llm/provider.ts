import type { AnalysisResult } from "../schema";

export interface AnalyzeOptions {
  /** The question the class was answering, if the teacher provided one. */
  question?: string;
}

export interface LLMProvider {
  analyze(answers: string[], opts?: AnalyzeOptions): Promise<AnalysisResult>;
}
