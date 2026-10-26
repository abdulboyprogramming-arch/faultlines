const en = {
  title: "Fault Lines",
  subtitle: "See what your class actually misunderstands. For teachers marking written answers.",
  paste: "Paste your class's answers to one question, one per line. Remove student names first.",
  questionLabel: "Question the class answered (optional, improves grouping)",
  answersLabel: "Class answers — one per line",
  map: "Map my class",
  example: "Load example classroom",
  unsure: "Not sure — needs your eyes",
  export: "Export plan",
  share: "Copy shareable link",
  recent: "Recent (this browser only)",
  startOver: "Start over",
  reading: "Reading",
  answers: "answers",
  beliefs: "beliefs",
  settings: "Settings",
  home: "Home",
  copied: "Copied",
  clear: "Clear",
};
export type I18nKey = keyof typeof en;

const fr: Record<I18nKey, string> = {
  title: "Lignes de Faille",
  subtitle: "Voyez ce que votre classe ne comprend pas vraiment. Pour les enseignants qui corrigent des réponses écrites.",
  paste: "Collez les réponses de votre classe à une question, une par ligne. Retirez les noms d'abord.",
  questionLabel: "Question posée à la classe (optionnel, améliore le regroupement)",
  answersLabel: "Réponses de la classe — une par ligne",
  map: "Cartographier ma classe",
  example: "Charger une classe exemple",
  unsure: "Pas sûr — à vérifier",
  export: "Exporter le plan",
  share: "Copier le lien à partager",
  recent: "Récents (ce navigateur uniquement)",
  startOver: "Recommencer",
  reading: "Lecture de",
  answers: "réponses",
  beliefs: "croyances",
  settings: "Réglages",
  home: "Accueil",
  copied: "Copié",
  clear: "Effacer",
};

const es: Record<I18nKey, string> = {
  title: "Líneas de Falla",
  subtitle: "Vea lo que su clase realmente no entiende. Para docentes que corrigen respuestas escritas.",
  paste: "Pegue las respuestas de su clase a una pregunta, una por línea. Quite los nombres primero.",
  questionLabel: "Pregunta que respondió la clase (opcional, mejora la agrupación)",
  answersLabel: "Respuestas de la clase — una por línea",
  map: "Mapear mi clase",
  example: "Cargar clase de ejemplo",
  unsure: "No seguro — necesita su revisión",
  export: "Exportar plan",
  share: "Copiar enlace para compartir",
  recent: "Recientes (solo este navegador)",
  startOver: "Empezar de nuevo",
  reading: "Leyendo",
  answers: "respuestas",
  beliefs: "creencias",
  settings: "Ajustes",
  home: "Inicio",
  copied: "Copiado",
  clear: "Borrar",
};

export const locales = { en, fr, es } as const;
export type Locale = keyof typeof locales;

export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("faultlines-locale");
  return stored === "fr" || stored === "es" ? stored : "en";
}
export function setLocale(l: Locale) {
  localStorage.setItem("faultlines-locale", l);
  location.reload();
}
export function t(key: I18nKey): string {
  return locales[getLocale()][key] ?? en[key];
}
