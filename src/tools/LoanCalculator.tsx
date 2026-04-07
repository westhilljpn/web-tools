"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

interface LoanResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  months: number;
}

function calcLoan(
  principal: number,
  annualRate: number,
  months: number
): LoanResult {
  if (annualRate === 0) {
    // 無利子の場合
    const monthly = principal / months;
    return {
      monthlyPayment: monthly,
      totalPayment: principal,
      totalInterest: 0,
      months,
    };
  }
  const r = annualRate / 100 / 12;
  const pow = Math.pow(1 + r, months);
  const monthly = (principal * r * pow) / (pow - 1);
  const totalPayment = monthly * months;
  const totalInterest = totalPayment - principal;
  return {
    monthlyPayment: monthly,
    totalPayment,
    totalInterest,
    months,
  };
}

function fmt(n: number, locale: string): string {
  return n.toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export default function LoanCalculator() {
  const t = useTranslations("loan-calculator");

  const [principal, setPrincipal] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [termYears, setTermYears] = useState("");
  const [termMonths, setTermMonths] = useState("");

  const result = useMemo<LoanResult | null>(() => {
    const p = parseFloat(principal);
    const r = parseFloat(annualRate);
    const years = parseInt(termYears) || 0;
    const months = parseInt(termMonths) || 0;
    const totalMonths = years * 12 + months;

    if (!p || p <= 0 || r < 0 || r > 100 || totalMonths <= 0) return null;
    return calcLoan(p, r, totalMonths);
  }, [principal, annualRate, termYears, termMonths]);

  // 利息割合（円グラフ用）
  const interestRatio = result
    ? (result.totalInterest / result.totalPayment) * 100
    : 0;

  return (
    <div className="space-y-5">
      {/* 入力フォーム */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 借入金額 */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("principalLabel")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder={t("principalPlaceholder")}
              min="1"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* 年利 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("rateLabel")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              placeholder="3.0"
              min="0" max="100" step="0.1"
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
          </div>
        </div>

        {/* 返済期間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("termLabel")}
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="number"
                value={termYears}
                onChange={(e) => setTermYears(e.target.value)}
                placeholder="35"
                min="0" max="50"
                className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                {t("yearsUnit")}
              </span>
            </div>
            <div className="relative flex-1">
              <input
                type="number"
                value={termMonths}
                onChange={(e) => setTermMonths(e.target.value)}
                placeholder="0"
                min="0" max="11"
                className="w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                {t("monthsUnit")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 結果 */}
      {result && (
        <div className="space-y-4">
          {/* 月々返済額（メイン） */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("results.monthly")}</p>
            <p className="text-4xl font-bold text-primary">
              {t("results.currency")}{fmt(result.monthlyPayment, "ja")}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {t("results.perMonth")}
            </p>
          </div>

          {/* 内訳 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard
              label={t("results.principal")}
              value={`${t("results.currency")}${fmt(parseFloat(principal), "ja")}`}
              color="text-primary"
            />
            <ResultCard
              label={t("results.totalInterest")}
              value={`${t("results.currency")}${fmt(result.totalInterest, "ja")}`}
              color="text-orange-500"
            />
            <ResultCard
              label={t("results.totalPayment")}
              value={`${t("results.currency")}${fmt(result.totalPayment, "ja")}`}
              color="text-gray-800"
            />
          </div>

          {/* 利息割合バー */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{t("results.principalRatio", { pct: Math.round(100 - interestRatio) })}</span>
              <span>{t("results.interestRatio", { pct: Math.round(interestRatio) })}</span>
            </div>
            <div className="flex rounded-full overflow-hidden h-4">
              <div
                className="bg-primary transition-all"
                style={{ width: `${100 - interestRatio}%` }}
              />
              <div
                className="bg-orange-400 transition-all"
                style={{ width: `${interestRatio}%` }}
              />
            </div>
          </div>

          {/* 返済期間表示 */}
          <p className="text-xs text-gray-400 text-center">
            {t("results.termSummary", { months: result.months })}
          </p>
        </div>
      )}

      {!result && (
        <p className="text-sm text-gray-400 text-center py-4">{t("hint")}</p>
      )}

      {/* 免責事項 */}
      <p className="text-xs text-gray-400">{t("disclaimer")}</p>
    </div>
  );
}

interface ResultCardProps {
  label: string;
  value: string;
  color?: string;
}

function ResultCard({ label, value, color = "text-gray-800" }: ResultCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${color} break-all`}>{value}</p>
    </div>
  );
}
