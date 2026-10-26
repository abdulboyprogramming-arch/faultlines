/**
 * UI localisation. Seven locales with identical key sets (enforced by tests).
 * English is the source of truth; `t()` falls back to English for any missing
 * key. First visit auto-detects from `navigator.language`; the Settings page
 * lets teachers override. Arabic renders RTL (see `localeDir`).
 *
 * Analysis itself is language-agnostic: paste answers in any language.
 */
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
  upload: "Upload .txt / .csv",
  startHere: "Start here",
  inTheirWords: "In their own words (verbatim)",
  reteach: "Reteach",
  checkQuestion: "Check question",
  diagnostic: "Follow-up diagnostic",
  riskHigh: "High risk",
  riskMed: "Med risk",
  riskLow: "Low risk",
  loading: "Reading the strata…",
  playGame: "Play Strata Drop",
  gameTagline: "Catch solid understanding, dodge the fault cracks.",
  installTitle: "Install Fault Lines",
  installBody: "Use it like an app — example classrooms and the built-in analysis even work offline.",
  install: "Install",
  notNow: "Not now",
  theme: "Theme",
  textSize: "Text size",
  language: "Language",
};
export type I18nKey = keyof typeof en;
type Dict = Record<I18nKey, string>;

const fr: Dict = {
  ...en,
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
  upload: "Importer .txt / .csv",
  startHere: "Commencez ici",
  inTheirWords: "Dans leurs propres mots (textuel)",
  reteach: "Re-enseigner",
  checkQuestion: "Question de vérification",
  diagnostic: "Diagnostic de suivi",
  riskHigh: "Risque élevé",
  riskMed: "Risque moyen",
  riskLow: "Risque faible",
  loading: "Lecture des strates…",
  playGame: "Jouer à Strata Drop",
  gameTagline: "Attrapez la compréhension solide, évitez les fissures.",
  installTitle: "Installer Lignes de Faille",
  installBody: "Utilisez-le comme une application — les exemples et l'analyse intégrée fonctionnent même hors ligne.",
  install: "Installer",
  notNow: "Plus tard",
  theme: "Thème",
  textSize: "Taille du texte",
  language: "Langue",
};

const es: Dict = {
  ...en,
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
  upload: "Subir .txt / .csv",
  startHere: "Empiece aquí",
  inTheirWords: "En sus propias palabras (textual)",
  reteach: "Volver a enseñar",
  checkQuestion: "Pregunta de comprobación",
  diagnostic: "Diagnóstico de seguimiento",
  riskHigh: "Riesgo alto",
  riskMed: "Riesgo medio",
  riskLow: "Riesgo bajo",
  loading: "Leyendo los estratos…",
  playGame: "Jugar a Strata Drop",
  gameTagline: "Atrape la comprensión sólida, esquive las grietas.",
  installTitle: "Instalar Líneas de Falla",
  installBody: "Úselo como una app: los ejemplos y el análisis integrado funcionan incluso sin conexión.",
  install: "Instalar",
  notNow: "Ahora no",
  theme: "Tema",
  textSize: "Tamaño del texto",
  language: "Idioma",
};

const de: Dict = {
  ...en,
  title: "Bruchlinien",
  subtitle: "Sehen Sie, was Ihre Klasse wirklich missversteht. Für Lehrkräfte, die schriftliche Antworten korrigieren.",
  paste: "Fügen Sie die Antworten Ihrer Klasse zu einer Frage ein, eine pro Zeile. Namen zuerst entfernen.",
  questionLabel: "Frage an die Klasse (optional, verbessert die Gruppierung)",
  answersLabel: "Antworten der Klasse — eine pro Zeile",
  map: "Meine Klasse kartieren",
  example: "Beispielklasse laden",
  unsure: "Unsicher — bitte selbst prüfen",
  export: "Plan exportieren",
  share: "Link kopieren",
  recent: "Zuletzt (nur dieser Browser)",
  startOver: "Neu starten",
  reading: "Lese",
  answers: "Antworten",
  beliefs: "Vorstellungen",
  settings: "Einstellungen",
  home: "Start",
  copied: "Kopiert",
  clear: "Leeren",
  upload: ".txt / .csv hochladen",
  startHere: "Hier beginnen",
  inTheirWords: "In ihren eigenen Worten (wörtlich)",
  reteach: "Nachunterricht",
  checkQuestion: "Kontrollfrage",
  diagnostic: "Folgediagnose",
  riskHigh: "Hohes Risiko",
  riskMed: "Mittleres Risiko",
  riskLow: "Geringes Risiko",
  loading: "Lese die Schichten…",
  playGame: "Strata Drop spielen",
  gameTagline: "Fangen Sie solides Verständnis, weichen Sie den Rissen aus.",
  installTitle: "Bruchlinien installieren",
  installBody: "Wie eine App nutzen — Beispiele und die eingebaute Analyse funktionieren auch offline.",
  install: "Installieren",
  notNow: "Nicht jetzt",
  theme: "Design",
  textSize: "Textgröße",
  language: "Sprache",
};

const pt: Dict = {
  ...en,
  title: "Linhas de Falha",
  subtitle: "Veja o que a sua turma realmente não entende. Para professores que corrigem respostas escritas.",
  paste: "Cole as respostas da turma a uma pergunta, uma por linha. Remova os nomes primeiro.",
  questionLabel: "Pergunta feita à turma (opcional, melhora o agrupamento)",
  answersLabel: "Respostas da turma — uma por linha",
  map: "Mapear a minha turma",
  example: "Carregar turma de exemplo",
  unsure: "Não sei — precisa da sua revisão",
  export: "Exportar plano",
  share: "Copiar ligação partilhável",
  recent: "Recentes (apenas neste navegador)",
  startOver: "Recomeçar",
  reading: "A ler",
  answers: "respostas",
  beliefs: "crenças",
  settings: "Definições",
  home: "Início",
  copied: "Copiado",
  clear: "Limpar",
  upload: "Carregar .txt / .csv",
  startHere: "Comece aqui",
  inTheirWords: "Nas suas próprias palavras (literal)",
  reteach: "Reensinar",
  checkQuestion: "Pergunta de verificação",
  diagnostic: "Diagnóstico de acompanhamento",
  riskHigh: "Risco alto",
  riskMed: "Risco médio",
  riskLow: "Risco baixo",
  loading: "A ler os estratos…",
  playGame: "Jogar Strata Drop",
  gameTagline: "Apanhe a compreensão sólida, desvie-se das fissuras.",
  installTitle: "Instalar Linhas de Falha",
  installBody: "Use como uma app — os exemplos e a análise integrada funcionam mesmo offline.",
  install: "Instalar",
  notNow: "Agora não",
  theme: "Tema",
  textSize: "Tamanho do texto",
  language: "Idioma",
};

const yo: Dict = {
  ...en,
  title: "Àwọn Ìlà Àṣìṣe",
  subtitle: "Wo ohun tí kíláàsì rẹ̀ kò tíì yé ní tòótọ́. Fún àwọn olùkọ́ tí ń ṣe àtúnṣe ìdáhùn àkọlé.",
  paste: "Lẹ àwọn ìdáhùn kíláàsì rẹ̀ sí ìbéèrè kan, ẹ̀yọ kan lórí ìlà kan. Yọ orúkọ àwọn akẹ́kọ̀ọ́ kúrò ní àkọ́kọ́.",
  questionLabel: "Ìbéèrè tí kíláàsì dáhùn (àṣàyàn, ó ń mú ìpínsọ̀kan dára síi)",
  answersLabel: "Àwọn ìdáhùn kíláàsì — ẹ̀yọ kan lórí ìlà kan",
  map: "Ṣe àwòrán kíláàsì mi",
  example: "Gbé kíláàsì àpẹẹrẹ wọlé",
  unsure: "Kò dá mi lójú — ó nílò ojú rẹ",
  export: "Gbé ètò jáde",
  share: "Ṣe àdàkọ ìjápọ̀ pínpín",
  recent: "Àwọn àìpẹ́ (aṣàwákiri yìí nìkan)",
  startOver: "Bẹ̀rẹ̀ lẹ́ẹ̀kan síi",
  reading: "Ń ka",
  answers: "ìdáhùn",
  beliefs: "èrò inú",
  settings: "Ètò",
  home: "Ilé",
  copied: "A ti ṣe àdàkọ",
  clear: "Nu kúrò",
  upload: "Gbé .txt / .csv sókè",
  startHere: "Bẹ̀rẹ̀ níbí",
  inTheirWords: "Pẹ̀lú ọ̀rọ̀ ara wọn (gẹ́gẹ́ bí wọ́n ṣe kọ)",
  reteach: "Kọ́ lẹ́ẹ̀kan síi",
  checkQuestion: "Ìbéèrè àyẹ̀wò",
  diagnostic: "Ìbéèrè àtẹ̀lé àyẹ̀wò",
  riskHigh: "Ewu ńlá",
  riskMed: "Ewu àárín",
  riskLow: "Ewu díẹ̀",
  loading: "Ń ka àwọn ìpele-àpáta…",
  playGame: "Ṣeré Strata Drop",
  gameTagline: "Mú ìmọ̀ tó lágbára, yẹra fún àwọn ìfọ́ àpáta.",
  installTitle: "Fi Àwọn Ìlà Àṣìṣe sílẹ̀",
  installBody: "Lò ó bíi app — àwọn àpẹẹrẹ àti ìtúpalẹ̀ inú rẹ̀ ń ṣiṣẹ́ kódà láìsí intanẹẹti.",
  install: "Fi sílẹ̀",
  notNow: "Kì í ṣe báyìí",
  theme: "Àwòrán ojú",
  textSize: "Ìtóbi ọ̀rọ̀",
  language: "Èdè",
};

const ar: Dict = {
  ...en,
  title: "خطوط الصدع",
  subtitle: "اعرف ما الذي لا يفهمه طلابك فعلًا. للمعلمين الذين يصححون إجابات مكتوبة.",
  paste: "الصق إجابات فصلك عن سؤال واحد، إجابة في كل سطر. أزل أسماء الطلاب أولًا.",
  questionLabel: "السؤال الذي أجاب عنه الفصل (اختياري، يحسّن التجميع)",
  answersLabel: "إجابات الفصل — واحدة في كل سطر",
  map: "ارسم خريطة فصلي",
  example: "تحميل فصل تجريبي",
  unsure: "غير مؤكد — يحتاج إلى نظرك",
  export: "تصدير الخطة",
  share: "نسخ رابط المشاركة",
  recent: "الأخيرة (هذا المتصفح فقط)",
  startOver: "البدء من جديد",
  reading: "جارٍ قراءة",
  answers: "إجابة",
  beliefs: "معتقدات",
  settings: "الإعدادات",
  home: "الرئيسية",
  copied: "تم النسخ",
  clear: "مسح",
  upload: "رفع .txt / .csv",
  startHere: "ابدأ من هنا",
  inTheirWords: "بكلماتهم الخاصة (حرفيًا)",
  reteach: "إعادة الشرح",
  checkQuestion: "سؤال التحقق",
  diagnostic: "تشخيص المتابعة",
  riskHigh: "خطر عالٍ",
  riskMed: "خطر متوسط",
  riskLow: "خطر منخفض",
  loading: "جارٍ قراءة الطبقات…",
  playGame: "العب Strata Drop",
  gameTagline: "التقط الفهم الراسخ وتجنب شقوق الصدع.",
  installTitle: "تثبيت خطوط الصدع",
  installBody: "استخدمه كتطبيق — الأمثلة والتحليل المدمج يعملان حتى دون اتصال.",
  install: "تثبيت",
  notNow: "ليس الآن",
  theme: "المظهر",
  textSize: "حجم النص",
  language: "اللغة",
};

export const locales = { en, fr, es, de, pt, yo, ar } as const;
export type Locale = keyof typeof locales;
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English", fr: "Français", es: "Español", de: "Deutsch", pt: "Português", yo: "Yorùbá", ar: "العربية",
};

const RTL: Locale[] = ["ar"];
export function localeDir(l: Locale): "ltr" | "rtl" {
  return RTL.includes(l) ? "rtl" : "ltr";
}

export function detectLocale(): Locale {
  try {
    if (typeof localStorage !== "undefined") {
      const stored = localStorage.getItem("faultlines-locale");
      if (stored && stored in locales) return stored as Locale;
    }
  } catch { /* storage blocked (private mode) — fall through to detection */ }
  if (typeof navigator !== "undefined") {
    const lang = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (lang in locales) return lang as Locale;
  }
  return "en";
}

export function getLocale(): Locale {
  return detectLocale();
}

/** Broadcast so mounted components can re-render without a full page reload. */
export const LOCALE_EVENT = "faultlines:locale";

export function setLocale(l: Locale) {
  try {
    localStorage.setItem("faultlines-locale", l);
  } catch {
    /* storage blocked — still apply for this session */
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = l;
    document.documentElement.dir = localeDir(l);
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<Locale>(LOCALE_EVENT, { detail: l }));
  }
}

/** Translate for an explicit locale — the hydration-safe path used by `useT()`. */
export function tFor(locale: Locale, key: I18nKey): string {
  return locales[locale]?.[key] ?? en[key];
}

export function t(key: I18nKey): string {
  return locales[getLocale()][key] ?? en[key];
}
