"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type UnitSystem = "metric" | "imperial";

interface BmiResult {
  bmi: number;
  category: "underweight" | "normal" | "overweight" | "obese";
  weightToNormal: number; // kg差（正=増量必要、負=減量必要）
}

function calcBmi(heightCm: number, weightKg: number): BmiResult {
  const h = heightCm / 100;
  const bmi = weightKg / (h * h);

  let category: BmiResult["category"];
  if (bmi < 18.5) category = "underweight";
  else if (bmi < 25) category = "normal";
  else if (bmi < 30) category = "overweight";
  else category = "obese";

  // 標準BMI 22.0 に対応する体重との差
  const idealWeight = 22 * h * h;
  const weightToNormal = Math.round((idealWeight - weightKg) * 10) / 10;

  return { bmi: Math.round(bmi * 10) / 10, category, weightToNormal };
}

function ftInToCm(ft: number, inches: number): number {
  return (ft * 12 + inches) * 2.54;
}

function lbsToKg(lbs: number): number {
  return lbs * 0.45359237;
}

const CATEGORY_COLORS: Record<BmiResult["category"], string> = {
  underweight: "text-blue-600 bg-blue-50 border-blue-200",
  normal: "text-green-600 bg-green-50 border-green-200",
  overweight: "text-yellow-600 bg-yellow-50 border-yellow-200",
  obese: "text-red-600 bg-red-50 border-red-200",
};

const BMI_RANGES = [
  { max: 18.5, key: "underweight", color: "bg-blue-400" },
  { max: 25,   key: "normal",      color: "bg-green-400" },
  { max: 30,   key: "overweight",  color: "bg-yellow-400" },
  { max: Infinity, key: "obese",   color: "bg-red-400" },
];

export default function BmiCalculator() {
  const t = useTranslations("bmi-calculator");
  const [unit, setUnit] = useState<UnitSystem>("metric");

  // metric
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // imperial
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const result = useMemo<BmiResult | null>(() => {
    let hCm: number;
    let wKg: number;

    if (unit === "metric") {
      hCm = parseFloat(heightCm);
      wKg = parseFloat(weightKg);
    } else {
      const ft = parseFloat(heightFt) || 0;
      const inch = parseFloat(heightIn) || 0;
      hCm = ftInToCm(ft, inch);
      wKg = lbsToKg(parseFloat(weightLbs));
    }

    if (!hCm || !wKg || hCm <= 0 || wKg <= 0 || hCm > 300 || wKg > 500) return null;
    return calcBmi(hCm, wKg);
  }, [unit, heightCm, weightKg, heightFt, heightIn, weightLbs]);

  function switchUnit(next: UnitSystem) {
    setUnit(next);
    // 入力はリセット
    setHeightCm(""); setWeightKg("");
    setHeightFt(""); setHeightIn(""); setWeightLbs("");
  }

  // BMIゲージ上の位置（0〜100%）上限40を100%とする
  const gaugePos = result ? Math.min((result.bmi / 40) * 100, 100) : null;

  return (
    <div className="space-y-5">
      {/* 単位切り替え */}
      <div className="flex gap-2">
        {(["metric", "imperial"] as const).map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => switchUnit(u)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              unit === u
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t(`units.${u}`)}
          </button>
        ))}
      </div>

      {/* 入力フォーム */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 身長 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("heightLabel")}
          </label>
          {unit === "metric" ? (
            <div className="relative">
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="170"
                min="50" max="300"
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-sm
                           focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">cm</span>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="5"
                  min="0" max="9"
                  className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">ft</span>
              </div>
              <div className="relative flex-1">
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="7"
                  min="0" max="11"
                  className="w-full px-3 py-3 pr-8 border border-gray-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">in</span>
              </div>
            </div>
          )}
        </div>

        {/* 体重 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("weightLabel")}
          </label>
          <div className="relative">
            <input
              type="number"
              value={unit === "metric" ? weightKg : weightLbs}
              onChange={(e) =>
                unit === "metric"
                  ? setWeightKg(e.target.value)
                  : setWeightLbs(e.target.value)
              }
              placeholder={unit === "metric" ? "65" : "143"}
              min="1" max={unit === "metric" ? "500" : "1100"}
              className="w-full px-4 py-3 pr-14 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {unit === "metric" ? "kg" : "lbs"}
            </span>
          </div>
        </div>
      </div>

      {/* 結果 */}
      {result && (
        <div className="space-y-4">
          {/* BMI値 + カテゴリ */}
          <div className={`border rounded-xl p-5 text-center ${CATEGORY_COLORS[result.category]}`}>
            <p className="text-sm font-medium mb-1">{t("results.bmiLabel")}</p>
            <p className="text-5xl font-bold">{result.bmi}</p>
            <p className="text-lg font-semibold mt-2">{t(`categories.${result.category}`)}</p>
          </div>

          {/* ゲージ */}
          <div>
            <div className="flex rounded-full overflow-hidden h-3">
              <div className="bg-blue-400 flex-[18.5]" />
              <div className="bg-green-400 flex-[6.5]" />
              <div className="bg-yellow-400 flex-[5]" />
              <div className="bg-red-400 flex-[10]" />
            </div>
            {/* ポインタ */}
            <div className="relative mt-1">
              {gaugePos !== null && (
                <div
                  className="absolute -translate-x-1/2"
                  style={{ left: `${gaugePos}%` }}
                >
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-gray-700 mx-auto" />
                </div>
              )}
            </div>
            {/* ラベル */}
            <div className="flex justify-between text-xs text-gray-400 mt-3">
              {BMI_RANGES.map((r) => (
                <span key={r.key}>{t(`categories.${r.key}`)}</span>
              ))}
            </div>
          </div>

          {/* 標準体重との差 */}
          {result.category !== "normal" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
              {result.weightToNormal > 0
                ? t("results.needGain", { kg: Math.abs(result.weightToNormal) })
                : t("results.needLoss", { kg: Math.abs(result.weightToNormal) })}
              <span className="text-xs text-gray-400 ml-1">({t("results.idealNote")})</span>
            </div>
          )}

          {/* BMI基準表 */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-3 py-2 border border-gray-200 font-medium text-gray-600">{t("table.category")}</th>
                  <th className="px-3 py-2 border border-gray-200 font-medium text-gray-600">{t("table.range")}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: "underweight", range: "< 18.5" },
                  { key: "normal",      range: "18.5 – 24.9" },
                  { key: "overweight",  range: "25.0 – 29.9" },
                  { key: "obese",       range: "≥ 30.0" },
                ].map(({ key, range }) => (
                  <tr
                    key={key}
                    className={result.category === key ? "font-semibold" : ""}
                  >
                    <td className="px-3 py-2 border border-gray-200">{t(`categories.${key}`)}</td>
                    <td className="px-3 py-2 border border-gray-200">{range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
