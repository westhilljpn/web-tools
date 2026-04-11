"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Mode = "basic" | "whatPercent" | "change" | "reverse";

function formatResult(n: number): string {
  if (!isFinite(n)) return "—";
  // 最大6桁の有効数字、末尾ゼロを除去
  const rounded = parseFloat(n.toPrecision(6));
  return rounded.toLocaleString(undefined, { maximumFractionDigits: 6 });
}

function calcBasic(pct: number, val: number): number {
  return (pct / 100) * val;
}

function calcWhatPercent(x: number, y: number): number {
  return (x / y) * 100;
}

function calcChange(from: number, to: number): { pct: number; direction: "increase" | "decrease" } {
  const pct = ((to - from) / Math.abs(from)) * 100;
  return { pct, direction: pct >= 0 ? "increase" : "decrease" };
}

function calcReverse(val: number, pct: number, direction: "increase" | "decrease"): number {
  return direction === "increase" ? val / (1 + pct / 100) : val / (1 - pct / 100);
}

const MODES: Mode[] = ["basic", "whatPercent", "change", "reverse"];

export default function PercentageCalculator() {
  const t = useTranslations("percentage-calculator");
  const [mode, setMode] = useState<Mode>("basic");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [reverseDir, setReverseDir] = useState<"increase" | "decrease">("increase");
  const [toast, setToast] = useState(false);

  const result = useMemo(() => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return null;
    if (nb === 0 && (mode === "whatPercent" || mode === "change")) return null;

    switch (mode) {
      case "basic":
        return { value: formatResult(calcBasic(na, nb)), label: "" };
      case "whatPercent":
        return { value: formatResult(calcWhatPercent(na, nb)) + "%", label: "" };
      case "change": {
        const { pct, direction } = calcChange(na, nb);
        return {
          value: formatResult(Math.abs(pct)) + "%",
          label: direction === "increase" ? t("labels.increase") : t("labels.decrease"),
          isIncrease: direction === "increase",
        };
      }
      case "reverse": {
        const pct = parseFloat(a);
        const val = parseFloat(b);
        if (isNaN(pct) || isNaN(val)) return null;
        if (reverseDir === "decrease" && pct >= 100) return null;
        return { value: formatResult(calcReverse(val, pct, reverseDir)), label: t("labels.original") };
      }
    }
  }, [mode, a, b, reverseDir, t]);

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result.value);
    setToast(true);
    setTimeout(() => setToast(false), 1800);
  };

  const handleClear = () => { setA(""); setB(""); };

  // モード別の入力フィールド定義
  const renderInputs = () => {
    const inputClass =
      "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

    switch (mode) {
      case "basic":
        return (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.percentage")}</label>
              <input type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder={t("placeholders.percent")} className={inputClass} />
            </div>
            <span className="text-sm text-gray-500 pb-2.5 shrink-0">{t("labels.of")}</span>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.value")}</label>
              <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder={t("placeholders.value")} className={inputClass} />
            </div>
          </div>
        );

      case "whatPercent":
        return (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.value")} (X)</label>
              <input type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder={t("placeholders.value")} className={inputClass} />
            </div>
            <span className="text-sm text-gray-500 pb-2.5 shrink-0">{t("labels.of")}</span>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.value")} (Y)</label>
              <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder={t("placeholders.value")} className={inputClass} />
            </div>
          </div>
        );

      case "change":
        return (
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.from")}</label>
              <input type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder={t("placeholders.from")} className={inputClass} />
            </div>
            <span className="text-sm text-gray-500 pb-2.5 shrink-0">→</span>
            <div className="flex-1 min-w-[100px]">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.to")}</label>
              <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder={t("placeholders.to")} className={inputClass} />
            </div>
          </div>
        );

      case "reverse":
        return (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.after")}</label>
                <input type="number" value={b} onChange={(e) => setB(e.target.value)} placeholder={t("placeholders.value")} className={inputClass} />
              </div>
              <span className="text-sm text-gray-500 pb-2.5 shrink-0">/</span>
              <div className="flex-1 min-w-[100px]">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">{t("labels.percentage")}</label>
                <input type="number" value={a} onChange={(e) => setA(e.target.value)} placeholder={t("placeholders.percent")} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-3">
              {(["increase", "decrease"] as const).map((dir) => (
                <label key={dir} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                  <input
                    type="radio"
                    name="reverseDir"
                    value={dir}
                    checked={reverseDir === dir}
                    onChange={() => setReverseDir(dir)}
                    className="accent-primary"
                  />
                  {t(`labels.${dir}`)}
                </label>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* モードタブ */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setA(""); setB(""); }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === m
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:border-primary hover:text-primary"
            }`}
          >
            {t(`modes.${m}`)}
          </button>
        ))}
      </div>

      {/* 入力エリア */}
      {renderInputs()}

      {/* 結果 */}
      {result ? (
        <div className={`flex items-center justify-between gap-4 px-5 py-4 rounded-xl border ${
          "isIncrease" in result
            ? result.isIncrease ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
            : "border-primary/20 bg-primary/5"
        }`}>
          <div>
            {result.label && (
              <p className="text-xs font-medium text-gray-500 mb-0.5">{result.label}</p>
            )}
            <p className="text-3xl font-bold text-gray-900">{result.value}</p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            className="shrink-0 btn-secondary text-xs px-3 py-2"
          >
            {t("buttons.copy")}
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
      )}

      {/* クリアボタン */}
      {(a || b) && (
        <button type="button" onClick={handleClear} className="btn-secondary text-xs px-3 py-1.5">
          {t("buttons.clear")}
        </button>
      )}

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("results.copied")}
        </div>
      )}
    </div>
  );
}
