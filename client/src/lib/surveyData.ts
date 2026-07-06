// ─── HMG Triage Survey Data ───
// HMG Takhassusi Hospital — Emergency Department
// Survey ID: HMG/QID/1397

export const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbwM0TyzEoUW3PjYEAPqG9xumS7GSGs3wmOop8sMIXH2IqK1GVVrgxLwOjmao500PEg/exec";

export const HMG_LOGO_URL = "/manus-storage/hmg-logo_4945d2a6.png";

// ─── Types ───────────────────────────────────────────────────────────────────

export type Lang = "en" | "ar";
export type Part = "A" | "B" | null;

export interface Option {
  value: string;
  en: string;
  ar: string;
  emoji?: string;
}

export interface Question {
  id: string;
  en: string;
  ar: string;
  hint?: { en: string; ar: string };
  type: "radio" | "scale" | "text" | "textarea";
  options?: Option[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: { en: string; ar: string };
  scaleMaxLabel?: { en: string; ar: string };
  twoCol?: boolean;     // render options in 2-column grid
  minLength?: number;   // for text/textarea validation
}

export interface Section {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string;
  subtitleAr?: string;
  icon: string;
  color?: string;       // accent color for section header
  questions: Question[];
}

// ─── Step 0: Role & Background ───────────────────────────────────────────────

export const EXPERIENCE_OPTIONS: Option[] = [
  { value: "lt1",  en: "Less than 1 year", ar: "أقل من سنة" },
  { value: "1-3",  en: "1–3 years",        ar: "١–٣ سنوات" },
  { value: "4-7",  en: "4–7 years",        ar: "٤–٧ سنوات" },
  { value: "8+",   en: "8+ years",         ar: "٨+ سنوات" },
];

// ─── Part A: Triage Nurses ────────────────────────────────────────────────────
// sec-A1 → sec-A2 → sec-A3

export const PART_A_SECTIONS: Section[] = [
  // ── Section A1: Last Shift ──────────────────────────────────────────────────
  {
    id: "sec-A1",
    titleEn: "The Last Shift",
    titleAr: "آخر نوبة عمل",
    subtitleEn: "Answer based on what ACTUALLY happened",
    subtitleAr: "أجب بناءً على ما حدث فعلاً",
    icon: "⏱",
    color: "#0FA89B",
    questions: [
      {
        id: "q3",
        en: "During your last busy shift, how long did it take from patient arrival to CTAS assignment?",
        ar: "خلال آخر نوبة مزدحمة، كم استغرق الفرز من وصول المريض حتى تحديد مستوى CTAS؟",
        type: "radio",
        options: [
          { value: "under2", en: "Under 2 minutes",     ar: "أقل من دقيقتين",    emoji: "✅" },
          { value: "2-5",    en: "2–5 minutes",         ar: "٢–٥ دقائق",         emoji: "🟡" },
          { value: "5-10",   en: "5–10 minutes",        ar: "٥–١٠ دقائق",        emoji: "🟠" },
          { value: "10+",    en: "More than 10 minutes", ar: "أكثر من ١٠ دقائق", emoji: "🔴" },
        ],
      },
      {
        id: "q4",
        en: "What made triage hardest that shift? (Pick ONE)",
        ar: "ما الذي جعل الفرز أصعب في تلك النوبة؟ (اختر واحداً)",
        type: "radio",
        twoCol: true,
        options: [
          { value: "volume",   en: "Too many patients at once",  ar: "عدد كبير من المرضى",       emoji: "👥" },
          { value: "language", en: "Language barrier",           ar: "حاجز لغوي",                emoji: "🗣️" },
          { value: "ctas",     en: "Uncertainty about CTAS level", ar: "عدم التأكد من المستوى", emoji: "❓" },
          { value: "noref",    en: "No reference tool",          ar: "لا يوجد مرجع",             emoji: "📋" },
          { value: "docs",     en: "Documentation burden",       ar: "عبء التوثيق",              emoji: "📝" },
          { value: "other",    en: "Other",                      ar: "أخرى",                     emoji: "🔵" },
        ],
      },
      {
        id: "q5",
        en: "In the last month, how many times did you feel unsure about a CTAS level?",
        ar: "خلال الشهر الماضي، كم مرة شعرت بعدم اليقين حول مستوى CTAS؟",
        type: "radio",
        options: [
          { value: "never", en: "Never",          ar: "أبداً",       emoji: "🟢" },
          { value: "1-2",   en: "1–2 times",      ar: "١–٢ مرة",     emoji: "🟡" },
          { value: "3-5",   en: "3–5 times",      ar: "٣–٥ مرات",    emoji: "🟠" },
          { value: "5+",    en: "More than 5",    ar: "أكثر من ٥",   emoji: "🔴" },
        ],
      },
      {
        id: "q6",
        en: "When unsure — what did you ACTUALLY do?",
        ar: "عندما كنت غير متأكد — ماذا فعلت فعلاً؟",
        type: "radio",
        hint: {
          en: "Answer based on real behavior, not what you wish you did",
          ar: "أجب بناءً على السلوك الحقيقي، لا ما تتمنى أنك فعلته",
        },
        options: [
          { value: "colleague", en: "Asked a colleague",              ar: "استشرت زميلاً",           emoji: "🤝" },
          { value: "judgment",  en: "Used my best judgment",          ar: "اعتمدت على حكمي",         emoji: "🧠" },
          { value: "lookup",    en: "Looked something up",            ar: "بحثت في مرجع",            emoji: "🔍" },
          { value: "safer",     en: "Assigned a safer (higher) level", ar: "اخترت مستوى أعلى للسلامة", emoji: "⬆️" },
          { value: "movedon",   en: "Moved on and hoped for best",    ar: "تابعت وأملت في الأفضل",   emoji: "⏩" },
        ],
      },
    ],
  },

  // ── Section A2: Workaround & Tools ─────────────────────────────────────────
  {
    id: "sec-A2",
    titleEn: "Workaround & Tools",
    titleAr: "الحلول والأدوات",
    subtitleEn: "How you currently cope with triage challenges",
    subtitleAr: "كيف تتعامل حالياً مع تحديات الفرز",
    icon: "🛠",
    color: "#6B4FBB",
    questions: [
      {
        id: "q7",
        en: "What do you currently use to help with CTAS decisions?",
        ar: "ما الذي تستخدمه حالياً للمساعدة في قرارات CTAS؟",
        type: "radio",
        options: [
          { value: "memory",    en: "My memory / training",  ar: "ذاكرتي / تدريبي",        emoji: "🧠" },
          { value: "paper",     en: "Paper reference card",  ar: "بطاقة مرجعية ورقية",     emoji: "📄" },
          { value: "colleague2",en: "Ask a colleague",       ar: "أسأل زميلاً",             emoji: "🤝" },
          { value: "app",       en: "A mobile app",          ar: "تطبيق جوال",              emoji: "📱" },
          { value: "nothing",   en: "Nothing — I just decide", ar: "لا شيء — أقرر مباشرة", emoji: "⚡" },
        ],
      },
      {
        id: "q8",
        en: "How confident are you in your CTAS decisions on a typical shift?",
        ar: "ما مدى ثقتك بقرارات CTAS في نوبة عمل عادية؟",
        type: "scale",
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: { en: "Not confident", ar: "غير واثق" },
        scaleMaxLabel: { en: "Very confident", ar: "واثق جداً" },
      },
      {
        id: "q9",
        en: "Describe a situation where a decision-support tool would have helped you most.",
        ar: "صف موقفاً كانت فيه أداة دعم القرار ستساعدك أكثر.",
        type: "textarea",
        hint: {
          en: "At least 10 characters — be specific",
          ar: "١٠ أحرف على الأقل — كن محدداً",
        },
        minLength: 10,
      },
    ],
  },

  // ── Section A3: Tools & System ──────────────────────────────────────────────
  {
    id: "sec-A3",
    titleEn: "Tools & System",
    titleAr: "الأدوات والنظام",
    subtitleEn: "Your preferences and satisfaction",
    subtitleAr: "تفضيلاتك ومستوى رضاك",
    icon: "💬",
    color: "#E8A020",
    questions: [
      {
        id: "q10",
        en: "What format would you prefer for a triage support tool?",
        ar: "ما الشكل المفضل لأداة دعم الفرز؟",
        type: "radio",
        twoCol: true,
        options: [
          { value: "mobile",  en: "Mobile app",              ar: "تطبيق جوال",              emoji: "📱" },
          { value: "screen",  en: "Screen at triage station", ar: "شاشة عند محطة الفرز",    emoji: "🖥" },
          { value: "voice",   en: "Voice assistant",          ar: "مساعد صوتي",              emoji: "🎙" },
          { value: "badge",   en: "Wearable / badge device",  ar: "جهاز يُلبس / شارة",      emoji: "📟" },
        ],
      },
      {
        id: "q11",
        en: "Do you receive feedback on your triage decisions?",
        ar: "هل تتلقى تغذية راجعة على قرارات الفرز؟",
        type: "radio",
        options: [
          { value: "regularly", en: "Yes, regularly", ar: "نعم، بانتظام", emoji: "✅" },
          { value: "sometimes", en: "Sometimes",      ar: "أحياناً",       emoji: "🟡" },
          { value: "rarely",    en: "Rarely",         ar: "نادراً",        emoji: "🟠" },
          { value: "never2",    en: "Never",          ar: "أبداً",         emoji: "🔴" },
        ],
      },
      {
        id: "q12",
        en: "How satisfied are you with the current triage process at HMG?",
        ar: "ما مدى رضاك عن عملية الفرز الحالية في HMG؟",
        type: "scale",
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: { en: "Very dissatisfied", ar: "غير راضٍ جداً" },
        scaleMaxLabel: { en: "Very satisfied",    ar: "راضٍ جداً" },
      },
      {
        id: "q13",
        en: "What single change would most improve triage quality?",
        ar: "ما التغيير الواحد الذي سيحسّن جودة الفرز أكثر؟",
        type: "radio",
        options: [
          { value: "training",  en: "More training",        ar: "مزيد من التدريب",       emoji: "📚" },
          { value: "staff",     en: "More staff",           ar: "مزيد من الكوادر",       emoji: "👥" },
          { value: "tool2",     en: "Better decision tool", ar: "أداة قرار أفضل",        emoji: "🛠" },
          { value: "protocol",  en: "Clearer protocols",    ar: "بروتوكولات أوضح",       emoji: "📋" },
          { value: "space",     en: "Better physical space", ar: "مكان أفضل",            emoji: "🏥" },
        ],
      },
    ],
  },
];

// ─── Part B: Physicians / Charge Nurses / Managers ───────────────────────────
// sec-B1 → sec-B2

export const PART_B_SECTIONS: Section[] = [
  // ── Section B1: Trust & Impact ──────────────────────────────────────────────
  {
    id: "sec-B1",
    titleEn: "Trust & Impact",
    titleAr: "الثقة والأثر",
    subtitleEn: "Your perspective on triage quality",
    subtitleAr: "منظورك حول جودة الفرز",
    icon: "📊",
    color: "#0FA89B",
    questions: [
      {
        id: "qb3",
        en: "How often do you see patients who were mis-triaged?",
        ar: "كم مرة ترى مرضى تم فرزهم بشكل خاطئ؟",
        type: "radio",
        options: [
          { value: "daily",    en: "Daily",   ar: "يومياً",   emoji: "🔴" },
          { value: "weekly",   en: "Weekly",  ar: "أسبوعياً", emoji: "🟠" },
          { value: "monthly",  en: "Monthly", ar: "شهرياً",   emoji: "🟡" },
          { value: "rarely2",  en: "Rarely",  ar: "نادراً",   emoji: "🟢" },
        ],
      },
      {
        id: "qb4",
        en: "What is the most common consequence of mis-triage you observe?",
        ar: "ما أكثر عواقب الفرز الخاطئ شيوعاً التي تلاحظها؟",
        type: "radio",
        options: [
          { value: "delay",      en: "Delayed treatment",        ar: "تأخر العلاج",              emoji: "⏰" },
          { value: "overcrowd",  en: "Overcrowded waiting area", ar: "ازدحام منطقة الانتظار",    emoji: "👥" },
          { value: "escalation", en: "Unexpected escalation",    ar: "تصعيد غير متوقع",          emoji: "📈" },
          { value: "complaint",  en: "Patient complaint",        ar: "شكوى مريض",                emoji: "😤" },
          { value: "none",       en: "None observed",            ar: "لا شيء ملحوظ",             emoji: "✅" },
        ],
      },
      {
        id: "qb5",
        en: "How satisfied are you with the current triage system's accuracy?",
        ar: "ما مدى رضاك عن دقة نظام الفرز الحالي؟",
        type: "scale",
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: { en: "Very dissatisfied", ar: "غير راضٍ جداً" },
        scaleMaxLabel: { en: "Very satisfied",    ar: "راضٍ جداً" },
      },
      {
        id: "qb6",
        en: "Does the current triage process affect patient flow in your area?",
        ar: "هل تؤثر عملية الفرز الحالية على تدفق المرضى في منطقتك؟",
        type: "radio",
        options: [
          { value: "yes-major", en: "Yes, significantly", ar: "نعم، بشكل كبير",  emoji: "🔴" },
          { value: "yes-minor", en: "Yes, slightly",      ar: "نعم، بشكل طفيف",  emoji: "🟡" },
          { value: "no2",       en: "No impact",          ar: "لا تأثير",         emoji: "🟢" },
        ],
      },
    ],
  },

  // ── Section B2: Signal & Decision ──────────────────────────────────────────
  {
    id: "sec-B2",
    titleEn: "Signal & Decision",
    titleAr: "المؤشر والقرار",
    subtitleEn: "Your view on AI-assisted decision support",
    subtitleAr: "رأيك في دعم القرار بمساعدة الذكاء الاصطناعي",
    icon: "🤖",
    color: "#CC2229",
    questions: [
      {
        id: "qb7",
        en: "Would an AI-assisted triage tool benefit your department?",
        ar: "هل ستفيد أداة فرز بمساعدة الذكاء الاصطناعي قسمك؟",
        type: "radio",
        options: [
          { value: "yes2",   en: "Yes, strongly agree",     ar: "نعم، أوافق بشدة",           emoji: "✅" },
          { value: "maybe2", en: "Possibly",                ar: "ربما",                       emoji: "🤔" },
          { value: "no3",    en: "No",                      ar: "لا",                         emoji: "❌" },
          { value: "unsure", en: "Need more information",   ar: "أحتاج مزيداً من المعلومات", emoji: "ℹ️" },
        ],
      },
      {
        id: "qb8",
        en: "What is your biggest concern about AI-assisted triage?",
        ar: "ما أكبر مخاوفك من الفرز بمساعدة الذكاء الاصطناعي؟",
        type: "radio",
        options: [
          { value: "accuracy2",  en: "Accuracy / reliability",      ar: "الدقة / الموثوقية",          emoji: "🎯" },
          { value: "liability",  en: "Legal liability",              ar: "المسؤولية القانونية",        emoji: "⚖️" },
          { value: "adoption",   en: "Staff resistance to change",   ar: "مقاومة الموظفين للتغيير",   emoji: "🚧" },
          { value: "cost",       en: "Cost / budget",                ar: "التكلفة / الميزانية",        emoji: "💰" },
          { value: "noconcern",  en: "No major concerns",            ar: "لا مخاوف كبيرة",            emoji: "✅" },
        ],
      },
      {
        id: "qb9",
        en: "How likely are you to support adoption of an AI triage tool in your department?",
        ar: "ما احتمال دعمك لاعتماد أداة فرز بالذكاء الاصطناعي في قسمك؟",
        type: "scale",
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: { en: "Very unlikely", ar: "غير محتمل جداً" },
        scaleMaxLabel: { en: "Very likely",   ar: "محتمل جداً" },
      },
    ],
  },
];

// ─── Validation rules per section ────────────────────────────────────────────

export const VALIDATION_RULES: Record<string, { id: string; type: "role" | "radio" | "scale" | "text" | "textarea"; minLength?: number }[]> = {
  "sec-0": [
    { id: "q1", type: "role" },
    { id: "q2", type: "radio" },
  ],
  "sec-A1": [
    { id: "q3", type: "radio" },
    { id: "q4", type: "radio" },
    { id: "q5", type: "radio" },
    { id: "q6", type: "radio" },
  ],
  "sec-A2": [
    { id: "q7",  type: "radio" },
    { id: "q8",  type: "scale" },
    { id: "q9",  type: "textarea", minLength: 10 },
  ],
  "sec-A3": [
    { id: "q12", type: "scale" },
  ],
  "sec-B1": [
    { id: "qb3", type: "radio" },
    { id: "qb4", type: "radio" },
    { id: "qb5", type: "scale" },
    { id: "qb6", type: "radio" },
  ],
  "sec-B2": [
    { id: "qb7", type: "radio" },
    { id: "qb8", type: "radio" },
    { id: "qb9", type: "scale" },
  ],
};

// ─── Flow per role ────────────────────────────────────────────────────────────

export const FLOW_A = ["sec-0", "sec-A1", "sec-A2", "sec-A3"];
export const FLOW_B = ["sec-0", "sec-B1", "sec-B2"];
