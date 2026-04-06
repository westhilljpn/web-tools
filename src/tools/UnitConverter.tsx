"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

// カテゴリキー
type CategoryKey = "length" | "weight" | "temperature" | "area" | "volume" | "speed";

// 単位定義（基準単位へのコンバーター）
interface UnitDef {
  key: string;
  /** 基準単位への変換 */
  toBase: (v: number) => number;
  /** 基準単位からの変換 */
  fromBase: (v: number) => number;
}

// 各カテゴリの基準単位: 長さ=m, 重量=kg, 温度=℃, 面積=m², 体積=L, 速度=m/s
const UNITS: Record<CategoryKey, UnitDef[]> = {
  length: [
    { key: "mm",  toBase: (v) => v / 1000,        fromBase: (v) => v * 1000 },
    { key: "cm",  toBase: (v) => v / 100,          fromBase: (v) => v * 100 },
    { key: "m",   toBase: (v) => v,                fromBase: (v) => v },
    { key: "km",  toBase: (v) => v * 1000,         fromBase: (v) => v / 1000 },
    { key: "in",  toBase: (v) => v * 0.0254,       fromBase: (v) => v / 0.0254 },
    { key: "ft",  toBase: (v) => v * 0.3048,       fromBase: (v) => v / 0.3048 },
    { key: "yd",  toBase: (v) => v * 0.9144,       fromBase: (v) => v / 0.9144 },
    { key: "mi",  toBase: (v) => v * 1609.344,     fromBase: (v) => v / 1609.344 },
  ],
  weight: [
    { key: "mg",  toBase: (v) => v / 1e6,          fromBase: (v) => v * 1e6 },
    { key: "g",   toBase: (v) => v / 1000,          fromBase: (v) => v * 1000 },
    { key: "kg",  toBase: (v) => v,                 fromBase: (v) => v },
    { key: "t",   toBase: (v) => v * 1000,          fromBase: (v) => v / 1000 },
    { key: "oz",  toBase: (v) => v * 0.0283495,     fromBase: (v) => v / 0.0283495 },
    { key: "lb",  toBase: (v) => v * 0.453592,      fromBase: (v) => v / 0.453592 },
  ],
  temperature: [
    { key: "c",   toBase: (v) => v,                 fromBase: (v) => v },
    { key: "f",   toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
    { key: "k",   toBase: (v) => v - 273.15,        fromBase: (v) => v + 273.15 },
  ],
  area: [
    { key: "mm2", toBase: (v) => v / 1e6,           fromBase: (v) => v * 1e6 },
    { key: "cm2", toBase: (v) => v / 1e4,           fromBase: (v) => v * 1e4 },
    { key: "m2",  toBase: (v) => v,                 fromBase: (v) => v },
    { key: "km2", toBase: (v) => v * 1e6,           fromBase: (v) => v / 1e6 },
    { key: "ha",  toBase: (v) => v * 1e4,           fromBase: (v) => v / 1e4 },
    { key: "ac",  toBase: (v) => v * 4046.86,       fromBase: (v) => v / 4046.86 },
    { key: "in2", toBase: (v) => v * 6.4516e-4,     fromBase: (v) => v / 6.4516e-4 },
    { key: "ft2", toBase: (v) => v * 0.092903,      fromBase: (v) => v / 0.092903 },
  ],
  volume: [
    { key: "ml",   toBase: (v) => v / 1000,          fromBase: (v) => v * 1000 },
    { key: "cl",   toBase: (v) => v / 100,            fromBase: (v) => v * 100 },
    { key: "dl",   toBase: (v) => v / 10,             fromBase: (v) => v * 10 },
    { key: "l",    toBase: (v) => v,                  fromBase: (v) => v },
    { key: "tsp",  toBase: (v) => v * 0.00492892,     fromBase: (v) => v / 0.00492892 },
    { key: "tbsp", toBase: (v) => v * 0.0147868,      fromBase: (v) => v / 0.0147868 },
    { key: "floz", toBase: (v) => v * 0.0295735,      fromBase: (v) => v / 0.0295735 },
    { key: "cup",  toBase: (v) => v * 0.236588,       fromBase: (v) => v / 0.236588 },
    { key: "pt",   toBase: (v) => v * 0.473176,       fromBase: (v) => v / 0.473176 },
    { key: "qt",   toBase: (v) => v * 0.946353,       fromBase: (v) => v / 0.946353 },
    { key: "gal",  toBase: (v) => v * 3.78541,        fromBase: (v) => v / 3.78541 },
  ],
  speed: [
    { key: "ms",   toBase: (v) => v,                  fromBase: (v) => v },
    { key: "kmh",  toBase: (v) => v / 3.6,            fromBase: (v) => v * 3.6 },
    { key: "mph",  toBase: (v) => v * 0.44704,        fromBase: (v) => v / 0.44704 },
    { key: "kn",   toBase: (v) => v * 0.514444,       fromBase: (v) => v / 0.514444 },
  ],
};

const CATEGORIES: CategoryKey[] = ["length", "weight", "temperature", "area", "volume", "speed"];

// 数値を読みやすい形式にフォーマット
function fmt(v: number): string {
  if (!isFinite(v)) return "—";
  if (Math.abs(v) === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) {
    return v.toExponential(6);
  }
  if (abs >= 1000) return v.toPrecision(8).replace(/\.?0+$/, "");
  return parseFloat(v.toPrecision(8)).toString();
}

export default function UnitConverter() {
  const t = useTranslations("unit-converter");
  const { copy } = useClipboard();
  const [category, setCategory] = useState<CategoryKey>("length");
  const [fromUnit, setFromUnit] = useState("m");
  const [inputValue, setInputValue] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // カテゴリ変更時に fromUnit をデフォルトにリセット
  function handleCategoryChange(c: CategoryKey) {
    setCategory(c);
    setFromUnit(UNITS[c][0].key);
    setInputValue("");
  }

  const units = UNITS[category];
  const numVal = parseFloat(inputValue);
  const hasInput = inputValue.trim() !== "" && !isNaN(numVal);

  // 全単位への変換結果
  const results = useMemo(() => {
    if (!hasInput) return null;
    const srcDef = units.find((u) => u.key === fromUnit);
    if (!srcDef) return null;
    const base = srcDef.toBase(numVal);
    return units.map((u) => ({
      key: u.key,
      value: u.key === fromUnit ? numVal : u.fromBase(base),
    }));
  }, [hasInput, units, fromUnit, numVal]);

  async function handleCopy(text: string) {
    await copy(text);
    showToast(t("toast.copied"));
  }

  return (
    <div className="space-y-5">
      {/* カテゴリタブ */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCategoryChange(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === c
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t(`category.${c}`)}
          </button>
        ))}
      </div>

      {/* 入力 */}
      <div className="flex gap-3">
        <div className="flex-1">
          <label htmlFor="unit-input" className="block text-sm font-medium text-gray-700 mb-2">
            {t("inputLabel")}
          </label>
          <input
            id="unit-input"
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={t("placeholder")}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div className="shrink-0">
          <label htmlFor="unit-select" className="block text-sm font-medium text-gray-700 mb-2">
            {t("fromUnitLabel")}
          </label>
          <select
            id="unit-select"
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="h-[46px] px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                       bg-white min-w-[80px]"
          >
            {units.map((u) => (
              <option key={u.key} value={u.key}>
                {t(`units.${category}.${u.key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 変換結果 */}
      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {results.map(({ key, value }) => (
            <div
              key={key}
              className={`rounded-lg p-3 border ${
                key === fromUnit
                  ? "bg-primary/5 border-primary/20"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-medium text-gray-500">
                  {t(`units.${category}.${key}`)}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fmt(value))}
                  className="btn-secondary text-xs px-2 py-0.5 shrink-0"
                >
                  {t("buttons.copy")}
                </button>
              </div>
              <p className="text-sm font-mono text-gray-800 break-all">
                {fmt(value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {!hasInput && (
        <p className="text-sm text-gray-400 text-center py-4">{t("hint")}</p>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
