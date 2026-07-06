/**
 * SurveyPage — HMG Takhassusi Hospital Emergency Department
 * Triage Quality & Decision Support Survey — HMG/QID/1397
 * Design: HMG Navy #0B2545 · Teal #0FA89B · Red #CC2229
 * Flow-based navigation: sec-0 → sec-A1/A2/A3 or sec-B1/B2
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  WEBHOOK_URL,
  HMG_LOGO_URL,
  EXPERIENCE_OPTIONS,
  PART_A_SECTIONS,
  PART_B_SECTIONS,
  VALIDATION_RULES,
  FLOW_A,
  FLOW_B,
  type Lang,
  type Part,
  type Question,
  type Option,
  type Section,
} from "@/lib/surveyData";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NAVY = "#0B2545";
const TEAL = "#0FA89B";
const RED  = "#CC2229";

function tx(obj: { en: string; ar: string } | undefined, lang: Lang): string {
  if (!obj) return "";
  return lang === "ar" ? obj.ar : obj.en;
}

// ─── RadioOption ──────────────────────────────────────────────────────────────

function RadioOption({
  opt, name, checked, onChange, lang,
}: {
  opt: Option; name: string; checked: boolean; onChange: () => void; lang: Lang;
}) {
  return (
    <label
      onClick={onChange}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 select-none ${
        checked
          ? "border-teal-500 bg-teal-50 shadow-sm"
          : "border-gray-200 bg-white hover:border-teal-400 hover:bg-teal-50/40"
      }`}
    >
      <input
        type="radio" name={name} value={opt.value} checked={checked}
        onChange={onChange}
        className="w-4 h-4 flex-shrink-0 cursor-pointer"
        style={{ accentColor: TEAL }}
      />
      {opt.emoji && <span className="text-base flex-shrink-0">{opt.emoji}</span>}
      <span className="text-sm text-gray-800 flex-1 leading-snug">
        {lang === "ar" ? opt.ar : opt.en}
      </span>
    </label>
  );
}

// ─── ScaleQuestion ────────────────────────────────────────────────────────────

function ScaleQuestion({
  q, value, onChange, lang,
}: {
  q: Question; value: string; onChange: (v: string) => void; lang: Lang;
}) {
  const emojis = ["😞", "😕", "😐", "🙂", "😄"];
  const min = q.scaleMin ?? 1;
  const max = q.scaleMax ?? 5;
  const steps = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs text-gray-400 mb-2 px-0.5">
        <span>{tx(q.scaleMinLabel, lang)}</span>
        <span>{tx(q.scaleMaxLabel, lang)}</span>
      </div>
      <div className="flex gap-2">
        {steps.map((n) => {
          const sel = value === String(n);
          return (
            <label
              key={n}
              onClick={() => onChange(String(n))}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 ${
                sel
                  ? "border-teal-500 bg-teal-500 text-white shadow-md scale-105"
                  : "border-gray-200 text-gray-400 hover:border-teal-400 hover:bg-teal-50"
              }`}
            >
              <input type="radio" name={q.id} value={String(n)} checked={sel}
                onChange={() => onChange(String(n))} className="hidden" />
              <span className="text-lg">{emojis[n - min] ?? n}</span>
              <span className="text-xs font-bold">{n}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({
  q, qi, lang, answers, errors, setAnswer, accentColor,
}: {
  q: Question; qi: number; lang: Lang;
  answers: Record<string, string>; errors: Record<string, boolean>;
  setAnswer: (id: string, val: string) => void; accentColor: string;
}) {
  const hasError = errors[q.id];
  return (
    <div className={`bg-white rounded-2xl border p-5 transition-all duration-200 focus-within:shadow-md ${
      hasError ? "border-red-300 bg-red-50/20" : "border-gray-100 focus-within:border-teal-300"
    }`}>
      {/* Question head */}
      <div className="flex items-start gap-2.5 mb-4">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5"
          style={{ background: accentColor }}
        >
          {qi + 1}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold leading-snug" style={{ color: NAVY }}>
            {lang === "ar" ? q.ar : q.en}
            <span className="text-red-500 ml-1">*</span>
          </p>
          {lang === "en" && q.ar && (
            <p className="text-xs text-gray-400 mt-1 text-right leading-relaxed">{q.ar}</p>
          )}
          {q.hint && (
            <div className="mt-2 text-[11px] text-gray-500 px-3 py-2 rounded-lg leading-snug border-l-2"
              style={{ background: "#EEF2F6", borderLeftColor: TEAL }}>
              {tx(q.hint, lang)}
            </div>
          )}
        </div>
      </div>

      {/* Answer input */}
      {q.type === "radio" && q.options && (
        <div className={`grid gap-2 ${q.twoCol ? "grid-cols-2" : "grid-cols-1"}`}>
          {q.options.map((opt) => (
            <RadioOption
              key={opt.value} opt={opt} name={q.id}
              checked={answers[q.id] === opt.value}
              onChange={() => setAnswer(q.id, opt.value)}
              lang={lang}
            />
          ))}
        </div>
      )}

      {q.type === "scale" && (
        <ScaleQuestion q={q} value={answers[q.id] ?? ""} onChange={(v) => setAnswer(q.id, v)} lang={lang} />
      )}

      {q.type === "textarea" && (
        <textarea
          name={q.id} value={answers[q.id] ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Write your answer here..."}
          rows={4}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 resize-y outline-none transition-all duration-200 focus:border-teal-400 focus:shadow-sm bg-gray-50 focus:bg-white leading-relaxed"
          style={{ minHeight: 100 }}
        />
      )}

      {q.type === "text" && (
        <input
          type="text" name={q.id} value={answers[q.id] ?? ""}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          placeholder={lang === "ar" ? "اكتب إجابتك هنا..." : "Write your answer here..."}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none transition-all duration-200 focus:border-teal-400 focus:shadow-sm bg-gray-50 focus:bg-white"
        />
      )}

      {hasError && (
        <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
          <span>⚠</span>
          {lang === "ar" ? "هذا الحقل مطلوب" : "This field is required"}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [lang, setLang]       = useState<Lang>("en");
  const [part, setPart]       = useState<Part>(null);
  const [secIdx, setSecIdx]   = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [errors, setErrors]   = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  // ── Flow ──────────────────────────────────────────────────────────────────
  const flow = part === "A" ? FLOW_A : part === "B" ? FLOW_B : ["sec-0"];
  const curSec = flow[secIdx];
  const totalSteps = flow.length;
  const pct = totalSteps <= 1 ? 0 : Math.round((secIdx / (totalSteps - 1)) * 100);

  const allSections: Section[] = [...PART_A_SECTIONS, ...PART_B_SECTIONS];
  const sectionData = allSections.find((s) => s.id === curSec);

  const sectionLabel: Record<string, { en: string; ar: string }> = {
    "sec-0":  { en: "Role",       ar: "الدور" },
    "sec-A1": { en: "Last Shift", ar: "آخر نوبة" },
    "sec-A2": { en: "Workaround", ar: "الحلول" },
    "sec-A3": { en: "Tools",      ar: "الأدوات" },
    "sec-B1": { en: "Trust",      ar: "الثقة" },
    "sec-B2": { en: "Signal",     ar: "المؤشر" },
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [secIdx, submitted]);

  // ── State helpers ─────────────────────────────────────────────────────────
  function setAnswer(id: string, val: string) {
    setAnswers((prev) => ({ ...prev, [id]: val }));
    setErrors((prev) => ({ ...prev, [id]: false }));
  }

  function selectRole(p: Part) {
    setPart(p);
    setAnswer("q1", p === "A" ? "nurse" : "receiver");
    setErrors((prev) => ({ ...prev, q1: false }));
  }

  // ── Validation ────────────────────────────────────────────────────────────
  function validate(): boolean {
    const rules = VALIDATION_RULES[curSec] ?? [];
    const newErrors: Record<string, boolean> = {};
    let ok = true;

    for (const rule of rules) {
      let valid = false;
      if (rule.type === "role") {
        valid = part !== null;
      } else if (rule.type === "radio" || rule.type === "scale") {
        valid = !!answers[rule.id];
      } else if (rule.type === "text" || rule.type === "textarea") {
        valid = (answers[rule.id] ?? "").trim().length >= (rule.minLength ?? 1);
      }
      if (!valid) { newErrors[rule.id] = true; ok = false; }
    }
    setErrors(newErrors);
    return ok;
  }

  function goNext() {
    if (!validate()) return;
    if (secIdx < flow.length - 1) {
      setSecIdx((i) => i + 1);
    }
  }

  function goBack() {
    if (secIdx > 0) setSecIdx((i) => i - 1);
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  function handleSubmit() {
    if (!validate()) return;
    const data: Record<string, string> = {
      timestamp: new Date().toISOString(),
      part: part ?? "",
      ...answers,
    };
    try {
      const all = JSON.parse(localStorage.getItem("hmg_triage_r") ?? "[]");
      all.push(data);
      localStorage.setItem("hmg_triage_r", JSON.stringify(all));
    } catch { /* ignore */ }
    if (WEBHOOK_URL) {
      const qs = Object.entries(data)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? "")}`)
        .join("&");
      const url = `${WEBHOOK_URL}?${qs}`;
      new Image().src = url;
      fetch(url, { method: "GET", mode: "no-cors" }).catch(() => {});
    }
    setSubmitted(true);
  }

  // ─── Thank You ─────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F5F7F9]" ref={topRef}>
        <SurveyHeader lang={lang} setLang={setLang} />
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="text-center max-w-sm w-full bg-white rounded-3xl border border-gray-100 shadow-xl p-10"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
              style={{ background: "#E0F5F3" }}>✅</div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: NAVY }}>
              {lang === "ar" ? "شكراً لمشاركتك" : "Thank You"}
            </h2>
            <div className="w-8 h-0.5 mx-auto my-4 rounded" style={{ background: TEAL }} />
            <p className="text-sm text-gray-500 leading-relaxed">
              {lang === "ar"
                ? "تم تسجيل إجاباتك بنجاح. مساهمتك تساعد في تحسين جودة الفرز في قسم الطوارئ."
                : "Your responses have been recorded. Your input helps improve triage quality in the Emergency Department."}
            </p>
            <p className="text-xs text-gray-400 mt-6 font-mono">HMG / QID / 1397</p>
          </motion.div>
        </div>
        <SurveyFooter lang={lang} />
      </div>
    );
  }

  // ─── Progress Bar ──────────────────────────────────────────────────────────
  const progressBar = (
    <div className="sticky top-[57px] z-40 px-5 py-2" style={{ background: NAVY }}>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[10px] font-semibold tracking-wider text-white/50 uppercase">
          {tx(sectionLabel[curSec] ?? { en: "Survey", ar: "الاستطلاع" }, lang)}
        </span>
        <span className="text-[10px] font-bold" style={{ color: TEAL }}>{pct}%</span>
      </div>
      <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.12)" }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          style={{ background: `linear-gradient(to right, ${RED}, ${TEAL})` }}
        />
      </div>
    </div>
  );

  // ─── Step 0: Role Selection ─────────────────────────────────────────────────
  if (curSec === "sec-0") {
    return (
      <div className="min-h-screen bg-[#F5F7F9] flex flex-col" ref={topRef}>
        <SurveyHeader lang={lang} setLang={setLang} />
        {progressBar}

        {/* Hero */}
        <div className="py-8 px-4" style={{ background: NAVY }}>
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-extrabold text-white mb-1">
              {lang === "ar" ? "استطلاع جودة الفرز" : "Triage Quality Survey"}
            </h1>
            <p className="text-sm text-white/60 mb-5">
              {lang === "ar"
                ? "مستشفى HMG التخصصي — قسم الطوارئ"
                : "HMG Takhassusi Hospital — Emergency Department"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: "🎯", en: "Purpose",   ar: "الهدف",    d: { en: "Improve triage tools", ar: "تطوير أدوات الفرز" } },
                { icon: "⏱",  en: "5–8 min",  ar: "٥–٨ دقائق", d: { en: "Role-tailored",       ar: "مخصص لدورك" } },
                { icon: "🔒", en: "Anonymous", ar: "مجهول",    d: { en: "No personal data",    ar: "لا بيانات شخصية" } },
                { icon: "🏥", en: "HMG ED",    ar: "طوارئ HMG", d: { en: "Staff only",          ar: "للكوادر فقط" } },
              ].map((c) => (
                <div key={c.en} className="rounded-xl p-3 space-y-1" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="text-lg">{c.icon}</div>
                  <div className="text-xs font-semibold text-white">{lang === "ar" ? c.ar : c.en}</div>
                  <div className="text-xs text-white/50">{tx(c.d, lang)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 space-y-4">
          {/* Q1 — Role */}
          <div className={`bg-white rounded-2xl border p-5 ${errors["q1"] ? "border-red-300" : "border-gray-100"}`}>
            <div className="flex items-start gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: NAVY }}>1</div>
              <p className="text-sm font-semibold leading-snug" style={{ color: NAVY }}>
                {lang === "ar" ? "ما دورك في قسم الطوارئ؟" : "What is your role in the Emergency Department?"}
                <span className="text-red-500 ml-1">*</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {([
                { p: "A" as Part, emoji: "🩺", en: "Triage Nurse", ar: "ممرض الفرز",
                  dEn: "I perform triage assessments", dAr: "أجري تقييمات الفرز",
                  badge: { en: "Part A · 11 questions", ar: "الجزء أ · ١١ سؤالاً" }, badgeColor: "#E0F5F3", badgeText: "#0C8C81" },
                { p: "B" as Part, emoji: "👨‍⚕️", en: "ED Physician / ED Nurse", ar: "طبيب طوارئ / ممرض طوارئ",
                  dEn: "I receive triaged patients", dAr: "أستقبل المرضى بعد الفرز",
                  badge: { en: "Part B · 7 questions", ar: "الجزء ب · ٧ أسئلة" }, badgeColor: "#FDF5E0", badgeText: "#8A6000" },
              ] as const).map((role) => (
                <div
                  key={role.p}
                  onClick={() => selectRole(role.p)}
                  className={`rounded-xl border-2 p-4 text-center cursor-pointer transition-all duration-200 ${
                    part === role.p
                      ? "border-[#0B2545] bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-teal-400 hover:-translate-y-0.5 hover:shadow-md"
                  }`}
                >
                  <div className="text-3xl mb-2">{role.emoji}</div>
                  <div className="text-sm font-bold mb-1" style={{ color: NAVY }}>
                    {lang === "ar" ? role.ar : role.en}
                  </div>
                  <div className="text-[11px] text-gray-400 mb-3 leading-snug">
                    {lang === "ar" ? role.dAr : role.dEn}
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: role.badgeColor, color: role.badgeText }}>
                    {tx(role.badge, lang)}
                  </span>
                </div>
              ))}
            </div>
            {errors["q1"] && (
              <p className="text-xs text-red-500 mt-2">
                {lang === "ar" ? "يرجى اختيار دورك" : "Please select your role"}
              </p>
            )}
          </div>

          {/* Q2 — Experience */}
          <div className={`bg-white rounded-2xl border p-5 ${errors["q2"] ? "border-red-300" : "border-gray-100"}`}>
            <div className="flex items-start gap-2.5 mb-4">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 mt-0.5"
                style={{ background: NAVY }}>2</div>
              <p className="text-sm font-semibold leading-snug" style={{ color: NAVY }}>
                {lang === "ar" ? "سنوات الخبرة في الطوارئ" : "Years of ED experience"}
                <span className="text-red-500 ml-1">*</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <RadioOption key={opt.value} opt={opt} name="q2"
                  checked={answers["q2"] === opt.value}
                  onChange={() => setAnswer("q2", opt.value)}
                  lang={lang} />
              ))}
            </div>
            {errors["q2"] && (
              <p className="text-xs text-red-500 mt-2">
                {lang === "ar" ? "مطلوب" : "Required"}
              </p>
            )}
          </div>

          {/* Nav */}
          <div className="flex justify-end pt-2">
            <button
              onClick={goNext}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #163660)` }}
            >
              {lang === "ar" ? "التالي ←" : "Next →"}
            </button>
          </div>
        </div>

        <SurveyFooter lang={lang} />
      </div>
    );
  }

  // ─── Section Steps ──────────────────────────────────────────────────────────
  if (!sectionData) return null;
  const isLastStep = secIdx === flow.length - 1;

  return (
    <div className="min-h-screen bg-[#F5F7F9] flex flex-col" ref={topRef}>
      <SurveyHeader lang={lang} setLang={setLang} />
      {progressBar}

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 pb-16">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: `${sectionData.color ?? TEAL}18` }}>
            {sectionData.icon}
          </div>
          <div>
            <h3 className="text-base font-bold leading-snug" style={{ color: NAVY }}>
              {lang === "ar" ? sectionData.titleAr : sectionData.titleEn}
            </h3>
            {sectionData.subtitleEn && (
              <p className="text-xs text-gray-400 mt-0.5">
                {lang === "ar" ? sectionData.subtitleAr : sectionData.subtitleEn}
              </p>
            )}
          </div>
        </div>

        {/* Questions */}
        <AnimatePresence mode="wait">
          <motion.div
            key={curSec}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="space-y-4"
          >
            {sectionData.questions.map((q, qi) => (
              <QuestionCard
                key={q.id} q={q} qi={qi} lang={lang}
                answers={answers} errors={errors}
                setAnswer={setAnswer}
                accentColor={sectionData.color ?? TEAL}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-5 border-t border-gray-100">
          <button
            onClick={goBack}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-500 border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200 active:scale-[0.97]"
          >
            {lang === "ar" ? "← رجوع" : "← Back"}
          </button>

          <span className="text-xs text-gray-400 font-semibold">
            {lang === "ar" ? `${secIdx + 1} / ${totalSteps}` : `Step ${secIdx + 1} of ${totalSteps}`}
          </span>

          {isLastStep ? (
            <button
              onClick={handleSubmit}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${RED}, #A01820)` }}
            >
              {lang === "ar" ? "إرسال ✓" : "Submit ✓"}
            </button>
          ) : (
            <button
              onClick={goNext}
              className="px-8 py-3.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl active:scale-[0.97]"
              style={{ background: `linear-gradient(135deg, ${NAVY}, #163660)` }}
            >
              {lang === "ar" ? "التالي ←" : "Next →"}
            </button>
          )}
        </div>
      </div>

      <SurveyFooter lang={lang} />
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function SurveyHeader({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <img src={HMG_LOGO_URL} alt="HMG Dr. Sulaiman Al Habib Medical Group" className="h-9 object-contain" />
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold" style={{ color: NAVY }}>Emergency Department · Riyadh</p>
            <p className="text-xs font-mono font-semibold" style={{ color: RED }}>HMG / QID / 1397</p>
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            {(["en", "ar"] as Lang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1.5 transition-colors ${
                  lang === l ? "text-white" : "text-gray-500 hover:bg-gray-50"
                }`}
                style={lang === l ? { background: NAVY } : {}}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function SurveyFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-gray-100 bg-white mt-auto">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-gray-400">
        <span className="font-semibold" style={{ color: NAVY }}>
          {lang === "ar" ? "مستشفى HMG التخصصي — قسم الطوارئ" : "HMG Takhassusi Hospital — Emergency Department"}
        </span>
        <span className="font-mono font-semibold" style={{ color: RED }}>HMG/QID/1397</span>
      </div>
    </footer>
  );
}
