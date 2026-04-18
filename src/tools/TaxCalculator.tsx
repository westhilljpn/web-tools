"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

type Mode = "toInclude" | "toExclude" | "reverse";
type Rate = 10 | 8;

function fmt(n: number): string {
  return n.toLocaleString("ja-JP", { maximumFractionDigits: 0 });
}

export default function TaxCalculator() {
  const t = useTranslations("tax-calculator");
  const [mode, setMode] = useState<Mode>("toInclude");
  const [rate, setRate] = useState<Rate>(10);
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState("");

  const num = parseFloat(input.replace(/,/g, ""));
  const isValid = !isNaN(num) && num >= 0;

  let excl = 0, tax = 0, incl = 0;
  if (isValid) {
    const r = rate / 100;
    if (mode === "toInclude") {
      excl = num; tax = Math.floor(num * r); incl = excl + tax;
    } else if (mode === "toExclude") {
      incl = num; excl = Math.floor(num / (1 + r)); tax = incl - excl;
    } else {
      // reverse: 税込→税抜（切り捨て）
      incl = num; excl = Math.floor(num / (1 + r)); tax = incl - excl;
    }
  }

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(""), 2000);
    } catch { }
  }, []);

  const modes: Mode[] = ["toInclude", "toExclude", "reverse"];

  return (
    <div className="space-y-5">
      {/* モード切替 */}
      <div className="flex flex-wrap gap-2">
        {modes.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              mode === m
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t(`modes.${m}`)}
          </button>
        ))}
      </div>

      {/* 税率切替 */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{t("rateLabel")}</span>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {([10, 8] as Rate[]).map(r => (
            <button
              key={r}
              type="button"
              onClick={() => setRate(r)}
              className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                rate === r ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r}%
            </button>
          ))}
        </div>
      </div>

      {/* 入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t(`inputLabel.${mode}`)}
        </label>
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-sm">¥</span>
          <input
            type="number"
            min={0}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="10000"
            className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* 結果 */}
      {isValid && input && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
          {[
            { label: t("excl"), value: fmt(excl), raw: String(excl) },
            { label: t("tax") + ` (${rate}%)`, value: fmt(tax), raw: String(tax) },
            { label: t("incl"), value: fmt(incl), raw: String(incl), highlight: true },
          ].map(({ label, value, raw, highlight }) => (
            <div
              key={label}
              className={`flex items-center justify-between px-4 py-3 ${
                highlight ? "bg-primary/5 border-t-2 border-primary/20" : "border-b border-gray-200"
              }`}
            >
              <span className={`text-sm ${highlight ? "font-semibold text-primary" : "text-gray-600"}`}>
                {label}
              </span>
              <div className="flex items-center gap-3">
                <span className={`font-mono text-base ${highlight ? "font-bold text-primary" : "text-gray-800"}`}>
                  ¥{value}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(raw)}
                  className="text-xs px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300 text-gray-600 transition-colors"
                >
                  {copied === raw ? t("copied") : t("copy")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 計算式の表示 */}
      {isValid && input && (
        <div className="text-xs text-gray-400 space-y-1">
          {mode === "toInclude" && (
            <>
              <p>{t("formula.tax")}: ¥{fmt(excl)} × {rate}% = ¥{fmt(tax)}</p>
              <p>{t("formula.incl")}: ¥{fmt(excl)} + ¥{fmt(tax)} = ¥{fmt(incl)}</p>
            </>
          )}
          {(mode === "toExclude" || mode === "reverse") && (
            <>
              <p>{t("formula.excl")}: ¥{fmt(incl)} ÷ {1 + rate / 100} = ¥{fmt(excl)}（{t("formula.floorNote")}）</p>
              <p>{t("formula.tax")}: ¥{fmt(incl)} − ¥{fmt(excl)} = ¥{fmt(tax)}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
