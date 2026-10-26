import type { I18nKey } from "./i18n";

/**
 * In-app tour definitions.
 *
 * A step points at a `data-tour` anchor and carries two dictionary keys. Steps
 * whose anchor is not on the page are skipped at runtime, so the same tour works
 * for a first-time visitor (composer) and for a teacher who already has a map
 * (report), without branching in the component.
 */

export type TourId = "tool" | "report" | "landing";

export interface TourStep {
  /** Value of the `data-tour` attribute on the element to point at. */
  target: string;
  title: I18nKey;
  body: I18nKey;
}

export const TOURS: Record<TourId, TourStep[]> = {
  landing: [
    { target: "hero", title: "tourHeroTitle", body: "tourHeroBody" },
    { target: "hero-cta", title: "tourCtaTitle", body: "tourCtaBody" },
    { target: "nav", title: "tourNavTitle", body: "tourNavBody" },
  ],
  tool: [
    { target: "nav", title: "tourNavTitle", body: "tourNavBody" },
    { target: "question", title: "tourQuestionTitle", body: "tourQuestionBody" },
    { target: "answers", title: "tourAnswersTitle", body: "tourAnswersBody" },
    { target: "examples", title: "tourExamplesTitle", body: "tourExamplesBody" },
    { target: "settings-link", title: "tourSettingsTitle", body: "tourSettingsBody" },
  ],
  report: [
    { target: "map", title: "tourMapTitle", body: "tourMapBody" },
    { target: "detail", title: "tourEvidenceTitle", body: "tourEvidenceBody" },
    { target: "export", title: "tourExportTitle", body: "tourExportBody" },
    { target: "history", title: "tourHistoryTitle", body: "tourHistoryBody" },
  ],
};

/** Broadcast a tour request. Components anywhere can call this. */
export function startTour(tour: TourId): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<TourId>("faultlines:tour", { detail: tour }));
}
