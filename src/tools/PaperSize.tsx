"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

type Unit = "mm" | "cm" | "inch";
type Tab = "a" | "isoB" | "jisB" | "us" | "photo";

interface Paper { name: string; w: number; h: number; noteKey?: string; }
interface Photo { nameKey: string; w: number; h: number; }

const A: Paper[] = [
  { name: "A0", w: 841, h: 1189 },
  { name: "A1", w: 594, h: 841 },
  { name: "A2", w: 420, h: 594 },
  { name: "A3", w: 297, h: 420, noteKey: "a3" },
  { name: "A4", w: 210, h: 297, noteKey: "a4" },
  { name: "A5", w: 148, h: 210, noteKey: "a5" },
  { name: "A6", w: 105, h: 148 },
  { name: "A7", w: 74, h: 105 },
  { name: "A8", w: 52, h: 74 },
];
const ISO_B: Paper[] = [
  { name: "B0", w: 1000, h: 1414 },
  { name: "B1", w: 707, h: 1000 },
  { name: "B2", w: 500, h: 707 },
  { name: "B3", w: 353, h: 500 },
  { name: "B4", w: 250, h: 353 },
  { name: "B5", w: 176, h: 250 },
  { name: "B6", w: 125, h: 176 },
  { name: "B7", w: 88, h: 125 },
  { name: "B8", w: 62, h: 88 },
];
const JIS_B: Paper[] = [
  { name: "B0", w: 1030, h: 1456 },
  { name: "B1", w: 728, h: 1030 },
  { name: "B2", w: 515, h: 728 },
  { name: "B3", w: 364, h: 515 },
  { name: "B4", w: 257, h: 364, noteKey: "b4" },
  { name: "B5", w: 182, h: 257, noteKey: "b5" },
  { name: "B6", w: 128, h: 182 },
  { name: "B7", w: 91, h: 128 },
  { name: "B8", w: 64, h: 91 },
];
const US: Paper[] = [
  { name: "Letter",          w: 216, h: 279, noteKey: "letter" },
  { name: "Legal",           w: 216, h: 356, noteKey: "legal" },
  { name: "Tabloid / Ledger", w: 279, h: 432, noteKey: "tabloid" },
  { name: "Executive",       w: 184, h: 267 },
  { name: "Half Letter",     w: 140, h: 216 },
];
const PHOTOS: Photo[] = [
  { nameKey: "standard", w: 30, h: 40 },
  { nameKey: "large",    w: 33, h: 48 },
  { nameKey: "passport", w: 35, h: 45 },
  { nameKey: "small",    w: 25, h: 30 },
];

const TABS: { key: Tab; labelKey: string }[] = [
  { key: "a",    labelKey: "a" },
  { key: "isoB", labelKey: "isoB" },
  { key: "jisB", labelKey: "jisB" },
  { key: "us",   labelKey: "us" },
  { key: "photo",labelKey: "photo" },
];
const UNITS: Unit[] = ["mm", "cm", "inch"];

function fmt(mm: number, unit: Unit): string {
  if (unit === "mm")   return String(mm);
  if (unit === "cm")   return (mm / 10).toFixed(1);
  return (mm / 25.4).toFixed(2);
}
function fmtSize(w: number, h: number, unit: Unit): string {
  return `${fmt(w, unit)} × ${fmt(h, unit)}`;
}

export default function PaperSize() {
  const t = useTranslations("paper-size");
  const [unit, setUnit] = useState<Unit>("mm");
  const [tab, setTab] = useState<Tab>("a");

  const rows: Paper[] =
    tab === "a" ? A : tab === "isoB" ? ISO_B : tab === "jisB" ? JIS_B : tab === "us" ? US : [];

  const thCls = "pb-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400";
  const tdCls = "py-2";

  return (
    <div className="space-y-4">
      {/* 単位切替 */}
      <div className="flex gap-2 flex-wrap">
        {UNITS.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => setUnit(u)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              unit === u
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
          >
            {t(`units.${u}`)}
          </button>
        ))}
      </div>

      {/* タブ */}
      <div className="flex flex-wrap gap-1.5 border-b border-gray-200 dark:border-slate-700 pb-2">
        {TABS.map(({ key, labelKey }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              tab === key
                ? "bg-blue-50 dark:bg-slate-700 text-primary dark:text-blue-400 border border-primary/40"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200"
            }`}
          >
            {t(`tabs.${labelKey}`)}
          </button>
        ))}
      </div>

      {/* JIS注記 */}
      {tab === "jisB" && (
        <p className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded px-3 py-2">
          {t("jisNote")}
        </p>
      )}

      {/* テーブル */}
      <div className="overflow-x-auto">
        {tab !== "photo" ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className={`${thCls} w-20 pr-4`}>{t("tableHeaders.name")}</th>
                <th className={`${thCls} pr-4`}>{t("tableHeaders.size")}</th>
                <th className={thCls}>{t("tableHeaders.note")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {rows.map((p) => (
                <tr key={p.name}>
                  <td className={`${tdCls} pr-4 font-mono font-bold text-primary dark:text-blue-400`}>{p.name}</td>
                  <td className={`${tdCls} pr-4 font-mono text-xs text-gray-700 dark:text-slate-300`}>{fmtSize(p.w, p.h, unit)}</td>
                  <td className={`${tdCls} text-xs text-gray-500 dark:text-slate-400`}>
                    {p.noteKey ? t(`notes.${p.noteKey}`) : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className={`${thCls} pr-4`}>{t("tableHeaders.note")}</th>
                <th className={thCls}>{t("tableHeaders.size")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {PHOTOS.map((p) => (
                <tr key={p.nameKey}>
                  <td className={`${tdCls} pr-4 text-gray-800 dark:text-slate-200`}>{t(`photoNotes.${p.nameKey}`)}</td>
                  <td className={`${tdCls} font-mono text-xs text-gray-700 dark:text-slate-300`}>{fmtSize(p.w, p.h, unit)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
