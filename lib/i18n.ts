export const locales = {
  en: {
    title: "Fault Lines",
    subtitle: "See what your class actually misunderstands. For teachers marking written answers.",
    paste: "Paste your class's answers to one question, one per line. Remove student names first.",
    map: "Map my class",
    example: "Load example classroom",
    unsure: "Not sure — needs your eyes",
    export: "Export plan",
    share: "Copy shareable link",
    recent: "Recent (local only)",
    startOver: "Start over",
    reading: "Reading",
    answers: "answers",
  },
  fr: {
    title: "Lignes de Faille",
    subtitle: "Voyez ce que votre classe ne comprend pas vraiment.",
    paste: "Collez les réponses de votre classe à une question, une par ligne. Retirez les noms.",
    map: "Cartographier ma classe",
    example: "Charger une classe exemple",
    unsure: "Pas sûr — à vérifier",
    export: "Exporter le plan",
    share: "Copier le lien",
    recent: "Récents (local)",
    startOver: "Recommencer",
    reading: "Lecture de",
    answers: "réponses",
  },
};

export type Locale = keyof typeof locales;
export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  return (localStorage.getItem("faultlines-locale") as Locale) || "en";
}
export function setLocale(l: Locale) {
  localStorage.setItem("faultlines-locale", l);
  location.reload();
}
export function t(key: keyof (typeof locales)["en"]): string {
  const l = getLocale();
  return (locales[l] as any)[key] || (locales.en as any)[key];
}
