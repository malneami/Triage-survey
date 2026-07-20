/**
 * QRPage — /qr
 * Printable QR code page for posting at the triage station
 * Design: Clean white print-ready layout with HMG branding
 */

import { QRCodeSVG } from "qrcode.react";
import { HMG_LOGO_URL } from "@/lib/surveyData";

const SURVEY_URL = "https://malneami.github.io/Triage-survey/";

export default function QRPage() {
  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-[oklch(0.975_0.005_255)] flex flex-col items-center justify-center p-6 print:bg-white print:p-0">
      {/* Print button — hidden when printing */}
      <div className="mb-6 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white shadow-md transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, oklch(0.25_0.07_255), oklch(0.48_0.19_22))" }}
        >
          🖨 Print / Save as PDF
        </button>
      </div>

      {/* Printable card */}
      <div
        className="bg-white rounded-3xl border border-[oklch(0.91_0.01_255)] shadow-xl p-8 max-w-sm w-full text-center space-y-6 print:shadow-none print:border-none print:rounded-none print:max-w-full print:p-10"
        style={{ fontFamily: "'Inter', 'Noto Sans Arabic', sans-serif" }}
      >
        {/* HMG Logo */}
        <div className="flex justify-center">
          <img
            src={HMG_LOGO_URL}
            alt="Dr. Sulaiman Al Habib Medical Group"
            className="h-14 object-contain"
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-[oklch(0.91_0.01_255)]" />

        {/* Title */}
        <div className="space-y-1">
          <h1
            className="text-2xl font-extrabold text-[oklch(0.25_0.07_255)]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Triage Survey
          </h1>
          <p className="text-lg font-semibold text-[oklch(0.42_0.02_255)]">
            استطلاع الفرز
          </p>
          <p className="text-xs text-[oklch(0.62_0.015_255)] font-mono mt-1">
            HMG / QID / 1397
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-2xl border-2 border-[oklch(0.91_0.01_255)] inline-block">
            <QRCodeSVG
              value={SURVEY_URL}
              size={200}
              bgColor="#ffffff"
              fgColor="#1A2B4A"
              level="H"
              marginSize={1}
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-3">
          <div className="bg-[oklch(0.95_0.015_255)] rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-[oklch(0.25_0.07_255)]">
              📱 Scan to complete the survey
            </p>
            <p className="text-sm font-semibold text-[oklch(0.42_0.02_255)]">
              امسح الرمز لإكمال الاستطلاع
            </p>
          </div>

          {/* Info chips */}
          <div className="flex justify-center gap-2 flex-wrap">
            {[
              { icon: "⏱", en: "5–8 min", ar: "٥–٨ دق" },
              { icon: "🔒", en: "Anonymous", ar: "مجهول" },
              { icon: "🌐", en: "EN / AR", ar: "ع / EN" },
            ].map((chip) => (
              <span
                key={chip.en}
                className="inline-flex items-center gap-1 bg-[oklch(0.25_0.07_255)] text-white text-xs font-semibold px-3 py-1 rounded-full"
              >
                {chip.icon} {chip.en} · {chip.ar}
              </span>
            ))}
          </div>
        </div>

        {/* URL fallback */}
        <div className="border border-[oklch(0.91_0.01_255)] rounded-xl p-3">
          <p className="text-xs text-[oklch(0.62_0.015_255)] mb-1">Or visit directly:</p>
          <p className="text-xs font-mono font-semibold text-[oklch(0.48_0.19_22)] break-all">
            {SURVEY_URL}
          </p>
        </div>

        {/* Footer */}
        <div className="h-px bg-[oklch(0.91_0.01_255)]" />
        <p className="text-xs text-[oklch(0.62_0.015_255)]">
          Dr. Sulaiman Al Habib Medical Group — Emergency Departments
          <br />
          مستشفى التخصصي HMG — قسم الطوارئ
        </p>
      </div>
    </div>
  );
}
