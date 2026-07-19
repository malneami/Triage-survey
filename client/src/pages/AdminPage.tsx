/**
 * AdminPage — /admin
 * Decision-Support Analytics Dashboard — HMG Triage Survey
 * Design: Clinical intelligence dashboard · HMG navy + red · Recharts
 * Features: Go/No-Go engine · Tabbed sections · PDF export · CSV export
 * HMG Takhassusi Hospital — Emergency Department · HMG/QID/1397
 */

import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { RESPONSES_SHEET_ID, RESPONSES_TAB, HMG_LOGO_URL, WEBHOOK_URL } from "@/lib/surveyData";

// ─── Config ───────────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = "HMG@Triage2025";

// ─── Brand Colors ─────────────────────────────────────────────────────────────

const C = {
  navy:   "#1A2B4A",
  red:    "#CC2229",
  teal:   "#2A9D8F",
  amber:  "#D4A017",
  green:  "#2E7D52",
  purple: "#6B46A1",
  slate:  "#64748B",
  bg:     "#F0F4F8",
  card:   "#FFFFFF",
  border: "#DDE3ED",
  navyLight: "#EEF1F7",
};

const PALETTE = [C.navy, C.teal, C.red, C.amber, C.green, C.purple, "#E07B39", "#5B8DB8"];
const SIGNAL_COLORS = { strong: C.green, moderate: C.amber, weak: C.red };

// ─── Types ────────────────────────────────────────────────────────────────────

interface SheetRow { [key: string]: string; }

interface Stats {
  total: number; partA: number; partB: number;
  timestamps: string[];
  experience: Record<string, number>;
  role: Record<string, number>;
  facility: Record<string, number>;
  // Part A — nurses
  a1: Record<string, number>; a2: Record<string, number>;
  a3: Record<string, number>; a4: Record<string, number>;
  a5: Record<string, number>;
  a6: Record<string, number>; a7: Record<string, number>;
  a8: number[]; a9: number[];
  a10: Record<string, number>; a11: Record<string, number>;
  a12: Record<string, number>; a13Comments: string[];
  // Part B — receivers
  b1: Record<string, number>; b2: Record<string, number>;
  b3: Record<string, number>; b4: Record<string, number>;
  b5: Record<string, number>; b6: Record<string, number>;
  b7: Record<string, number>; b8: Record<string, number>;
  b9: Record<string, number>; b10Comments: string[];
  b11: number[];
}

// ─── Label Maps ───────────────────────────────────────────────────────────────

const LABELS: Record<string, Record<string, string>> = {
  experience: { lt1: "< 1 year", "1-3": "1–3 yrs", "4-7": "4–7 yrs", "8+": "8+ yrs" },
  a1: { under2: "< 2 min", "2-5": "2–5 min", "5-10": "5–10 min", "10+": "> 10 min" },
  a2: { volume: "Patient volume", language: "Language barrier", ctas: "CTAS uncertainty", noref: "No reference tool", docs: "Documentation", other: "Other" },
  a3: { never: "Never", "1-2": "1–2×/month", "3-5": "3–5×/month", "5+": ">5×/month" },
  a4: { colleague: "Asked colleague", judgment: "Used judgment", lookup: "Looked it up", safer: "Assigned safer level", movedon: "Moved on" },
  a5: { nothing: "Nothing — fine", retriaged: "Re-triaged later", delay: "Delay in care", corrected: "Colleague corrected", complaint: "Complaint", unknown: "Unknown outcome" },
  a6: { paper: "Paper CTAS card", screen: "Protocol on screen", colleague: "Experienced colleague", phone: "Reference on phone", nothing: "Nothing structured" },
  a7: { paper: "Paper CTAS card", screen: "Protocol on screen", colleague: "Experienced colleague", phone: "Reference on phone", none: "None of them" },
  a10: { regularly: "Regularly", sometimes: "Sometimes", rarely: "Rarely", never2: "Never" },
  a11: { training: "More training", staff: "More staff", tool2: "Better tool", protocol: "Clearer protocols", space: "Better space" },
  facility: { olaya: "Olaya Medical Complex", rayan: "Al Rayan Hospital", suwaidi: "Al Suwaidi Hospital", takhassusi: "Takhassusi Hospital", sahafa: "Al Sahafa Hospital", womens: "Women's Health Hospital", hamra: "Al Hamra Hospital", dq: "Diplomatic Quarter MC", digital: "Digital City MC", maternity: "Maternity Hospital", ortho: "Orthopedic Hospital", narjis: "Al Narjis MC", ghadir: "Al Ghadir MC" },
  role: { pct: "PCT (triage)", nurse: "ED Nurse", physician: "ED Physician", receiver: "Receiver (legacy)" },
  a12: { atypical: "Atypical presentation", borderline: "Borderline CTAS levels", peds: "Pediatric factors", language: "Language barrier", workload: "Workload/interruptions", incomplete: "Incomplete vitals/info", family: "Family pressure", none: "No difficult case" },
  b7: { under: "Under-triaged (sicker)", over: "Over-triaged (less sick)", both: "Both equally", na: "No mismatch seen" },
  b1: { daily: "Daily", weekly: "Weekly", monthly: "Monthly", rarely2: "Rarely" },
  b2: { delay: "Delayed treatment", overcrowd: "Overcrowding", escalation: "Escalation", complaint: "Complaint", safety: "Safety incident", none: "None" },
  b3: { time: "Extra time", workup: "Repeated workup", bed: "Bed misallocation", los: "Prolonged LOS", staff: "Staff pulled away", dxdelay: "Delayed diagnosis/treatment", escalation: "Unplanned escalation", complaint: "Dissatisfaction/complaint", harm: "Harm / near-miss", nothing: "Nothing significant" },
  b4: { "yes-major": "Yes, significantly", "yes-minor": "Yes, slightly", no2: "No impact" },
  b5: { always: "Almost always", often: "Often", sometimes: "Sometimes", rarely: "Rarely — trusts level" },
  b6: { "yes-reg": "Yes, regularly", "yes-many": "Yes, more than once", "yes-once": "Yes, once", no: "No" },
  b8: { silent: "Reassign silently", discuss: "Discuss with nurse", escalate: "Escalate to charge", accept: "Accept and manage" },
  b9: { regularly: "Regularly", sometimes: "Sometimes", rarely: "Rarely", never: "Never" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
function pct(n: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((n / total) * 100)}%`;
}
function pctNum(n: number, total: number): number {
  if (!total) return 0;
  return Math.round((n / total) * 100);
}
function countToBar(obj: Record<string, number>, labelMap: Record<string, string>) {
  return Object.entries(obj)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: labelMap[k] ?? k, value: v }))
    .sort((a, b) => b.value - a.value);
}
function scaleToBar(arr: number[], min: number, max: number) {
  const counts: Record<number, number> = {};
  for (let i = min; i <= max; i++) counts[i] = 0;
  arr.forEach((v) => { if (counts[v] !== undefined) counts[v]++; });
  return Object.entries(counts).map(([k, v]) => ({ name: k, value: v }));
}
function topKey(obj: Record<string, number>): string {
  const entries = Object.entries(obj).filter(([, v]) => v > 0);
  if (!entries.length) return "";
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}
function topAnswer(obj: Record<string, number>, labelMap: Record<string, string>): string {
  const k = topKey(obj);
  return k ? (labelMap[k] ?? k) : "—";
}
function sumKeys(obj: Record<string, number>, keys: string[]): number {
  return keys.reduce((acc, k) => acc + (obj[k] ?? 0), 0);
}

function buildStats(rows: SheetRow[]): Stats {
  const empty = (): Record<string, number> => ({});
  const s: Stats = {
    total: rows.length, partA: 0, partB: 0,
    timestamps: [], experience: empty(), role: empty(), facility: empty(), 
    a1: empty(), a2: empty(), a3: empty(), a4: empty(), a5: empty(),
    a6: empty(), a7: empty(), a8: [], a9: [],
    a10: empty(), a11: empty(), a12: empty(), a13Comments: [],
    b1: empty(), b2: empty(), b3: empty(), b4: empty(),
    b5: empty(), b6: empty(), b7: empty(), b8: empty(),
    b9: empty(), b10Comments: [], b11: [],
  };
  const inc = (obj: Record<string, number>, key: string) => {
    if (!key) return; obj[key] = (obj[key] ?? 0) + 1;
  };
  const incMulti = (obj: Record<string, number>, val: string) => {
    (val ?? "").split(",").map((v) => v.trim()).filter(Boolean).forEach((v) => inc(obj, v));
  };
  const push = (arr: number[], val: string) => {
    const n = Number(val); if (!isNaN(n) && val !== "") arr.push(n);
  };
  const story = (arr: string[], val: string) => {
    if ((val ?? "").trim().length > 3) arr.push(val.trim());
  };
  rows.forEach((row) => {
    const part = (row.part ?? "").toUpperCase();
    if (part === "A") s.partA++; else if (part === "B") s.partB++;
    if (row.timestamp) s.timestamps.push(row.timestamp);
    inc(s.experience, row.experience);
    inc(s.role, row.q1);
    inc(s.facility, row.facility);
    
    if (part === "A") {
      inc(s.a1, row.a1); inc(s.a2, row.a2); inc(s.a3, row.a3);
      inc(s.a4, row.a4); inc(s.a5, row.a5);
      incMulti(s.a6, row.a6); incMulti(s.a7, row.a7);
      push(s.a8, row.a8); push(s.a9, row.a9);
      inc(s.a10, row.a10); inc(s.a11, row.a11);
      incMulti(s.a12, row.a12); story(s.a13Comments, row.a13);
    } else if (part === "B") {
      inc(s.b1, row.b1); incMulti(s.b2, row.b2); incMulti(s.b3, row.b3);
      inc(s.b4, row.b4); inc(s.b5, row.b5); inc(s.b6, row.b6);
      inc(s.b7, row.b7); inc(s.b8, row.b8); inc(s.b9, row.b9);
      push(s.b11, row.b11);
      story(s.b10Comments, row.b10);
    }
  });
  return s;
}

// ─── Problem-Severity Scoring Engine ─────────────────────────────────────────
// Signals are built ONLY from reported behavior and observed consequences —
// no preference or tool-interest questions feed the score (Mom Test principle).

interface Signal {
  id: string;
  label: string;
  description: string;
  score: number;   // 0–100
  weight: number;  // relative importance
  strength: "strong" | "moderate" | "weak";
  evidence: string;
}

function computeGoNoGo(s: Stats): { signals: Signal[]; composite: number; verdict: "GO" | "CONDITIONAL" | "WAIT"; summary: string } {
  const A = Math.max(s.partA, 1);
  const B = Math.max(s.partB, 1);
  const strength = (score: number): "strong" | "moderate" | "weak" =>
    score >= 65 ? "strong" : score >= 40 ? "moderate" : "weak";

  // Signal 1 — Triage delay (a1: assignments taking >5 min)
  const slow = pctNum(sumKeys(s.a1, ["5-10", "10+"]), A);
  const s1: Signal = {
    id: "delay", label: "Triage Delay", weight: 15,
    description: "Nurses reporting >5 min from arrival to CTAS assignment on their last busy shift",
    score: slow, strength: strength(slow),
    evidence: `${slow}% of nurses took >5 minutes to assign CTAS`,
  };

  // Signal 2 — CTAS uncertainty frequency (a3: ≥3 times last month)
  const unsure = pctNum(sumKeys(s.a3, ["3-5", "5+"]), A);
  const s2: Signal = {
    id: "uncertainty", label: "CTAS Uncertainty", weight: 20,
    description: "Nurses unsure about a CTAS level 3+ times in the last month",
    score: unsure, strength: strength(unsure),
    evidence: `${unsure}% of nurses were unsure 3+ times last month`,
  };

  // Signal 3 — Consequences of uncertainty (a5: anything other than "nothing")
  const conseqA = pctNum(A - (s.a5["nothing"] ?? 0) - (s.a5["unknown"] ?? 0), A);
  const s3: Signal = {
    id: "consequenceA", label: "Uncertainty Consequences", weight: 15,
    description: "Uncertain assignments followed by re-triage, delay, correction, or complaint",
    score: conseqA, strength: strength(conseqA),
    evidence: `${conseqA}% of uncertain cases had a concrete downstream event`,
  };

  // Signal 4 — Structural tool gap (a6/a7: nothing structured available OR nothing used)
  const noneAvail = pctNum(s.a6["nothing"] ?? 0, A);
  const noneUsed = pctNum(s.a7["none"] ?? 0, A);
  const gap = Math.max(noneAvail, noneUsed);
  const s4: Signal = {
    id: "toolgap", label: "Say/Do Tool Gap", weight: 15,
    description: "Nurses with nothing structured available, or using none of what exists under load",
    score: gap, strength: strength(gap),
    evidence: `${noneAvail}% have nothing structured; ${noneUsed}% use none of what exists`,
  };

  // Signal 5 — Mis-triage burden on receivers (b1 daily/weekly + b3 costly consequences)
  const freqB = pctNum(sumKeys(s.b1, ["daily", "weekly"]), B);
  const costB = pctNum(sumKeys(s.b3, ["harm", "workup", "bed", "dxdelay", "escalation", "los"]),
    Math.max(Object.values(s.b3).reduce((a, b) => a + b, 0), 1));
  const burden = Math.round(freqB * 0.6 + costB * 0.4);
  const s5: Signal = {
    id: "mistriage", label: "Mis-Triage Burden", weight: 20,
    description: "Receivers seeing mis-triage daily/weekly, with material cost (workup, beds, harm)",
    score: burden, strength: strength(burden),
    evidence: `${freqB}% see mis-triage weekly+; ${costB}% of reported costs are material`,
  };

  // Signal 6 — Broken feedback loop (a10 rarely/never + b9 rarely/never)
  const noFbA = pctNum(sumKeys(s.a10, ["rarely", "never2"]), A);
  const noFbB = pctNum(sumKeys(s.b9, ["rarely", "never"]), B);
  const loop = Math.round((noFbA + noFbB) / 2);
  const s6: Signal = {
    id: "feedback", label: "Broken Feedback Loop", weight: 15,
    description: "Nurses rarely receive feedback AND receivers rarely give it — no learning happens",
    score: loop, strength: strength(loop),
    evidence: `${noFbA}% of nurses rarely/never get feedback; ${noFbB}% of receivers rarely/never give it`,
  };

  const signals = [s1, s2, s3, s4, s5, s6];
  const totalWeight = signals.reduce((acc, sg) => acc + sg.weight, 0);
  const composite = Math.round(signals.reduce((acc, sg) => acc + sg.score * sg.weight, 0) / totalWeight);
  const verdict: "GO" | "CONDITIONAL" | "WAIT" =
    composite >= 60 ? "GO" : composite >= 40 ? "CONDITIONAL" : "WAIT";
  const summary =
    verdict === "GO"
      ? "Strong problem evidence: triage uncertainty is frequent, has real consequences, and no structured support or feedback loop exists. Proceed with the TriagePulse POC."
      : verdict === "CONDITIONAL"
      ? "Moderate problem evidence. Some severity signals are present but not dominant — collect more responses or probe the weak signals before committing full resources."
      : "Weak problem evidence so far. The reported behavior does not yet justify an intervention — keep collecting responses before deciding.";
  return { signals, composite, verdict, summary };
}


// ─── Sub-components ───────────────────────────────────────────────────────────

function KPICard({ label, value, sub, color, icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-2" style={{ borderColor: C.border }}>
      {icon && <span className="text-2xl">{icon}</span>}
      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.slate }}>{label}</p>
      <p className="text-3xl font-extrabold leading-none" style={{ color: color ?? C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
      {sub && <p className="text-xs" style={{ color: C.slate }}>{sub}</p>}
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="h-6 w-1 rounded-full" style={{ background: C.navy }} />
      <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>
        {icon && <span>{icon}</span>}{title}
      </h2>
    </div>
  );
}

function StoryCard({ title, stories, color }: { title: string; stories: string[]; color?: string }) {
  return (
    <div className="rounded-2xl p-5 shadow-sm border" style={{ background: C.card, borderColor: C.border }}>
      <h3 className="text-sm font-bold mb-3" style={{ color: color ?? C.navy }}>
        {title} <span className="font-normal text-gray-400">({stories.length})</span>
      </h3>
      {stories.length === 0 ? (
        <p className="text-xs text-gray-400 italic">No narrative responses yet.</p>
      ) : (
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {stories.map((st, i) => (
            <div key={i} className="text-xs text-gray-700 leading-relaxed rounded-lg px-3 py-2 border-l-2"
              style={{ background: C.navyLight, borderLeftColor: color ?? C.teal }}>
              {st}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BarCard({ title, data, color }: { title: string; data: { name: string; value: number }[]; color?: string }) {
  if (!data.length) return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
      <p className="text-xs font-semibold mb-2" style={{ color: C.slate }}>{title}</p>
      <p className="text-xs text-center py-8" style={{ color: C.slate }}>No data yet</p>
    </div>
  );
  const total = data.reduce((a, b) => a + b.value, 0);
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
      <p className="text-xs font-semibold mb-4" style={{ color: C.slate }}>{title}</p>
      <div className="space-y-2.5">
        {data.map((d, i) => (
          <div key={i}>
            <div className="flex justify-between text-xs mb-1" style={{ color: C.slate }}>
              <span className="font-medium" style={{ color: C.navy }}>{d.name}</span>
              <span>{d.value} <span style={{ color: C.slate }}>({pct(d.value, total)})</span></span>
            </div>
            <div className="h-2.5 rounded-full overflow-hidden" style={{ background: C.navyLight }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pctNum(d.value, total)}%`, background: color ?? PALETTE[i % PALETTE.length] }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScaleCard({ title, data, avgVal, color }: { title: string; data: { name: string; value: number }[]; avgVal: number; color?: string }) {
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold" style={{ color: C.slate }}>{title}</p>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: color ?? C.teal }}>
          avg {avgVal}/5
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: C.slate }} />
          <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
            formatter={(v: number) => [`${v} responses`, ""]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => {
              const intensity = data.length > 1 ? i / (data.length - 1) : 0.5;
              const r = Math.round(26 + intensity * (44 - 26));
              const g = Math.round(157 + intensity * (43 - 157));
              const b = Math.round(143 + intensity * (41 - 143));
              return <Cell key={i} fill={`rgb(${r},${g},${b})`} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function PieCard({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  if (!total) return null;
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
      <p className="text-xs font-semibold mb-3" style={{ color: C.slate }}>{title}</p>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={78} dataKey="value" paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }}
            formatter={(v: number) => [`${v} (${pct(v, total)})`, ""]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Signal Meter ─────────────────────────────────────────────────────────────

function SignalMeter({ signal }: { signal: Signal }) {
  const col = SIGNAL_COLORS[signal.strength];
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold" style={{ color: C.navy }}>{signal.label}</p>
          <p className="text-xs mt-0.5" style={{ color: C.slate }}>{signal.description}</p>
        </div>
        <span
          className="shrink-0 px-2.5 py-1 rounded-full text-white text-xs font-bold uppercase"
          style={{ background: col }}
        >
          {signal.strength}
        </span>
      </div>
      <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: C.navyLight }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${signal.score}%`, background: col }}
        />
      </div>
      <div className="flex justify-between text-xs" style={{ color: C.slate }}>
        <span className="italic">{signal.evidence}</span>
        <span className="font-bold" style={{ color: col }}>{signal.score}%</span>
      </div>
    </div>
  );
}

// ─── Verdict Banner ───────────────────────────────────────────────────────────

function VerdictBanner({ composite, verdict, summary }: { composite: number; verdict: "GO" | "CONDITIONAL" | "WAIT"; summary: string }) {
  const config = {
    GO:          { bg: "#E8F5EE", border: C.green,  text: C.green,  icon: "✅", label: "GO — Proceed with Development" },
    CONDITIONAL: { bg: "#FEF9E7", border: C.amber,  text: C.amber,  icon: "⚠️", label: "CONDITIONAL — Pilot First" },
    WAIT:        { bg: "#FEF0F0", border: C.red,    text: C.red,    icon: "⏸", label: "WAIT — Gather More Evidence" },
  }[verdict];

  return (
    <div className="rounded-2xl border-2 p-6" style={{ background: config.bg, borderColor: config.border }}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Score Dial */}
        <div className="shrink-0 flex flex-col items-center justify-center w-24 h-24 rounded-full border-4 shadow-md" style={{ borderColor: config.border, background: "#fff" }}>
          <span className="text-2xl font-extrabold leading-none" style={{ color: config.text, fontFamily: "'Space Grotesk', sans-serif" }}>{composite}</span>
          <span className="text-xs font-semibold" style={{ color: C.slate }}>/ 100</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{config.icon}</span>
            <h3 className="text-lg font-extrabold" style={{ color: config.text, fontFamily: "'Space Grotesk', sans-serif" }}>{config.label}</h3>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: C.navy }}>{summary}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Radar Chart for Decision Signals ─────────────────────────────────────────

function SignalRadar({ signals }: { signals: Signal[] }) {
  const data = signals.map(s => ({ subject: s.label.split(" ").slice(0, 2).join(" "), score: s.score, fullMark: 100 }));
  return (
    <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
      <p className="text-xs font-semibold mb-3" style={{ color: C.slate }}>Signal Radar — All Dimensions</p>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
          <PolarGrid stroke={C.border} />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: C.slate }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: C.slate }} />
          <Radar name="Signal" dataKey="score" stroke={C.teal} fill={C.teal} fillOpacity={0.25} strokeWidth={2} />
          <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }} formatter={(v: number) => [`${v}%`, "Signal"]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Export Helpers ───────────────────────────────────────────────────────────

function exportCSV(stats: Stats, rows: SheetRow[]) {
  if (!rows.length) { alert("No data to export."); return; }
  // Union of keys across ALL rows (Part A and Part B have different columns),
  // in a stable, human-friendly order.
  const keySet = new Set<string>();
  rows.forEach((r) => Object.keys(r).forEach((k) => keySet.add(k)));
  const preferred = ["timestamp", "part", "q1", "q2", "facility", "experience",
    "a1","a2","a3","a4","a5","a6","a7","a8","a9","a10","a11","a12","a13",
    "b1","b2","b3","b4","b11","b5","b6","b7","b8","b9","b10","sid"];
  const headers = [
    ...preferred.filter((k) => keySet.has(k)),
    ...Array.from(keySet).filter((k) => !preferred.includes(k)),
  ];
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(",")),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `hmg-triage-survey-data-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

function exportSummaryCSV(stats: Stats, goNoGo: ReturnType<typeof computeGoNoGo>) {
  const rows = [
    ["Metric", "Value"],
    ["Total Responses", stats.total],
    ["Part A (Nurses)", stats.partA],
    ["Part B (Physicians/Managers)", stats.partB],
    ["Avg CTAS Confidence (A)", avg(stats.a8)],
    ["Avg Triage Satisfaction (A)", avg(stats.a9)],
    ["Avg Triage Satisfaction (B)", avg(stats.b11)],
    ["Go/No-Go Composite Score", goNoGo.composite],
    ["Verdict", goNoGo.verdict],
    ["", ""],
    ["Signal", "Score", "Strength", "Evidence"],
    ...goNoGo.signals.map(s => [s.label, s.score + "%", s.strength, s.evidence]),
    ["", ""],
    ["Top Challenge (Nurses)", topAnswer(stats.a2, LABELS.a2)],
    ["Post-Uncertainty Consequence", topAnswer(stats.a5, LABELS.a5)],
    ["Top Single Change Requested", topAnswer(stats.a11, LABELS.a11)],
    ["Mis-Triage Frequency (Receivers)", topAnswer(stats.b1, LABELS.b1)],
    ["Top Mis-Triage Consequence", topAnswer(stats.b2, LABELS.b2)],
    ["Action When Level Seems Wrong", topAnswer(stats.b8, LABELS.b8)],
  ];
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url;
  a.download = `hmg-decision-summary-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── Tab Navigation ───────────────────────────────────────────────────────────

type Tab = "overview" | "nurses" | "physicians" | "decision";

function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview",   label: "Overview",   icon: "📊" },
    { id: "nurses",     label: "Nurses (A)", icon: "🏥" },
    { id: "physicians", label: "Physicians (B)", icon: "👨‍⚕️" },
    { id: "decision",   label: "Go/No-Go",   icon: "🎯" },
  ];
  return (
    <div className="flex gap-1 p-1 rounded-xl" style={{ background: C.navyLight }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
          style={active === t.id
            ? { background: C.navy, color: "#fff", boxShadow: "0 2px 8px rgba(26,43,74,0.25)" }
            : { color: C.slate }
          }
        >
          <span>{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Dashboard Content ────────────────────────────────────────────────────────

function DashboardContent({ stats, rawRows }: { stats: Stats; rawRows: SheetRow[] }) {
  const [tab, setTab] = useState<Tab>("overview");
  const goNoGo = computeGoNoGo(stats);
  const avgConf = avg(stats.a8);
  const avgSat = avg(stats.a9);
  const avgSatB = avg(stats.b11);
  const dashRef = useRef<HTMLDivElement>(null);

  // Timeline
  const timelineMap: Record<string, number> = {};
  stats.timestamps.forEach((ts) => {
    const d = ts.split("T")[0] || ts.substring(0, 10);
    if (d) timelineMap[d] = (timelineMap[d] ?? 0) + 1;
  });
  const timeline = Object.entries(timelineMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date: date.slice(5), count }));

  const handlePrint = () => window.print();

  return (
    <div ref={dashRef}>
      {/* Tab Bar */}
      <div className="mb-6">
        <TabBar active={tab} onChange={setTab} />
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <div className="space-y-8">
          <section>
            <SectionHeader title="Response Summary" icon="📋" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <KPICard icon="📋" label="Total Responses" value={stats.total} sub="All submissions" color={C.navy} />
              <KPICard icon="🏥" label="Triage Nurses" value={stats.partA} sub={pct(stats.partA, stats.total) + " of total"} color={C.teal} />
              <KPICard icon="👨‍⚕️" label="Physicians / Mgrs" value={stats.partB} sub={pct(stats.partB, stats.total) + " of total"} color={C.red} />
              <KPICard icon="🎯" label="Go/No-Go Score" value={goNoGo.composite + "/100"} sub={goNoGo.verdict} color={SIGNAL_COLORS[goNoGo.signals[0]?.strength ?? "moderate"]} />
            </div>
          </section>

          {stats.total > 0 && (
            <section>
              <SectionHeader title="Key Decision Signals" icon="⚡" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: "⏱", label: "Avg Triage Confidence", value: avgConf ? `${avgConf}/5` : "—", color: C.teal },
                  { icon: "😊", label: "Avg Triage Satisfaction", value: avgSat ? `${avgSat}/5` : "—", color: C.navy },
                  { icon: "🧑‍⚕️", label: "Top Respondent Role", value: topAnswer(stats.role, LABELS.role), color: C.navy },
                  { icon: "🏥", label: "Top Facility", value: topAnswer(stats.facility, LABELS.facility), color: C.teal },
                  { icon: "🎯", label: "Top Challenge (Triage)", value: topAnswer(stats.a2, LABELS.a2), color: C.red },
                  { icon: "⚡", label: "After Uncertainty", value: topAnswer(stats.a5, LABELS.a5), color: C.purple },
                  { icon: "👁", label: "Mis-Triage Seen (B)", value: topAnswer(stats.b1, LABELS.b1), color: C.red },
                  { icon: "🔁", label: "Feedback to Nurses (B)", value: topAnswer(stats.b9, LABELS.b9), color: C.green },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl border p-4 shadow-sm flex items-start gap-3" style={{ borderColor: C.border }}>
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.slate }}>{item.label}</p>
                      <p className="text-sm font-bold leading-snug" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <SectionHeader title="Demographics" icon="👥" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <PieCard title="Role Distribution" data={[
                { name: "Triage Nurses (A)", value: stats.partA },
                { name: "Physicians / Managers (B)", value: stats.partB },
              ]} />
              <BarCard title="Years of ED Experience" data={countToBar(stats.experience, LABELS.experience)} color={C.navy} />
            </div>
          </section>

          {timeline.length > 1 && (
            <section>
              <SectionHeader title="Submissions Over Time" icon="📅" />
              <div className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={timeline} margin={{ left: 0, right: 16, top: 4, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.slate }} />
                    <YAxis tick={{ fontSize: 11, fill: C.slate }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 12 }} formatter={(v: number) => [`${v} submissions`, ""]} />
                    <Line type="monotone" dataKey="count" stroke={C.teal} strokeWidth={2.5} dot={{ fill: C.teal, r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── NURSES TAB ── */}
      {tab === "nurses" && stats.partA > 0 && (
        <div className="space-y-8">
          <section>
            <SectionHeader title="Part A — Triage Nurses" icon="🏥" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <KPICard icon="👥" label="Respondents" value={stats.partA} color={C.teal} />
              <KPICard icon="⭐" label="Avg Confidence" value={avgConf || "—"} sub="CTAS decisions (1–5)" color={C.teal} />
              <KPICard icon="😊" label="Avg Satisfaction" value={avgSat || "—"} sub="Current triage process (1–5)" color={C.navy} />
              <KPICard icon="🔧" label="Top Requested Change" value={topAnswer(stats.a11, LABELS.a11)} color={C.purple} />
            </div>
          </section>

          <section>
            <SectionHeader title="The Last Shift" icon="⏱" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="Role distribution (all respondents)" data={countToBar(stats.role, LABELS.role)} color={C.navy} />
              <BarCard title="Facility distribution (all respondents)" data={countToBar(stats.facility, LABELS.facility)} color={C.slate} />
              <BarCard title="A1 · Time from arrival to CTAS assignment" data={countToBar(stats.a1, LABELS.a1)} color={C.teal} />
              <BarCard title="A2 · Biggest triage challenge" data={countToBar(stats.a2, LABELS.a2)} color={C.red} />
              <BarCard title="A3 · CTAS uncertainty frequency (last month)" data={countToBar(stats.a3, LABELS.a3)} color={C.amber} />
              <BarCard title="A4 · What nurses do when uncertain" data={countToBar(stats.a4, LABELS.a4)} color={C.navy} />
              <BarCard title="A5 · What happened after an uncertain assignment" data={countToBar(stats.a5, LABELS.a5)} color={C.purple} />
            </div>
          </section>

          <section>
            <SectionHeader title="Tools & Support" icon="🛠" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="A6 · Available at the triage station" data={countToBar(stats.a6, LABELS.a6)} color={C.slate} />
              <BarCard title="A7 · Actually used during a busy shift" data={countToBar(stats.a7, LABELS.a7)} color={C.teal} />
              <ScaleCard title="A8 · CTAS decision confidence (1–5)" data={scaleToBar(stats.a8, 1, 5)} avgVal={avgConf} color={C.teal} />
              <ScaleCard title="A9 · Satisfaction with current triage process (1–5)" data={scaleToBar(stats.a9, 1, 5)} avgVal={avgSat} color={C.navy} />
            </div>
          </section>

          <section>
            <SectionHeader title="System Feedback" icon="💬" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="A10 · Feedback received on triage decisions" data={countToBar(stats.a10, LABELS.a10)} color={C.amber} />
              <BarCard title="A11 · Single change to most improve triage quality" data={countToBar(stats.a11, LABELS.a11)} color={C.red} />
              <BarCard title="A12 · What made the most difficult case difficult (top-2)" data={countToBar(stats.a12, LABELS.a12)} color={C.teal} />
              <StoryCard title="A13 · Case descriptions & comments (nurses)" stories={stats.a13Comments} color={C.slate} />
            </div>
          </section>
        </div>
      )}

      {tab === "nurses" && stats.partA === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center" style={{ color: C.slate }}>
          <span className="text-5xl mb-4">🏥</span>
          <p className="font-semibold">No Part A (Nurse) responses yet.</p>
          <p className="text-sm mt-1">Share the survey with triage nurses to collect data.</p>
        </div>
      )}

      {/* ── PHYSICIANS TAB ── */}
      {tab === "physicians" && stats.partB > 0 && (
        <div className="space-y-8">
          <section>
            <SectionHeader title="Part B — Physicians & Managers" icon="👨‍⚕️" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <KPICard icon="👥" label="Respondents" value={stats.partB} color={C.red} />
              <KPICard icon="👁" label="Mis-Triage Frequency" value={topAnswer(stats.b1, LABELS.b1)} sub="Most common answer" color={C.red} />
              <KPICard icon="💰" label="Top Consequence" value={topAnswer(stats.b2, LABELS.b2)} sub="Most selected (top-2)" color={C.amber} />
              <KPICard icon="🔁" label="Re-assess Often+" value={pct(sumKeys(stats.b5, ["always", "often"]), stats.partB)} sub="Independent re-assessment" color={C.purple} />
            </div>
          </section>

          <section>
            <SectionHeader title="Triage Impact" icon="📊" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="B1 · Mis-triage frequency observed" data={countToBar(stats.b1, LABELS.b1)} color={C.red} />
              <BarCard title="B2 · Top-2 consequences of mis-triage" data={countToBar(stats.b2, LABELS.b2)} color={C.amber} />
              <BarCard title="B3 · Actual cost of the last mis-triaged patient" data={countToBar(stats.b3, LABELS.b3)} color={C.purple} />
              <BarCard title="B4 · Does triage affect patient flow?" data={countToBar(stats.b4, LABELS.b4)} color={C.navy} />
              <ScaleCard title="B11 · Satisfaction with current triage process (1–5)" data={scaleToBar(stats.b11, 1, 5)} avgVal={avgSatB} color={C.red} />
            </div>
          </section>

          <section>
            <SectionHeader title="What Receivers Actually Do" icon="🩺" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="B5 · Independent CTAS re-assessment frequency" data={countToBar(stats.b5, LABELS.b5)} color={C.purple} />
              <BarCard title="B6 · CTAS mismatch with clinical findings" data={countToBar(stats.b6, LABELS.b6)} color={C.red} />
              <BarCard title="B7 · Mismatch direction (under vs over-triage)" data={countToBar(stats.b7, LABELS.b7)} color={C.amber} />
              <BarCard title="B8 · Typical action when a level seems wrong" data={countToBar(stats.b8, LABELS.b8)} color={C.navy} />
              <BarCard title="B9 · Feedback given to triage nurse afterward" data={countToBar(stats.b9, LABELS.b9)} color={C.green} />
              <StoryCard title="B10 · Mismatch cases & comments (receivers)" stories={stats.b10Comments} color={C.slate} />
            </div>
          </section>
        </div>
      )}

      {tab === "physicians" && stats.partB === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center" style={{ color: C.slate }}>
          <span className="text-5xl mb-4">👨‍⚕️</span>
          <p className="font-semibold">No Part B (Physician/Manager) responses yet.</p>
          <p className="text-sm mt-1">Share the survey with physicians and charge nurses to collect data.</p>
        </div>
      )}

      {/* ── DECISION TAB ── */}
      {tab === "decision" && (
        <div className="space-y-8">
          <section>
            <SectionHeader title="Go / No-Go Recommendation" icon="🎯" />
            {stats.total < 5 ? (
              <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: C.border }}>
                <span className="text-4xl mb-3 block">📊</span>
                <p className="font-semibold" style={{ color: C.navy }}>Collect at least 5 responses for a reliable recommendation.</p>
                <p className="text-sm mt-1" style={{ color: C.slate }}>Current: {stats.total} response{stats.total !== 1 ? "s" : ""}</p>
              </div>
            ) : (
              <>
                <VerdictBanner composite={goNoGo.composite} verdict={goNoGo.verdict} summary={goNoGo.summary} />
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <SignalRadar signals={goNoGo.signals} />
                  <div className="space-y-3">
                    {goNoGo.signals.map(sig => <SignalMeter key={sig.id} signal={sig} />)}
                  </div>
                </div>
              </>
            )}
          </section>

          <section>
            <SectionHeader title="What the Data Tells Us" icon="💡" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nurse readiness */}
              <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-3" style={{ borderColor: C.border }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.teal }}>🏥 Nurse Readiness</p>
                {[
                  { label: "Uncertain about CTAS 3+ times/month", val: pct(sumKeys(stats.a3, ["3-5", "5+"]), stats.partA || 1) },
                  { label: "Uncertainty had a real consequence", val: pct(stats.partA - (stats.a5["nothing"] ?? 0) - (stats.a5["unknown"] ?? 0), stats.partA || 1) },
                  { label: "Nothing structured at the station", val: pct(stats.a6["nothing"] ?? 0, stats.partA || 1) },
                  { label: "Rarely/never receive feedback", val: pct(sumKeys(stats.a10, ["rarely", "never2"]), stats.partA || 1) },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span style={{ color: C.slate }}>{item.label}</span>
                    <span className="font-bold" style={{ color: C.teal }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Physician readiness */}
              <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-3" style={{ borderColor: C.border }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.red }}>👨‍⚕️ Receiver Problem Evidence</p>
                {[
                  { label: "Observe mis-triage daily/weekly", val: pct(sumKeys(stats.b1, ["daily", "weekly"]), stats.partB || 1) },
                  { label: "Re-assess CTAS often or always", val: pct(sumKeys(stats.b5, ["always", "often"]), stats.partB || 1) },
                  { label: "Report significant flow impact", val: pct(stats.b4["yes-major"] ?? 0, stats.partB || 1) },
                  { label: "Rarely/never give feedback to nurses", val: pct(sumKeys(stats.b9, ["rarely", "never"]), stats.partB || 1) },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span style={{ color: C.slate }}>{item.label}</span>
                    <span className="font-bold" style={{ color: C.red }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section>
            <SectionHeader title="Recommended Next Steps" icon="🗺" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                {
                  step: "01", icon: "📱", title: "Prototype the App",
                  desc: "Build a low-fidelity prototype of the CTAS decision-support flow and test with 5–10 triage nurses.",
                  color: C.teal,
                },
                {
                  step: "02", icon: "🧪", title: "Run a Pilot",
                  desc: "Deploy a 4-week pilot at one triage station. Measure time-to-CTAS, accuracy rate, and nurse satisfaction.",
                  color: C.navy,
                },
                {
                  step: "03", icon: "📊", title: "Measure & Decide",
                  desc: "Compare pre/post pilot metrics. If accuracy improves ≥15% and satisfaction ≥4/5, proceed to full rollout.",
                  color: C.green,
                },
              ].map((item) => (
                <div key={item.step} className="bg-white rounded-2xl border p-5 shadow-sm" style={{ borderColor: C.border }}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: item.color }}>{item.step}</span>
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-sm font-bold" style={{ color: item.color }}>{item.title}</p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: C.slate }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* ── Export Bar ── */}
      <div className="mt-10 pt-6 border-t flex flex-wrap gap-3 items-center justify-between" style={{ borderColor: C.border }}>
        <p className="text-xs" style={{ color: C.slate }}>Export options — for sharing with stakeholders or archiving</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all hover:shadow-md"
            style={{ borderColor: C.navy, color: C.navy, background: "#fff" }}
          >
            🖨 Print / Save as PDF
          </button>
          <button
            onClick={() => exportSummaryCSV(stats, goNoGo)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:shadow-md"
            style={{ background: C.teal }}
          >
            📊 Export Decision Summary (CSV)
          </button>
          <button
            onClick={() => exportCSV(stats, rawRows)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:shadow-md"
            style={{ background: C.navy }}
          >
            📥 Export Raw Data (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main AdminPage ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rawRows, setRawRows] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const handleLogin = () => {
    if (pw === ADMIN_PASSWORD) { setAuthenticated(true); setPwError(false); }
    else { setPwError(true); }
  };

  // v4: read the sheet directly via Google's gviz endpoint (no web-app needed).
  // Requires the spreadsheet to be link-shared as Viewer.
  const fetchViaSheet = async () => {
    setLoading(true); setError("");
    try {
      // Try known tab names until we find the one carrying the survey columns.
      const candidates = [RESPONSES_TAB, "Form Responses 1", "ردود النموذج 1", "Form responses 1"].filter(Boolean);
      let parsed: any = null; let cols: string[] = [];
      for (const cand of candidates) {
        const url = `https://docs.google.com/spreadsheets/d/${RESPONSES_SHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(cand)}`;
        const res = await fetch(url);
        const text = await res.text();
        const start = text.indexOf("{"); const end = text.lastIndexOf("}");
        if (start === -1 || end === -1) continue;
        const p2 = JSON.parse(text.slice(start, end + 1));
        const c2: string[] = (p2.table?.cols ?? []).map((c: any) => String(c?.label ?? "").trim());
        if (c2.includes("part")) { parsed = p2; cols = c2; break; }
      }
      if (!parsed) throw new Error("Responses tab not found — is the sheet link-shared as Viewer?");
      const rows: SheetRow[] = (parsed.table?.rows ?? []).map((r: any) => {
        const obj: SheetRow = {};
        (r?.c ?? []).forEach((cell: any, i: number) => {
          const key = cols[i]; if (!key) return;
          obj[key] = cell == null ? "" : String(cell.f ?? cell.v ?? "");
        });
        obj.experience = obj.q2 || obj.experience || "";
        return obj;
      }).filter((r: SheetRow) => (r.part ?? "").toUpperCase() === "A" || (r.part ?? "").toUpperCase() === "B");
      setRawRows(rows);
      setStats(buildStats(rows));
      setLastRefresh(new Date());
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setError("Could not read the responses sheet directly. Ensure it is shared as 'Anyone with the link — Viewer'. (" + String(e) + ")");
    }
  };

  const fetchData = () => {
    if (RESPONSES_SHEET_ID && RESPONSES_TAB) { fetchViaSheet(); return; }
    setLoading(true);
    setError(null);
    const cbName = `_tpAdmin_${Date.now()}`;
    const script = document.createElement("script");
    let done = false;
    const cleanup = () => {
      done = true;
      delete (window as any)[cbName];
      if (script.parentNode) script.parentNode.removeChild(script);
    };
    const timer = setTimeout(() => {
      if (!done) {
        cleanup(); setLoading(false);
        setError("Request timed out. Check that the Apps Script is deployed with 'Anyone' access.");
      }
    }, 15000);
    (window as any)[cbName] = (json: any) => {
      clearTimeout(timer); cleanup(); setLoading(false);
      if (json && Array.isArray(json.rows)) {
        setRawRows(json.rows);
        setStats(buildStats(json.rows));
        setLastRefresh(new Date());
      } else if (json && json.status === "ok") {
        setStats(buildStats([])); setRawRows([]);
        setError("The Apps Script does not yet support the ?action=summary endpoint. Please update and redeploy.");
      } else {
        setError("Could not parse response from Google Sheets. Check the Apps Script deployment.");
      }
    };
    script.onerror = () => {
      clearTimeout(timer); cleanup(); setLoading(false);
      setError("Could not reach the Google Apps Script. Ensure it is deployed as a Web App with 'Anyone' access.");
    };
    script.src = `${WEBHOOK_URL}?action=summary&callback=${cbName}`;
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (authenticated) fetchData();
  }, [authenticated]);

  // ── Login Screen ──────────────────────────────────────────────────────────

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: C.bg }}>
        <div className="bg-white rounded-3xl border shadow-2xl p-8 max-w-sm w-full space-y-6" style={{ borderColor: C.border }}>
          <div className="flex flex-col items-center gap-3">
            <img src={HMG_LOGO_URL} alt="HMG" className="h-10 object-contain" />
            <div className="text-center">
              <h1 className="text-lg font-extrabold" style={{ color: C.navy, fontFamily: "'Space Grotesk', sans-serif" }}>Analytics Dashboard</h1>
              <p className="text-xs mt-1" style={{ color: C.slate }}>HMG Triage Survey · QID/1397 · Admin Access</p>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-xs font-semibold" style={{ color: C.slate }}>Password</label>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setPwError(false); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Enter admin password"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ borderColor: pwError ? C.red : C.border, background: pwError ? "#FEF0F0" : "#fff" }}
            />
            {pwError && <p className="text-xs" style={{ color: C.red }}>Incorrect password. Please try again.</p>}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: C.navy }}
            >
              Access Dashboard
            </button>
          </div>
          <a href="/" className="block text-center text-xs" style={{ color: C.slate }}>← Back to Survey</a>
        </div>
      </div>
    );
  }

  // ── Dashboard Shell ───────────────────────────────────────────────────────

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .print-break { page-break-before: always; }
        }
      `}</style>

      <div className="min-h-screen" style={{ background: C.bg, fontFamily: "'Inter', sans-serif" }}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b shadow-sm no-print" style={{ background: C.navy, borderColor: "rgba(255,255,255,0.1)" }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={HMG_LOGO_URL} alt="HMG" className="h-7 object-contain brightness-0 invert" />
              <div className="hidden sm:block h-5 w-px opacity-30" style={{ background: "#fff" }} />
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-white leading-none">HMG Triage Analytics</p>
                <p className="text-xs opacity-60 text-white leading-none mt-0.5">HMG/QID/1397 · Decision Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastRefresh && (
                <span className="text-xs opacity-50 text-white hidden sm:block">
                  Updated {lastRefresh.toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                {loading ? "⏳" : "🔄"} {loading ? "Loading…" : "Refresh"}
              </button>
              <a href="/" className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "rgba(255,255,255,0.12)" }}>
                ← Survey
              </a>
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {loading && !stats && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: C.teal, borderTopColor: "transparent" }} />
              <p className="text-sm font-medium" style={{ color: C.slate }}>Loading survey data…</p>
            </div>
          )}

          {error && (
            <div className="rounded-2xl border p-5 mb-6 flex items-start gap-3" style={{ background: "#FEF0F0", borderColor: C.red }}>
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-sm font-bold mb-1" style={{ color: C.red }}>Data issue</p>
                <p className="text-xs leading-relaxed" style={{ color: C.navy }}>{error}</p>
                <p className="text-xs mt-2" style={{ color: C.slate }}>
                  Make sure the Apps Script is deployed with the latest version from the repository and "Anyone" access.
                </p>
              </div>
            </div>
          )}

          {stats && <DashboardContent stats={stats} rawRows={rawRows} />}

          {!loading && !stats && !error && (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <span className="text-5xl">📊</span>
              <p className="font-semibold" style={{ color: C.navy }}>No data loaded yet.</p>
              <button onClick={fetchData} className="mt-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: C.navy }}>Load Data</button>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
