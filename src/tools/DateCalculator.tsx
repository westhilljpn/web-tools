"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// 今日の日付を YYYY-MM-DD 形式で返す
function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface DateResult {
  days: number;
  weeks: number;
  weekRemDays: number;
  months: number;
  monthRemDays: number;
  years: number;
  yearRemDays: number;
}

function calcDiff(startInput: string, endInput: string): DateResult | null {
  const a = new Date(startInput);
  const b = new Date(endInput);
  if (isNaN(a.getTime()) || isNaN(b.getTime())) return null;

  // 常に小さい方を start、大きい方を end として絶対値計算
  const start = a <= b ? a : b;
  const end = a <= b ? b : a;

  const days = Math.round((end.getTime() - start.getTime()) / 86400000);
  const weeks = Math.floor(days / 7);
  const weekRemDays = days % 7;

  // 暦月計算
  let totalMonths =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) totalMonths--;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const monthRemDays = Math.round(
    (end.getTime() -
      new Date(
        start.getFullYear() + years,
        start.getMonth() + months,
        start.getDate()
      ).getTime()) /
      86400000
  );

  return {
    days,
    weeks,
    weekRemDays,
    months: totalMonths,
    monthRemDays,
    years,
    yearRemDays: monthRemDays,
  };
}

export default function DateCalculator() {
  const t = useTranslations("date-calculator");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  const result = useMemo<DateResult | null>(() => {
    if (!startDate || !endDate) return null;
    return calcDiff(startDate, endDate);
  }, [startDate, endDate]);

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // 結果カード定義
  const cards = result
    ? [
        {
          key: "days",
          label: t("labels.days"),
          mainValue: result.days.toLocaleString(),
          unit: t("labels.daysUnit"),
          sub: null,
          copyText: String(result.days),
        },
        {
          key: "weeks",
          label: t("labels.weeks"),
          mainValue: result.weeks.toLocaleString(),
          unit: t("labels.weeksUnit"),
          sub:
            result.weekRemDays > 0
              ? t("labels.remainder", { n: result.weekRemDays })
              : null,
          copyText: String(result.weeks),
        },
        {
          key: "months",
          label: t("labels.months"),
          mainValue: result.months.toLocaleString(),
          unit: t("labels.monthsUnit"),
          sub:
            result.monthRemDays > 0
              ? t("labels.remainder", { n: result.monthRemDays })
              : null,
          copyText: String(result.months),
        },
        {
          key: "years",
          label: t("labels.years"),
          mainValue: result.years.toLocaleString(),
          unit: t("labels.yearsUnit"),
          sub:
            result.yearRemDays > 0
              ? t("labels.remainder", { n: result.yearRemDays })
              : null,
          copyText: String(result.years),
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* 日付入力エリア */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 開始日 */}
        <div>
          <label
            htmlFor="start-date"
            className="block text-sm font-medium text-primary mb-2"
          >
            {t("labels.startDate")}
          </label>
          <div className="flex gap-2">
            <input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-sky-soft rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         bg-white text-primary"
            />
            <button
              type="button"
              onClick={() => setStartDate(todayStr())}
              className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium
                         bg-sky text-primary border border-sky-soft
                         hover:bg-primary hover:text-white transition-colors"
            >
              {t("labels.today")}
            </button>
          </div>
        </div>

        {/* 終了日 */}
        <div>
          <label
            htmlFor="end-date"
            className="block text-sm font-medium text-primary mb-2"
          >
            {t("labels.endDate")}
          </label>
          <div className="flex gap-2">
            <input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 px-3 py-2.5 border border-sky-soft rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                         bg-white text-primary"
            />
            <button
              type="button"
              onClick={() => setEndDate(todayStr())}
              className="shrink-0 px-3 py-2 rounded-lg text-xs font-medium
                         bg-sky text-primary border border-sky-soft
                         hover:bg-primary hover:text-white transition-colors"
            >
              {t("labels.today")}
            </button>
          </div>
        </div>
      </div>

      {/* 結果エリア */}
      {result && (
        <div className="grid grid-cols-2 gap-3">
          {cards.map(({ key, label, mainValue, unit, sub, copyText }) => (
            <div
              key={key}
              className="bg-surface border border-sky-soft rounded-xl p-4 flex flex-col gap-2"
            >
              <p className="text-xs font-medium text-steel">{label}</p>
              <div className="flex items-end gap-1">
                <span className="text-2xl font-bold text-primary leading-none">
                  {mainValue}
                </span>
                <span className="text-sm text-steel pb-0.5">{unit}</span>
              </div>
              {sub && (
                <p className="text-xs text-steel">{sub}</p>
              )}
              <button
                type="button"
                onClick={() => handleCopy(key, copyText)}
                className="mt-auto self-start px-2 py-0.5 rounded text-xs
                           bg-sky text-primary hover:bg-primary hover:text-white
                           border border-sky-soft transition-colors"
              >
                {copiedKey === key ? t("ui.copied") : t("ui.copy")}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 未入力ヒント */}
      {(!startDate || !endDate) && (
        <p className="text-sm text-steel text-center py-4">
          {startDate === "" && endDate === ""
            ? t("ui.hintBoth")
            : t("ui.hintOne")}
        </p>
      )}

      {/* コピー完了トースト */}
      {copiedKey && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white
                      text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50"
        >
          {t("ui.copied")}
        </div>
      )}
    </div>
  );
}
