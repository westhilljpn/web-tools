"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";

// ---- cron パーサーロジック ----

const MONTH_NAMES = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const DOW_NAMES   = ["SUN","MON","TUE","WED","THU","FRI","SAT"];

function expandField(field: string, min: number, max: number): number[] | null {
  if (field === "*") return null; // wildcard

  const result = new Set<number>();

  for (const part of field.split(",")) {
    // */step
    if (part.startsWith("*/")) {
      const step = parseInt(part.slice(2));
      if (isNaN(step) || step <= 0) return null;
      for (let i = min; i <= max; i += step) result.add(i);
      continue;
    }
    // range: a-b or a-b/step
    if (part.includes("-")) {
      const [rangePart, stepStr] = part.split("/");
      const [loStr, hiStr] = rangePart.split("-");
      const lo = parseInt(loStr);
      const hi = parseInt(hiStr);
      const step = stepStr ? parseInt(stepStr) : 1;
      if (isNaN(lo) || isNaN(hi) || isNaN(step) || step <= 0) return null;
      for (let i = lo; i <= hi; i += step) {
        if (i >= min && i <= max) result.add(i);
      }
      continue;
    }
    // single value + optional /step
    const [valStr, stepStr] = part.split("/");
    const val = parseInt(valStr);
    if (isNaN(val)) return null;
    if (stepStr) {
      const step = parseInt(stepStr);
      if (isNaN(step) || step <= 0) return null;
      for (let i = val; i <= max; i += step) result.add(i);
    } else {
      if (val >= min && val <= max) result.add(val);
    }
  }
  return Array.from(result).sort((a, b) => a - b);
}

function normalizeDow(field: string): string {
  return field.replace(/\b7\b/, "0")
    .replace(/SUN/gi,"0").replace(/MON/gi,"1").replace(/TUE/gi,"2")
    .replace(/WED/gi,"3").replace(/THU/gi,"4").replace(/FRI/gi,"5").replace(/SAT/gi,"6");
}

function normalizeMonth(field: string): string {
  return MONTH_NAMES.reduce((s, name, i) =>
    s.replace(new RegExp(name, "gi"), String(i + 1)), field);
}

interface ParsedCron {
  minutes: number[] | null;
  hours: number[] | null;
  doms: number[] | null;
  months: number[] | null;
  dows: number[] | null;
}

function parseCron(expr: string): ParsedCron | null {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minF, hrF, domF, monF, dowF] = parts;
  const minutes = expandField(minF, 0, 59);
  const hours   = expandField(hrF, 0, 23);
  const doms    = expandField(domF, 1, 31);
  const months  = expandField(normalizeMonth(monF), 1, 12);
  const dows    = expandField(normalizeDow(dowF), 0, 6);

  if (minutes === undefined || hours === undefined ||
      doms === undefined || months === undefined || dows === undefined) return null;

  // 展開が空の場合は無効
  if ((minutes !== null && minutes.length === 0) ||
      (hours   !== null && hours.length   === 0) ||
      (doms    !== null && doms.length    === 0) ||
      (months  !== null && months.length  === 0) ||
      (dows    !== null && dows.length    === 0)) return null;

  return { minutes, hours, doms, months, dows };
}

function getNextRuns(parsed: ParsedCron, count: number): Date[] {
  const results: Date[] = [];
  const now = new Date();
  // 1分後からスタート
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes() + 1, 0, 0);

  const { minutes, hours, doms, months, dows } = parsed;
  const domIsWild = doms === null;
  const dowIsWild = dows === null;

  const MAX_ITER = 525_600; // 1年分の分数
  let iter = 0;

  while (results.length < count && iter < MAX_ITER) {
    iter++;
    const mon = d.getMonth() + 1;
    const dom = d.getDate();
    const dow = d.getDay();
    const hr  = d.getHours();
    const min = d.getMinutes();

    const matchMon = months === null || months.includes(mon);
    const matchHr  = hours   === null || hours.includes(hr);
    const matchMin = minutes === null || minutes.includes(min);

    // DOM/DOW: 両方ワイルドカードでなければ OR 条件
    let matchDay: boolean;
    if (domIsWild && dowIsWild) {
      matchDay = true;
    } else if (!domIsWild && !dowIsWild) {
      matchDay = (doms!.includes(dom) || dows!.includes(dow));
    } else if (!domIsWild) {
      matchDay = doms!.includes(dom);
    } else {
      matchDay = dows!.includes(dow);
    }

    if (matchMon && matchDay && matchHr && matchMin) {
      results.push(new Date(d.getTime()));
    }

    d.setMinutes(d.getMinutes() + 1);
  }
  return results;
}

// ---- 人間が読める説明生成 ----

function describeField(field: string, type: "min" | "hr" | "dom" | "mon" | "dow", locale: string): string {
  if (field === "*") return "";

  const isJa = locale === "ja";

  if (field.startsWith("*/")) {
    const n = field.slice(2);
    if (type === "min") return isJa ? `${n}分ごと` : `every ${n} minutes`;
    if (type === "hr")  return isJa ? `${n}時間ごと` : `every ${n} hours`;
    if (type === "dom") return isJa ? `${n}日ごと` : `every ${n} days`;
    if (type === "mon") return isJa ? `${n}ヶ月ごと` : `every ${n} months`;
    if (type === "dow") return isJa ? `${n}曜日ごと` : `every ${n} weekdays`;
  }

  const months_ja = ["1","2","3","4","5","6","7","8","9","10","11","12"];
  const months_en = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const days_ja   = ["日","月","火","水","木","金","土"];
  const days_en   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  if (type === "mon") {
    const nums = field.split(",").map(Number);
    const names = nums.map((n) => isJa ? `${months_ja[n-1]}月` : months_en[n-1]);
    return isJa ? names.join("・") : names.join(", ");
  }
  if (type === "dow") {
    const normField = normalizeDow(field);
    const nums = normField.split(",").map(Number);
    const names = nums.map((n) => isJa ? `${days_ja[n]}曜日` : days_en[n]);
    return isJa ? names.join("・") : names.join(", ");
  }

  return field;
}

function buildDescription(expr: string, locale: string): string {
  const isJa = locale === "ja";
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "";
  const [minF, hrF, domF, monF, dowF] = parts;

  const segments: string[] = [];

  // 分
  if (minF === "*") {
    segments.push(isJa ? "毎分" : "every minute");
  } else if (minF.startsWith("*/")) {
    segments.push(describeField(minF, "min", locale));
  } else {
    const mins = expandField(minF, 0, 59);
    if (mins && mins.length === 1) {
      segments.push(isJa ? `${mins[0]}分` : `at minute ${mins[0]}`);
    } else if (mins) {
      segments.push(isJa ? `${mins.join("・")}分` : `at minutes ${mins.join(", ")}`);
    }
  }

  // 時
  if (hrF !== "*") {
    if (hrF.startsWith("*/")) {
      segments.push(describeField(hrF, "hr", locale));
    } else {
      const hrs = expandField(hrF, 0, 23);
      if (hrs && hrs.length === 1) {
        segments.push(isJa ? `${hrs[0]}時` : `at ${hrs[0]}:00`);
      } else if (hrs) {
        segments.push(isJa ? `${hrs.join("・")}時` : `at hours ${hrs.join(", ")}`);
      }
    }
  }

  // 曜日
  if (dowF !== "*") {
    const d = describeField(normalizeDow(dowF), "dow", locale);
    if (d) segments.push(d);
  }

  // 日
  if (domF !== "*") {
    const d = describeField(domF, "dom", locale);
    if (d) segments.push(isJa ? `毎月${d}日` : `on day ${d}`);
  }

  // 月
  if (monF !== "*") {
    const d = describeField(normalizeMonth(monF), "mon", locale);
    if (d) segments.push(d);
  }

  return isJa ? segments.join("、") : segments.join(", ");
}

// ---- プリセット ----
const PRESETS = [
  { key: "every_minute",  value: "* * * * *"    },
  { key: "every_5min",    value: "*/5 * * * *"   },
  { key: "every_hour",    value: "0 * * * *"     },
  { key: "daily_midnight",value: "0 0 * * *"     },
  { key: "daily_noon",    value: "0 12 * * *"    },
  { key: "weekly_monday", value: "0 0 * * 1"     },
  { key: "monthly_first", value: "0 0 1 * *"     },
  { key: "workdays",      value: "0 9 * * 1-5"   },
];

// ---- コンポーネント ----

export default function CronParser() {
  const t = useTranslations("cron-parser");
  const locale = useLocale();
  const [expr, setExpr] = useState("*/5 * * * *");
  const [toast, setToast] = useState(false);

  const result = useMemo(() => {
    const parsed = parseCron(expr);
    if (!parsed) return null;
    return {
      nextRuns: getNextRuns(parsed, 10),
      description: buildDescription(expr, locale),
    };
  }, [expr, locale]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  const fields = expr.trim().split(/\s+/);
  const fieldLabels = [t("labels.minute"), t("labels.hour"), t("labels.dom"), t("labels.month"), t("labels.dow")];

  return (
    <div className="space-y-5">
      {/* 入力 */}
      <div>
        <div className="flex gap-2">
          <input
            type="text"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            placeholder={t("placeholder")}
            spellCheck={false}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <button type="button" onClick={() => setExpr("")}
            className="btn-secondary text-sm px-3 py-2 shrink-0">{t("buttons.clear")}</button>
        </div>
        {expr && !result && (
          <p className="mt-1 text-xs text-red-500">{t("results.invalid")}</p>
        )}
      </div>

      {/* フィールドラベル */}
      {fields.length === 5 && (
        <div className="grid grid-cols-5 gap-1 text-center">
          {fields.map((f, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg px-1 py-2">
              <p className="text-xs text-gray-400 mb-0.5">{fieldLabels[i]}</p>
              <p className="text-sm font-mono font-semibold text-gray-800">{f}</p>
            </div>
          ))}
        </div>
      )}

      {/* プリセット */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2">{t("presets.label")}</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(({ key, value }) => (
            <button
              key={key}
              type="button"
              onClick={() => setExpr(value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                expr === value
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {t(`presets.${key}`)}
            </button>
          ))}
        </div>
      </div>

      {/* 説明 */}
      {result && (
        <>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
            <p className="text-xs font-medium text-blue-600 mb-1">{t("results.description")}</p>
            <p className="text-sm font-medium text-gray-800">{result.description}</p>
          </div>

          {/* 次回実行時刻 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">{t("results.nextRuns")}</p>
            <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
              {result.nextRuns.map((d, i) => (
                <li key={i}
                  className="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-50 group">
                  <span className="text-xs text-gray-400 w-4 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-sm font-mono text-gray-800">
                    {d.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(d.toISOString())}
                    className="text-xs text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-colors shrink-0"
                  >
                    {t("buttons.copy")}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {!expr && (
        <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("results.copied")}
        </div>
      )}
    </div>
  );
}
