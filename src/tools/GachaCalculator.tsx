"use client";
import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// P = 1 - (1 - rate/100)^pulls
function cumProb(rate: number, pulls: number): number {
  if (rate <= 0) return 0;
  if (rate >= 100) return 100;
  return (1 - Math.pow(1 - rate / 100, pulls)) * 100;
}

// n = ceil(log(1-target/100) / log(1-rate/100))
function pullsNeeded(rate: number, target: number): number {
  if (rate <= 0 || target >= 100) return Infinity;
  if (target <= 0) return 0;
  return Math.ceil(Math.log(1 - target / 100) / Math.log(1 - rate / 100));
}

const TABLE_N = [1, 5, 10, 30, 50, 100, 200, 300, 500];
const TARGETS = [50, 80, 90, 95, 99] as const;

function probColor(p: number): string {
  if (p >= 90) return "text-green-600 dark:text-green-400";
  if (p >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

export default function GachaCalculator() {
  const t = useTranslations("gacha-calculator");
  const [rate, setRate]   = useState(3);
  const [pulls, setPulls] = useState(10);

  const [copied, setCopied] = useState(false);

  const currentProb = useMemo(() => cumProb(rate, pulls), [rate, pulls]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${currentProb.toFixed(2)}%`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }

  const tableRows = useMemo(
    () => TABLE_N.map((n) => ({ n, prob: cumProb(rate, n) })),
    [rate]
  );

  const targetRows = useMemo(
    () => TARGETS.map((pct) => ({ pct, n: pullsNeeded(rate, pct) })),
    [rate]
  );

  function handleRate(v: number) {
    setRate(Math.min(100, Math.max(0.01, v)));
  }
  function handlePulls(v: number) {
    setPulls(Math.max(1, Math.min(99999, v)));
  }

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 確率 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t("labels.rate")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={0.1} max={99} step={0.1} value={rate}
              onChange={(e) => handleRate(parseFloat(e.target.value))}
              className="flex-1 accent-primary h-2"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number" min={0.01} max={100} step={0.01} value={rate}
                onChange={(e) => handleRate(parseFloat(e.target.value) || 0.01)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-right"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400">%</span>
            </div>
          </div>
        </div>

        {/* 試行回数 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            {t("labels.pulls")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range" min={1} max={1000} step={1} value={Math.min(pulls, 1000)}
              onChange={(e) => handlePulls(parseInt(e.target.value))}
              className="flex-1 accent-primary h-2"
            />
            <div className="flex items-center gap-1 shrink-0">
              <input
                type="number" min={1} max={99999} step={1} value={pulls}
                onChange={(e) => handlePulls(parseInt(e.target.value) || 1)}
                className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded
                           bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 text-right"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400">{t("labels.times")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* メイン結果 */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-xl px-6 py-8 text-center relative">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 px-3 py-1 text-xs font-medium rounded
                     border border-sky-soft dark:border-sky/30
                     bg-surface dark:bg-primary/20
                     text-steel dark:text-sky/80
                     hover:bg-sky/20 dark:hover:bg-sky/10 transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{t("labels.result")}</p>
        <p className={`text-6xl font-bold tabular-nums ${probColor(currentProb)}`}>
          {currentProb.toFixed(1)}<span className="text-3xl">%</span>
        </p>
        <p className="mt-3 text-xs text-gray-400 dark:text-slate-500">
          {t("labels.rateDesc", { rate, pulls })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 目標確率到達回数 */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t("labels.targetTitle")}
          </p>
          <div className="space-y-1.5">
            {targetRows.map(({ pct, n }) => (
              <div key={pct} className="flex justify-between items-center text-sm
                                        bg-gray-50 dark:bg-slate-800 rounded px-3 py-2">
                <span className="text-gray-600 dark:text-slate-400">{pct}%{t("labels.reach")}</span>
                <span className="font-bold font-mono text-gray-900 dark:text-slate-100">
                  {n === Infinity ? "∞" : `${n.toLocaleString()}${t("labels.times")}`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 累積確率テーブル */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
            {t("labels.tableTitle")}
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-slate-400 border-b border-gray-200 dark:border-slate-700">
                <th className="pb-1.5 text-left font-medium">{t("labels.pullCount")}</th>
                <th className="pb-1.5 text-right font-medium">{t("labels.cumProb")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {tableRows.map(({ n, prob }) => (
                <tr key={n} className={pulls === n ? "bg-blue-50 dark:bg-blue-900/10 rounded" : ""}>
                  <td className="py-1 text-gray-700 dark:text-slate-300">
                    {n.toLocaleString()}{t("labels.times")}
                  </td>
                  <td className={`py-1 text-right font-mono font-bold ${probColor(prob)}`}>
                    {prob.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
