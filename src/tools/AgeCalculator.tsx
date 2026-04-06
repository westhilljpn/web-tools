"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalMonths: number;
  totalWeeks: number;
  nextBirthday: { months: number; days: number };
}

function calcAge(birthDate: Date, baseDate: Date): AgeResult {
  let years = baseDate.getFullYear() - birthDate.getFullYear();
  let months = baseDate.getMonth() - birthDate.getMonth();
  let days = baseDate.getDate() - birthDate.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(baseDate.getFullYear(), baseDate.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.floor(
    (baseDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const totalMonths = years * 12 + months;
  const totalWeeks = Math.floor(totalDays / 7);

  // 次の誕生日までの残り日数
  const thisYear = baseDate.getFullYear();
  let nextBirthdayDate = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());
  if (nextBirthdayDate <= baseDate) {
    nextBirthdayDate = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
  }
  const remainMs = nextBirthdayDate.getTime() - baseDate.getTime();
  const remainDays = Math.ceil(remainMs / (1000 * 60 * 60 * 24));
  const remainMonths = Math.floor(remainDays / 30);
  const remainDaysRem = remainDays - remainMonths * 30;

  return {
    years,
    months,
    days,
    totalDays,
    totalMonths,
    totalWeeks,
    nextBirthday: { months: remainMonths, days: remainDaysRem },
  };
}

// 今日の日付を YYYY-MM-DD 形式で返す
function todayStr(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AgeCalculator() {
  const t = useTranslations("age-calculator");
  const [birthInput, setBirthInput] = useState("");
  const [baseInput, setBaseInput] = useState(todayStr());

  const result = useMemo<AgeResult | null>(() => {
    if (!birthInput || !baseInput) return null;
    const birth = new Date(birthInput);
    const base = new Date(baseInput);
    if (isNaN(birth.getTime()) || isNaN(base.getTime())) return null;
    if (birth >= base) return null;
    return calcAge(birth, base);
  }, [birthInput, baseInput]);

  const isError = birthInput && baseInput && !result;

  return (
    <div className="space-y-5">
      {/* 入力フォーム */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="birth-date" className="block text-sm font-medium text-gray-700 mb-2">
            {t("birthLabel")}
          </label>
          <input
            id="birth-date"
            type="date"
            value={birthInput}
            onChange={(e) => setBirthInput(e.target.value)}
            max={todayStr()}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label htmlFor="base-date" className="block text-sm font-medium text-gray-700 mb-2">
            {t("baseDateLabel")}
          </label>
          <div className="flex gap-2">
            <input
              id="base-date"
              type="date"
              value={baseInput}
              onChange={(e) => setBaseInput(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setBaseInput(todayStr())}
              className="btn-secondary text-xs px-3 py-2 shrink-0"
            >
              {t("buttons.today")}
            </button>
          </div>
        </div>
      </div>

      {/* エラー表示 */}
      {isError && (
        <p className="text-sm text-red-500">{t("error.invalid")}</p>
      )}

      {/* 結果表示 */}
      {result && (
        <div className="space-y-4">
          {/* メイン: 満年齢 */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("results.age")}</p>
            <p className="text-5xl font-bold text-primary">
              {result.years}
            </p>
            <p className="text-sm text-gray-500 mt-1">{t("results.yearsUnit")}</p>
            {(result.months > 0 || result.days > 0) && (
              <p className="text-sm text-gray-600 mt-2">
                {t("results.detail", {
                  months: result.months,
                  days: result.days,
                })}
              </p>
            )}
          </div>

          {/* サブ統計 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StatCard
              label={t("results.totalDays")}
              value={result.totalDays.toLocaleString()}
              unit={t("results.daysUnit")}
            />
            <StatCard
              label={t("results.totalWeeks")}
              value={result.totalWeeks.toLocaleString()}
              unit={t("results.weeksUnit")}
            />
            <StatCard
              label={t("results.totalMonths")}
              value={result.totalMonths.toLocaleString()}
              unit={t("results.monthsUnit")}
            />
          </div>

          {/* 次の誕生日 */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
            <span className="font-medium text-gray-700">{t("results.nextBirthday")}: </span>
            {result.nextBirthday.months === 0 && result.nextBirthday.days === 0
              ? t("results.today")
              : t("results.nextBirthdayDetail", {
                  months: result.nextBirthday.months,
                  days: result.nextBirthday.days,
                })}
          </div>
        </div>
      )}

      {!birthInput && (
        <p className="text-sm text-gray-400 text-center py-4">{t("hint")}</p>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  unit: string;
}

function StatCard({ label, value, unit }: StatCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-800">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  );
}
