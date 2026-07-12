// ─── HMG Triage Survey Data ───
// HMG Takhassusi Hospital — Emergency Department
// Survey ID: HMG/QID/1397

export const WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbwM0TyzEoUW3PjYEAPqG9xumS7GSGs3wmOop8sMIXH2IqK1GVVrgxLwOjmao500PEg/exec";

export const HMG_LOGO_URL = `${import.meta.env.BASE_URL}hmg-logo.jpg`;

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
  type: "radio" | "scale" | "text" | "textarea" | "checkbox";
  options?: Option[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: { en: string; ar: string };
  scaleMaxLabel?: { en: string; ar: string };
  twoCol?: boolean;
  maxSelect?: number;  // for checkbox: maximum selections allowed     // render options in 2-column grid
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

// ─── Part A: Triage Nurses (a1–a13) ──────────────────────────────────────────

export const PART_A_SECTIONS: Section[] = [
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
        id: "a1",
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
        id: "a2",
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
        id: "a3",
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
        id: "a4",
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
      {
        id: "a5",
        en: "Think of the last time you were unsure and had to assign a level anyway — what happened next?",
        ar: "فكر في آخر مرة كنت فيها غير متأكد واضطررت لتحديد المستوى على أي حال — ماذا حدث بعد ذلك؟",
        type: "radio",
        options: [
          { value: "nothing",   en: "Nothing — it turned out fine",      ar: "لا شيء — سارت الأمور جيداً",   emoji: "🟢" },
          { value: "retriaged", en: "Patient was re-triaged later",      ar: "أعيد فرز المريض لاحقاً",       emoji: "🔁" },
          { value: "delay",     en: "There was a delay in care",         ar: "حدث تأخير في الرعاية",          emoji: "⏳" },
          { value: "corrected", en: "A colleague corrected the level",   ar: "صحح زميل المستوى",              emoji: "🧑‍⚕️" },
          { value: "complaint", en: "Patient/family complaint",          ar: "شكوى من المريض أو الأسرة",     emoji: "📣" },
          { value: "unknown",   en: "I don't know what happened",        ar: "لا أعرف ماذا حدث",              emoji: "❔" },
        ],
      },
    ],
  },
  {
    id: "sec-A2",
    titleEn: "Tools & Workarounds",
    titleAr: "الأدوات والحلول البديلة",
    subtitleEn: "How you currently cope with triage decisions",
    subtitleAr: "كيف تتعامل حالياً مع قرارات الفرز",
    icon: "🧰",
    color: "#6B46A1",
    questions: [
      {
        id: "a6",
        en: "What do you have available at the triage station? (Select all that apply)",
        ar: "ما الذي لديك في محطة الفرز؟ (اختر كل ما ينطبق)",
        type: "checkbox",
        options: [
          { value: "paper",     en: "Paper CTAS reference card",     ar: "بطاقة مرجعية ورقية",   emoji: "📋" },
          { value: "screen",    en: "Hospital protocol on screen",   ar: "بروتوكول على الشاشة",  emoji: "🖥️" },
          { value: "colleague", en: "Experienced colleague nearby",  ar: "زميل متمرس قريب",      emoji: "🧑‍⚕️" },
          { value: "phone",     en: "CTAS reference on my phone",    ar: "مرجع على الهاتف",      emoji: "📱" },
          { value: "nothing",   en: "Nothing structured",            ar: "لا شيء منظم",          emoji: "❌" },
        ],
      },
      {
        id: "a7",
        en: "Which do you ACTUALLY use during a busy shift? (Optional)",
        ar: "ما الذي تستخدمه فعلاً أثناء النوبة المزدحمة؟ (اختياري)",
        hint: {
          en: "Be honest — the gap between what exists and what gets used is exactly what we need to learn",
          ar: "كن صادقاً — الفجوة بين ما هو موجود وما يُستخدم فعلاً هي بالضبط ما نحتاج معرفته",
        },
        type: "checkbox",
        options: [
          { value: "paper",     en: "Paper CTAS reference card",     ar: "بطاقة مرجعية ورقية",   emoji: "📋" },
          { value: "screen",    en: "Hospital protocol on screen",   ar: "بروتوكول على الشاشة",  emoji: "🖥️" },
          { value: "colleague", en: "Experienced colleague nearby",  ar: "زميل متمرس قريب",      emoji: "🧑‍⚕️" },
          { value: "phone",     en: "CTAS reference on my phone",    ar: "مرجع على الهاتف",      emoji: "📱" },
          { value: "none",      en: "None of them",                  ar: "لا شيء منها",          emoji: "🚫" },
        ],
      },
      {
        id: "a8",
        en: "How confident are you in your CTAS decisions on a typical shift?",
        ar: "ما مدى ثقتك بقرارات CTAS في نوبة عمل عادية؟",
        type: "scale",
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: { en: "Not confident", ar: "غير واثق" },
        scaleMaxLabel: { en: "Very confident", ar: "واثق جداً" },
      },
      {
        id: "a9",
        en: "How satisfied are you with the current triage process at HMG?",
        ar: "ما مدى رضاك عن عملية الفرز الحالية في HMG؟",
        type: "scale",
        scaleMin: 1,
        scaleMax: 5,
        scaleMinLabel: { en: "Very dissatisfied", ar: "غير راضٍ جداً" },
        scaleMaxLabel: { en: "Very satisfied",    ar: "راضٍ جداً" },
      },
      {
        id: "a10",
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
    ],
  },
  {
    id: "sec-A3",
    titleEn: "Improvement & Your Story",
    titleAr: "التحسين وقصتك",
    subtitleEn: "Your experience in your own words",
    subtitleAr: "تجربتك بكلماتك",
    icon: "✍️",
    color: "#CC2229",
    questions: [
      {
        id: "a11",
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
      {
        id: "a12",
        en: "Tell us about a SPECIFIC PATIENT where triage felt genuinely difficult. What happened? What made it hard? What did you do?",
        ar: "أخبرنا عن حالة مريض محدد شعرت فيها أن الفرز كان صعباً فعلاً. ماذا حدث؟ ما الذي جعله صعباً؟ ماذا فعلت؟",
        hint: {
          en: "A real case, no names or file numbers — this is the most valuable answer in the survey",
          ar: "حالة حقيقية، بدون أسماء أو أرقام ملفات — هذه أهم إجابة في الاستبيان",
        },
        type: "textarea",
        minLength: 10,
      },
      {
        id: "a13",
        en: "Anything else you'd like to share about triage challenges? (Optional)",
        ar: "هل هناك شيء آخر تود مشاركته عن تحديات الفرز؟ (اختياري)",
        type: "textarea",
      },
    ],
  },
];

// ─── Part B: Receivers / Physicians (b1–b10) ─────────────────────────────────

export const PART_B_SECTIONS: Section[] = [
  {
    id: "sec-B1",
    titleEn: "What You Observe",
    titleAr: "ما تلاحظه",
    subtitleEn: "Frequency and real consequences of mis-triage",
    subtitleAr: "تكرار الفرز الخاطئ وعواقبه الفعلية",
    icon: "👁",
    color: "#CC2229",
    questions: [
      {
        id: "b1",
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
        id: "b2",
        en: "When a patient is mis-triaged, what are the most common consequences you observe? (Choose the TOP 2)",
        ar: "عندما يُفرز المريض بشكل خاطئ، ما أكثر العواقب التي تلاحظها؟ (اختر أهم اثنتين)",
        type: "checkbox",
        maxSelect: 2,
        options: [
          { value: "delay",      en: "Delayed treatment — waited longer than their true acuity required",            ar: "تأخر العلاج — انتظر المريض أطول مما تتطلبه حالته الفعلية",           emoji: "⏳" },
          { value: "overcrowd",  en: "Overcrowding — occupied a higher-acuity bed/area or joined the wrong queue",   ar: "الازدحام — شغل سريراً أو منطقة أعلى من حاجته أو أُضيف لقائمة خاطئة",  emoji: "🛏️" },
          { value: "escalation", en: "Escalation — deteriorated and required urgent upgrade of care",                ar: "تصعيد — تدهورت حالته واحتاج رفع مستوى الرعاية بشكل عاجل",             emoji: "🚨" },
          { value: "complaint",  en: "Complaint — formal or informal complaint about waiting or handling",           ar: "شكوى — شكوى رسمية أو غير رسمية بسبب الانتظار أو التعامل",             emoji: "📣" },
          { value: "safety",     en: "Safety incident — OVR/incident report filed, or a near-miss/harm occurred",    ar: "حادث سلامة — رُفع تقرير حادث (OVR) أو وقع ضرر أو حدث وشيك",           emoji: "⚠️" },
          { value: "none",       en: "None — I rarely observe meaningful consequences",                              ar: "لا شيء — نادراً ما ألاحظ عواقب مهمة",                                  emoji: "✅" },
        ],
      },
      {
        id: "b3",
        en: "Think of the most recent mis-triaged patient you received — what did it actually cost? (Select ALL that apply)",
        ar: "فكر في آخر مريض استلمته كان فرزه خاطئاً — ماذا كلّف فعلياً؟ (اختر كل ما ينطبق)",
        type: "checkbox",
        options: [
          { value: "time",    en: "Extra time",           ar: "وقت إضافي",           emoji: "⏱️" },
          { value: "workup",  en: "Repeated workup",      ar: "إعادة فحوصات",        emoji: "🔁" },
          { value: "bed",     en: "Bed misallocation",    ar: "سوء توزيع الأسرّة",   emoji: "🛏️" },
          { value: "harm",    en: "Harm or near-miss",    ar: "ضرر أو حدث وشيك",     emoji: "⚠️" },
          { value: "nothing", en: "Nothing significant",  ar: "لا شيء مهم",          emoji: "✅" },
        ],
      },
      {
        id: "b4",
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
  {
    id: "sec-B2",
    titleEn: "What You Actually Do",
    titleAr: "ما تفعله فعلاً",
    subtitleEn: "Behavior, not opinion",
    subtitleAr: "السلوك، لا الرأي",
    icon: "🩺",
    color: "#1A2B4A",
    questions: [
      {
        id: "b5",
        en: "How often do you independently re-assess a patient's CTAS level after receiving them?",
        ar: "كم مرة تعيد تقييم مستوى CTAS للمريض بشكل مستقل بعد استلامه؟",
        type: "radio",
        options: [
          { value: "always",    en: "Almost always",                    ar: "دائماً تقريباً",       emoji: "🔴" },
          { value: "often",     en: "Often",                            ar: "كثيراً",               emoji: "🟠" },
          { value: "sometimes", en: "Sometimes",                        ar: "أحياناً",              emoji: "🟡" },
          { value: "rarely",    en: "Rarely — I trust the triage level", ar: "نادراً — أثق بالمستوى", emoji: "🟢" },
        ],
      },
      {
        id: "b6",
        en: "Has a patient's CTAS level ever not matched what you found clinically?",
        ar: "هل حدث أن مستوى CTAS لم يتوافق مع ما وجدته سريرياً؟",
        type: "radio",
        options: [
          { value: "yes-reg",  en: "Yes, regularly",      ar: "نعم، بانتظام",     emoji: "🔴" },
          { value: "yes-many", en: "Yes, more than once", ar: "نعم، أكثر من مرة", emoji: "🟠" },
          { value: "yes-once", en: "Yes, once",           ar: "نعم، مرة",         emoji: "🟡" },
          { value: "no",       en: "No",                  ar: "لا",               emoji: "🟢" },
        ],
      },
      {
        id: "b7",
        en: "Tell us about a specific time the CTAS level didn't match what you found. What happened? (Optional — skip if it never happened)",
        ar: "أخبرنا عن وقت محدد لم يتوافق فيه مستوى CTAS مع ما وجدته. ماذا حدث؟ (اختياري — تجاوز إن لم يحدث)",
        type: "textarea",
      },
      {
        id: "b8",
        en: "When a triage level seems wrong — what do you typically do?",
        ar: "عندما يبدو مستوى الفرز غير صحيح — ماذا تفعل عادةً؟",
        type: "radio",
        options: [
          { value: "silent",   en: "Reassign silently",        ar: "أغير المستوى بصمت",    emoji: "🔇" },
          { value: "discuss",  en: "Discuss with triage nurse", ar: "أناقش مع ممرضة الفرز", emoji: "💬" },
          { value: "escalate", en: "Escalate to charge nurse",  ar: "أرفع الأمر للمشرف",    emoji: "📣" },
          { value: "accept",   en: "Accept and manage",         ar: "أقبل وأتعامل معه",     emoji: "✅" },
        ],
      },
      {
        id: "b9",
        en: "Do you ever give feedback to the triage nurse afterward?",
        ar: "هل تقدم ملاحظات لممرضة الفرز بعد ذلك؟",
        type: "radio",
        options: [
          { value: "regularly", en: "Regularly",  ar: "بانتظام", emoji: "🟢" },
          { value: "sometimes", en: "Sometimes",  ar: "أحياناً", emoji: "🟡" },
          { value: "rarely",    en: "Rarely",     ar: "نادراً",  emoji: "🟠" },
          { value: "never",     en: "Never",      ar: "أبداً",   emoji: "🔴" },
        ],
      },
      {
        id: "b10",
        en: "Anything else you'd like to share? (Optional)",
        ar: "هل هناك شيء آخر تود مشاركته؟ (اختياري)",
        type: "textarea",
      },
    ],
  },
];

// ─── Validation ───────────────────────────────────────────────────────────────

export const VALIDATION_RULES: Record<string, { id: string; type: "role" | "radio" | "scale" | "text" | "textarea" | "checkbox"; minLength?: number }[]> = {
  "sec-0": [
    { id: "q1", type: "role" },
    { id: "q2", type: "radio" },
  ],
  "sec-A1": [
    { id: "a1", type: "radio" },
    { id: "a2", type: "radio" },
    { id: "a3", type: "radio" },
    { id: "a4", type: "radio" },
    { id: "a5", type: "radio" },
  ],
  "sec-A2": [
    { id: "a6",  type: "checkbox" },
    { id: "a8",  type: "scale" },
    { id: "a9",  type: "scale" },
    { id: "a10", type: "radio" },
  ],
  "sec-A3": [
    { id: "a11", type: "radio" },
    { id: "a12", type: "textarea", minLength: 10 },
  ],
  "sec-B1": [
    { id: "b1", type: "radio" },
    { id: "b2", type: "checkbox" },
    { id: "b3", type: "checkbox" },
    { id: "b4", type: "radio" },
  ],
  "sec-B2": [
    { id: "b5", type: "radio" },
    { id: "b6", type: "radio" },
    { id: "b8", type: "radio" },
    { id: "b9", type: "radio" },
  ],
};

// ─── Flow per role ────────────────────────────────────────────────────────────

export const FLOW_A = ["sec-0", "sec-A1", "sec-A2", "sec-A3"];
export const FLOW_B = ["sec-0", "sec-B1", "sec-B2"];
