import type { AnalysisResult } from "../schema";

export interface LLMProvider {
  analyze(answers: string[]): Promise<AnalysisResult>;
}
