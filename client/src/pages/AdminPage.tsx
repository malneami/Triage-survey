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
import { HMG_LOGO_URL, WEBHOOK_URL } from "@/lib/surveyData";

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
  q3: Record<string, number>; q4: Record<string, number>;
  q5: Record<string, number>; q6: Record<string, number>;
  q7: Record<string, number>; q8: number[];
  q9: Record<string, number>; q10: Record<string, number>;
  q11: Record<string, number>; q12: number[];
  q13: Record<string, number>;
  qb3: Record<string, number>; qb4: Record<string, number>;
  qb5: number[]; qb6: Record<string, number>;
  qb7: Record<string, number>; qb8: Record<string, number>;
  qb9: number[];
}

// ─── Label Maps ───────────────────────────────────────────────────────────────

const LABELS: Record<string, Record<string, string>> = {
  experience: { lt1: "< 1 year", "1-3": "1–3 yrs", "4-7": "4–7 yrs", "8+": "8+ yrs" },
  q3: { under2: "< 2 min", "2-5": "2–5 min", "5-10": "5–10 min", "10+": "> 10 min" },
  q4: { volume: "Patient volume", language: "Language barrier", ctas: "CTAS uncertainty", noref: "No reference tool", docs: "Documentation", other: "Other" },
  q5: { never: "Never", "1-2": "1–2×/month", "3-5": "3–5×/month", "5+": ">5×/month" },
  q6: { colleague: "Asked colleague", judgment: "Used judgment", lookup: "Looked it up", safer: "Assigned safer level", movedon: "Moved on" },
  q7: { memory: "Memory/training", paper: "Paper card", colleague2: "Ask colleague", app: "Mobile app", nothing: "Nothing" },
  q9: { yes: "Yes, definitely", maybe: "Maybe", no: "No" },
  q10: { mobile: "Mobile app", screen: "Station screen", voice: "Voice assistant", badge: "Wearable/badge" },
  q11: { regularly: "Regularly", sometimes: "Sometimes", rarely: "Rarely", never2: "Never" },
  q13: { training: "More training", staff: "More staff", tool2: "Better tool", protocol: "Clearer protocols", space: "Better space" },
  qb3: { daily: "Daily", weekly: "Weekly", monthly: "Monthly", rarely2: "Rarely" },
  qb4: { delay: "Delayed treatment", overcrowd: "Overcrowding", escalation: "Escalation", complaint: "Patient complaint", none: "None observed" },
  qb6: { "yes-major": "Yes, significantly", "yes-minor": "Yes, slightly", no2: "No impact" },
  qb7: { yes2: "Yes, strongly", maybe2: "Possibly", no3: "No", unsure: "Need more info" },
  qb8: { accuracy2: "Accuracy/reliability", liability: "Legal liability", adoption: "Staff resistance", cost: "Cost/budget", noconcern: "No concerns" },
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

function buildStats(rows: SheetRow[]): Stats {
  const empty = (): Record<string, number> => ({});
  const s: Stats = {
    total: rows.length, partA: 0, partB: 0,
    timestamps: [], experience: empty(),
    q3: empty(), q4: empty(), q5: empty(), q6: empty(),
    q7: empty(), q8: [], q9: empty(), q10: empty(),
    q11: empty(), q12: [], q13: empty(),
    qb3: empty(), qb4: empty(), qb5: [], qb6: empty(),
    qb7: empty(), qb8: empty(), qb9: [],
  };
  const inc = (obj: Record<string, number>, key: string) => {
    if (!key) return; obj[key] = (obj[key] ?? 0) + 1;
  };
  const push = (arr: number[], val: string) => {
    const n = Number(val); if (!isNaN(n) && val !== "") arr.push(n);
  };
  rows.forEach((row) => {
    const part = (row.part ?? "").toUpperCase();
    if (part === "A") s.partA++; else if (part === "B") s.partB++;
    if (row.timestamp) s.timestamps.push(row.timestamp);
    inc(s.experience, row.experience);
    if (part === "A") {
      inc(s.q3, row.q3); inc(s.q4, row.q4); inc(s.q5, row.q5); inc(s.q6, row.q6);
      inc(s.q7, row.q7); push(s.q8, row.q8); inc(s.q9, row.q9); inc(s.q10, row.q10);
      inc(s.q11, row.q11); push(s.q12, row.q12); inc(s.q13, row.q13);
    } else if (part === "B") {
      inc(s.qb3, row.qb3); inc(s.qb4, row.qb4); push(s.qb5, row.qb5); inc(s.qb6, row.qb6);
      inc(s.qb7, row.qb7); inc(s.qb8, row.qb8); push(s.qb9, row.qb9);
    }
  });
  return s;
}

// ─── Go/No-Go Scoring Engine ──────────────────────────────────────────────────

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
  const signals: Signal[] = [];
  const A = s.partA || 1;
  const B = s.partB || 1;

  // Signal 1: Triage time problem (q3 — nurses taking >2min)
  const slowTriage = ((s.q3["2-5"] ?? 0) + (s.q3["5-10"] ?? 0) + (s.q3["10+"] ?? 0)) / A * 100;
  signals.push({
    id: "triage-time",
    label: "Triage Time Problem",
    description: "% of nurses reporting triage takes >2 minutes",
    score: Math.min(100, slowTriage),
    weight: 20,
    strength: slowTriage >= 60 ? "strong" : slowTriage >= 30 ? "moderate" : "weak",
    evidence: `${Math.round(slowTriage)}% of nurses take >2 min for CTAS assignment`,
  });

  // Signal 2: CTAS uncertainty frequency (q5)
  const uncertain = ((s.q5["3-5"] ?? 0) + (s.q5["5+"] ?? 0)) / A * 100;
  signals.push({
    id: "uncertainty",
    label: "CTAS Uncertainty Frequency",
    description: "% of nurses uncertain about CTAS level 3+ times/month",
    score: Math.min(100, uncertain),
    weight: 25,
    strength: uncertain >= 50 ? "strong" : uncertain >= 25 ? "moderate" : "weak",
    evidence: `${Math.round(uncertain)}% experience CTAS uncertainty 3+ times/month`,
  });

  // Signal 3: Demand for decision support (q9)
  const wantTool = ((s.q9["yes"] ?? 0) + (s.q9["maybe"] ?? 0) * 0.5) / A * 100;
  signals.push({
    id: "demand",
    label: "Demand for Decision Support",
    description: "% of nurses who want a decision-support tool",
    score: Math.min(100, wantTool),
    weight: 20,
    strength: wantTool >= 70 ? "strong" : wantTool >= 40 ? "moderate" : "weak",
    evidence: `${Math.round(wantTool)}% of nurses want or are open to a decision-support tool`,
  });

  // Signal 4: Mis-triage frequency from physician side (qb3)
  const misTriage = ((s.qb3["daily"] ?? 0) * 100 + (s.qb3["weekly"] ?? 0) * 70 + (s.qb3["monthly"] ?? 0) * 30) / B;
  const misPct = Math.min(100, misTriage);
  signals.push({
    id: "mis-triage",
    label: "Mis-Triage Frequency (Physicians)",
    description: "Weighted frequency of mis-triage observed by physicians",
    score: misPct,
    weight: 20,
    strength: misPct >= 60 ? "strong" : misPct >= 30 ? "moderate" : "weak",
    evidence: `Top reported frequency: ${topAnswer(s.qb3, LABELS.qb3)}`,
  });

  // Signal 5: AI/App benefit perception (qb7)
  const aiBenefit = ((s.qb7["yes2"] ?? 0) + (s.qb7["maybe2"] ?? 0) * 0.5) / B * 100;
  signals.push({
    id: "ai-benefit",
    label: "AI Tool Benefit Perception",
    description: "% of physicians/managers who see value in AI-assisted triage",
    score: Math.min(100, aiBenefit),
    weight: 15,
    strength: aiBenefit >= 65 ? "strong" : aiBenefit >= 35 ? "moderate" : "weak",
    evidence: `${Math.round(aiBenefit)}% of physicians/managers support AI-assisted triage`,
  });

  // Composite weighted score
  const totalWeight = signals.reduce((a, s) => a + s.weight, 0);
  const composite = Math.round(signals.reduce((a, sig) => a + sig.score * sig.weight, 0) / totalWeight);

  const verdict: "GO" | "CONDITIONAL" | "WAIT" =
    composite >= 65 ? "GO" : composite >= 40 ? "CONDITIONAL" : "WAIT";

  const summary =
    verdict === "GO"
      ? "Strong evidence of unmet need and staff readiness. Data supports proceeding with AI-assisted triage tool development."
      : verdict === "CONDITIONAL"
      ? "Moderate signals detected. Consider a pilot program with a focused user group before full deployment."
      : "Insufficient signal strength. Collect more responses or address identified gaps before committing to development.";

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
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(r => headers.map(h => `"${(r[h] ?? "").replace(/"/g, '""')}"`).join(","))
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
    ["Avg CTAS Confidence (A)", avg(stats.q8)],
    ["Avg Triage Satisfaction (A)", avg(stats.q12)],
    ["Avg Triage Accuracy Satisfaction (B)", avg(stats.qb5)],
    ["Avg App Adoption Likelihood (B)", avg(stats.qb9)],
    ["Go/No-Go Composite Score", goNoGo.composite],
    ["Verdict", goNoGo.verdict],
    ["", ""],
    ["Signal", "Score", "Strength", "Evidence"],
    ...goNoGo.signals.map(s => [s.label, s.score + "%", s.strength, s.evidence]),
    ["", ""],
    ["Top Challenge (Nurses)", topAnswer(stats.q4, LABELS.q4)],
    ["Current Decision Tool", topAnswer(stats.q7, LABELS.q7)],
    ["Preferred Tool Format", topAnswer(stats.q10, LABELS.q10)],
    ["Mis-Triage Frequency (Physicians)", topAnswer(stats.qb3, LABELS.qb3)],
    ["AI Benefit Perception", topAnswer(stats.qb7, LABELS.qb7)],
    ["Top AI Concern", topAnswer(stats.qb8, LABELS.qb8)],
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
  const avgConf = avg(stats.q8);
  const avgSat = avg(stats.q12);
  const avgAccB = avg(stats.qb5);
  const avgSupportB = avg(stats.qb9);
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
                  { icon: "🎯", label: "Top Challenge (Nurses)", value: topAnswer(stats.q4, LABELS.q4), color: C.red },
                  { icon: "🛠", label: "Current Tool Used", value: topAnswer(stats.q7, LABELS.q7), color: C.purple },
                  { icon: "📱", label: "Preferred Format", value: topAnswer(stats.q10, LABELS.q10), color: C.teal },
                  { icon: "🤖", label: "AI Support Perception", value: topAnswer(stats.qb7, LABELS.qb7), color: C.green },
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
              <KPICard icon="📱" label="Preferred Format" value={topAnswer(stats.q10, LABELS.q10)} color={C.purple} />
            </div>
          </section>

          <section>
            <SectionHeader title="The Last Shift" icon="⏱" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="Q3 · Time from arrival to CTAS assignment" data={countToBar(stats.q3, LABELS.q3)} color={C.teal} />
              <BarCard title="Q4 · Biggest triage challenge" data={countToBar(stats.q4, LABELS.q4)} color={C.red} />
              <BarCard title="Q5 · CTAS uncertainty frequency (last month)" data={countToBar(stats.q5, LABELS.q5)} color={C.amber} />
              <BarCard title="Q6 · What nurses do when uncertain" data={countToBar(stats.q6, LABELS.q6)} color={C.navy} />
            </div>
          </section>

          <section>
            <SectionHeader title="Tools & Support" icon="🛠" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="Q7 · Current decision-support tool used" data={countToBar(stats.q7, LABELS.q7)} color={C.purple} />
              <ScaleCard title="Q8 · CTAS decision confidence (1–5)" data={scaleToBar(stats.q8, 1, 5)} avgVal={avgConf} color={C.teal} />
              <BarCard title="Q9 · Would a real-time tool improve accuracy?" data={countToBar(stats.q9, LABELS.q9)} color={C.green} />
              <BarCard title="Q10 · Preferred tool format" data={countToBar(stats.q10, LABELS.q10)} color={C.navy} />
            </div>
          </section>

          <section>
            <SectionHeader title="System Feedback" icon="💬" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="Q11 · Feedback received on triage decisions" data={countToBar(stats.q11, LABELS.q11)} color={C.amber} />
              <ScaleCard title="Q12 · Satisfaction with current triage process (1–5)" data={scaleToBar(stats.q12, 1, 5)} avgVal={avgSat} color={C.navy} />
              <BarCard title="Q13 · Single change to most improve triage quality" data={countToBar(stats.q13, LABELS.q13)} color={C.red} />
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
              <KPICard icon="🎯" label="Avg Accuracy Satisfaction" value={avgAccB || "—"} sub="Triage accuracy (1–5)" color={C.red} />
              <KPICard icon="📈" label="App Adoption Likelihood" value={avgSupportB ? `${avgSupportB}/5` : "—"} sub="Avg likelihood to support" color={C.green} />
              <KPICard icon="⚠️" label="Top Concern" value={topAnswer(stats.qb8, LABELS.qb8)} color={C.amber} />
            </div>
          </section>

          <section>
            <SectionHeader title="Triage Impact" icon="📊" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="QB3 · Mis-triage frequency observed" data={countToBar(stats.qb3, LABELS.qb3)} color={C.red} />
              <BarCard title="QB4 · Most common consequence of mis-triage" data={countToBar(stats.qb4, LABELS.qb4)} color={C.amber} />
              <ScaleCard title="QB5 · Satisfaction with triage accuracy (1–5)" data={scaleToBar(stats.qb5, 1, 5)} avgVal={avgAccB} color={C.red} />
              <BarCard title="QB6 · Does triage affect patient flow?" data={countToBar(stats.qb6, LABELS.qb6)} color={C.navy} />
            </div>
          </section>

          <section>
            <SectionHeader title="Decision Support Readiness" icon="🤖" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BarCard title="QB7 · Would AI-assisted triage benefit the department?" data={countToBar(stats.qb7, LABELS.qb7)} color={C.green} />
              <BarCard title="QB8 · Biggest concern about AI-assisted triage" data={countToBar(stats.qb8, LABELS.qb8)} color={C.purple} />
              <ScaleCard title="QB9 · Likelihood to support AI triage tool adoption (1–5)" data={scaleToBar(stats.qb9, 1, 5)} avgVal={avgSupportB} color={C.green} />
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
                  { label: "Want a decision-support tool", val: pct((stats.q9["yes"] ?? 0), stats.partA || 1) },
                  { label: "Uncertain about CTAS 3+ times/month", val: pct(((stats.q5["3-5"] ?? 0) + (stats.q5["5+"] ?? 0)), stats.partA || 1) },
                  { label: "Currently use no tool", val: pct(stats.q7["nothing"] ?? 0, stats.partA || 1) },
                  { label: "Prefer mobile app format", val: pct(stats.q10["mobile"] ?? 0, stats.partA || 1) },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span style={{ color: C.slate }}>{item.label}</span>
                    <span className="font-bold" style={{ color: C.teal }}>{item.val}</span>
                  </div>
                ))}
              </div>

              {/* Physician readiness */}
              <div className="bg-white rounded-2xl border p-5 shadow-sm space-y-3" style={{ borderColor: C.border }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: C.red }}>👨‍⚕️ Physician/Manager Readiness</p>
                {[
                  { label: "See AI triage as beneficial", val: pct((stats.qb7["yes2"] ?? 0), stats.partB || 1) },
                  { label: "Observe mis-triage daily/weekly", val: pct(((stats.qb3["daily"] ?? 0) + (stats.qb3["weekly"] ?? 0)), stats.partB || 1) },
                  { label: "Report significant flow impact", val: pct(stats.qb6["yes-major"] ?? 0, stats.partB || 1) },
                  { label: "No major AI concerns", val: pct(stats.qb8["noconcern"] ?? 0, stats.partB || 1) },
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

  const fetchData = () => {
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
