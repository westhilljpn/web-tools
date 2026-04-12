"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// FV = P*(1+r)^n + M*((1+r)^n - 1)/r  (月複利)
function futureValue(monthly: number, annualRate: number, years: number, initial: number): number {
  const n = years * 12;
  if (annualRate === 0) return initial + monthly * n;
  const r = annualRate / 100 / 12;
  return initial * Math.pow(1 + r, n) + monthly * (Math.pow(1 + r, n) - 1) / r;
}

interface DataPoint { year: number; total: number; contributions: number; gain: number; }

const BREAKPOINTS = [1, 3, 5, 7, 10, 15, 20, 25, 30];

export default function InvestmentCalculator() {
  const t = useTranslations("investment-calculator");
  const [monthly,  setMonthly]  = useState(30000);
  const [rate,     setRate]     = useState(5);
  const [years,    setYears]    = useState(20);
  const [initial,  setInitial]  = useState(0);

  const chartData: DataPoint[] = useMemo(() => {
    const pts = [...BREAKPOINTS.filter((y) => y < years), years];
    return pts.map((y) => {
      const total = futureValue(monthly, rate, y, initial);
      const contributions = initial + monthly * y * 12;
      return { year: y, total, contributions, gain: total - contributions };
    });
  }, [monthly, rate, years, initial]);

  const final        = chartData[chartData.length - 1];
  const totalPrincipal = initial + monthly * years * 12;
  const totalGain    = final.total - totalPrincipal;
  const gainPct      = totalPrincipal > 0 ? (totalGain / totalPrincipal) * 100 : 0;
  const maxValue     = final.total;

  function amt(n: number): string {
    return t("amount", { value: Math.round(n).toLocaleString() });
  }

  const inputCls = "w-28 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded " +
    "bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-right";
  const unitCls  = "text-sm text-gray-500 dark:text-slate-400 shrink-0";

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 月々の積立額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t("labels.monthly")}
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={1000} max={200000} step={1000} value={monthly}
              onChange={(e) => setMonthly(Number(e.target.value))}
              className="flex-1 accent-primary h-2" />
            <input type="number" min={0} step={1000} value={monthly}
              onChange={(e) => setMonthly(Math.max(0, Number(e.target.value) || 0))}
              className={inputCls} />
            <span className={unitCls}>{t("units.yen")}</span>
          </div>
        </div>

        {/* 初期投資額 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t("labels.initial")}
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={2000000} step={10000} value={initial}
              onChange={(e) => setInitial(Number(e.target.value))}
              className="flex-1 accent-primary h-2" />
            <input type="number" min={0} step={10000} value={initial}
              onChange={(e) => setInitial(Math.max(0, Number(e.target.value) || 0))}
              className={inputCls} />
            <span className={unitCls}>{t("units.yen")}</span>
          </div>
        </div>

        {/* 想定利回り */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t("labels.rate")}
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={15} step={0.1} value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="flex-1 accent-primary h-2" />
            <input type="number" min={0} max={30} step={0.1} value={rate}
              onChange={(e) => setRate(Math.min(30, Math.max(0, Number(e.target.value) || 0)))}
              className={inputCls} />
            <span className={unitCls}>%</span>
          </div>
        </div>

        {/* 積立期間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t("labels.years")}
          </label>
          <div className="flex items-center gap-2">
            <input type="range" min={1} max={40} step={1} value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="flex-1 accent-primary h-2" />
            <input type="number" min={1} max={50} step={1} value={years}
              onChange={(e) => setYears(Math.min(50, Math.max(1, Number(e.target.value) || 1)))}
              className={inputCls} />
            <span className={unitCls}>{t("units.years")}</span>
          </div>
        </div>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">{t("summary.finalValue")}</p>
          <p className="text-2xl font-bold text-primary dark:text-blue-400 mt-1 break-all">{amt(final.total)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">{t("summary.contributions")}</p>
          <p className="text-xl font-bold text-gray-700 dark:text-slate-300 mt-1 break-all">{amt(totalPrincipal)}</p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 dark:text-slate-400">{t("summary.gain")}</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1 break-all">+{amt(totalGain)}</p>
          <p className="text-xs text-green-600 dark:text-green-400">({gainPct >= 0 ? "+" : ""}{gainPct.toFixed(1)}%)</p>
        </div>
      </div>

      {/* 資産推移グラフ */}
      <div>
        <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t("chartTitle")}</p>
        <div className="space-y-2">
          {chartData.map((d) => (
            <div key={d.year} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-slate-400 w-10 shrink-0 text-right">
                {d.year}{t("units.year")}
              </span>
              <div className="flex-1 h-5 rounded overflow-hidden bg-gray-100 dark:bg-slate-700">
                <div className="h-full flex" style={{ width: `${(d.total / maxValue) * 100}%` }}>
                  <div className="bg-primary/70 dark:bg-primary/60 shrink-0"
                    style={{ width: `${Math.min(100, (d.contributions / d.total) * 100)}%` }} />
                  <div className="flex-1 bg-green-400/80 dark:bg-green-500/60" />
                </div>
              </div>
              <span className="text-xs font-mono text-gray-700 dark:text-slate-300 w-28 shrink-0 text-right">
                {amt(d.total)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary/70 inline-block" />{t("legend.contributions")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-green-400/80 inline-block" />{t("legend.gain")}
          </span>
        </div>
      </div>

      {/* 注記 */}
      <p className="text-xs text-gray-400 dark:text-slate-500">{t("disclaimer")}</p>
    </div>
  );
}
