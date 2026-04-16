"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Sex = "male" | "female";
type Category = "essential" | "athlete" | "fitness" | "average" | "obese";

// US Navy Method
function calcBodyFat(
  sex: Sex,
  heightCm: number,
  neckCm: number,
  waistCm: number,
  hipCm: number
): number | null {
  if (heightCm <= 0 || neckCm <= 0 || waistCm <= 0) return null;
  if (sex === "male" && waistCm <= neckCm) return null;
  if (sex === "female" && (waistCm + hipCm <= neckCm || hipCm <= 0)) return null;

  let bf: number;
  if (sex === "male") {
    bf =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waistCm - neckCm) +
          0.15456 * Math.log10(heightCm)) -
      450;
  } else {
    bf =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waistCm + hipCm - neckCm) +
          0.221 * Math.log10(heightCm)) -
      450;
  }
  if (!isFinite(bf) || isNaN(bf)) return null;
  return Math.round(Math.max(0, Math.min(99, bf)) * 10) / 10;
}

function getCategory(sex: Sex, bf: number): Category {
  if (sex === "male") {
    if (bf < 6) return "essential";
    if (bf < 14) return "athlete";
    if (bf < 18) return "fitness";
    if (bf < 25) return "average";
    return "obese";
  } else {
    if (bf < 14) return "essential";
    if (bf < 21) return "athlete";
    if (bf < 25) return "fitness";
    if (bf < 32) return "average";
    return "obese";
  }
}

function categoryColor(cat: Category): string {
  switch (cat) {
    case "essential": return "text-amber-600 dark:text-amber-400";
    case "athlete":   return "text-green-600 dark:text-green-400";
    case "fitness":   return "text-green-500 dark:text-green-400";
    case "average":   return "text-sky dark:text-sky";
    case "obese":     return "text-accent dark:text-accent";
  }
}

export default function BodyFatCalculator() {
  const t = useTranslations("body-fat-calculator");

  const [sex, setSex] = useState<Sex>("male");
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [neck, setNeck] = useState(38);
  const [waist, setWaist] = useState(80);
  const [hip, setHip] = useState(95);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const result = useMemo(() => {
    const bf = calcBodyFat(sex, height, neck, waist, hip);
    if (bf === null) return null;
    const fatMass = Math.round(weight * (bf / 100) * 10) / 10;
    const leanMass = Math.round((weight - fatMass) * 10) / 10;
    const category = getCategory(sex, bf);
    return { bf, fatMass, leanMass, category };
  }, [sex, height, weight, neck, waist, hip]);

  const isInvalidInput =
    sex === "male"
      ? waist <= neck
      : waist + hip <= neck;

  function handleCopy(key: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const inputClass =
    "flex-1 px-3 py-2 border border-sky-soft dark:border-sky/20 rounded-lg text-sm text-right " +
    "bg-white dark:bg-primary/5 text-primary dark:text-sky " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-6">
      {/* 性別 */}
      <div className="flex gap-2">
        {(["male", "female"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSex(s)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              sex === s
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-primary/5 text-steel dark:text-sky/70 border-sky-soft dark:border-sky/20 hover:border-primary"
            }`}
          >
            {t(`labels.${s}`)}
          </button>
        ))}
      </div>

      {/* 身長・体重 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.height")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={100} max={250} step={0.5} value={height}
              onChange={(e) => setHeight(Math.min(250, Math.max(100, parseFloat(e.target.value) || 100)))}
              className={inputClass}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">cm</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.weight")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={20} max={300} step={0.1} value={weight}
              onChange={(e) => setWeight(Math.min(300, Math.max(20, parseFloat(e.target.value) || 20)))}
              className={inputClass}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">kg</span>
          </div>
        </div>
      </div>

      {/* 周囲計測 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.neck")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={20} max={80} step={0.5} value={neck}
              onChange={(e) => setNeck(Math.min(80, Math.max(20, parseFloat(e.target.value) || 20)))}
              className={inputClass}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">cm</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.waist")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min={40} max={200} step={0.5} value={waist}
              onChange={(e) => setWaist(Math.min(200, Math.max(40, parseFloat(e.target.value) || 40)))}
              className={inputClass}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">cm</span>
          </div>
        </div>
        {sex === "female" && (
          <div>
            <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
              {t("labels.hip")}
              <span className="ml-1 text-xs text-steel dark:text-sky/50 font-normal">
                ({t("labels.hipNote")})
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number" min={50} max={200} step={0.5} value={hip}
                onChange={(e) => setHip(Math.min(200, Math.max(50, parseFloat(e.target.value) || 50)))}
                className={inputClass}
              />
              <span className="text-sm text-steel dark:text-sky/70 shrink-0">cm</span>
            </div>
          </div>
        )}
      </div>

      {/* 入力エラー */}
      {isInvalidInput && (
        <p className="text-sm text-accent text-center py-2">
          {t("ui.invalidInput")}
        </p>
      )}

      {/* 結果 */}
      {result && !isInvalidInput ? (
        <div className="space-y-4">
          {/* メイン結果カード */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: "bodyFat",  label: t("labels.bodyFat"),  value: `${result.bf}`, unit: "%",  copy: `${result.bf}` },
              { key: "fatMass",  label: t("labels.fatMass"),  value: `${result.fatMass}`, unit: "kg", copy: `${result.fatMass}` },
              { key: "leanMass", label: t("labels.leanMass"), value: `${result.leanMass}`, unit: "kg", copy: `${result.leanMass}` },
            ].map(({ key, label, value, unit, copy }) => (
              <div
                key={key}
                className="bg-surface dark:bg-primary/10 border border-sky-soft dark:border-sky/20 rounded-xl p-4 flex flex-col gap-2"
              >
                <p className="text-xs font-medium text-steel dark:text-sky/70">{label}</p>
                <div className="flex items-end gap-0.5">
                  <span className="text-xl font-bold text-primary dark:text-sky leading-none">
                    {value}
                  </span>
                  <span className="text-xs text-steel dark:text-sky/70 pb-0.5">{unit}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(key, copy)}
                  className="mt-auto self-start text-xs px-2 py-0.5 rounded border border-sky-soft dark:border-sky/20
                             bg-white dark:bg-primary/5 text-steel dark:text-sky/70
                             hover:bg-sky hover:text-primary dark:hover:bg-sky/20 transition-colors"
                >
                  {copiedKey === key ? t("ui.copied") : t("ui.copy")}
                </button>
              </div>
            ))}
          </div>

          {/* カテゴリ判定 */}
          <div className="bg-surface dark:bg-primary/10 border border-sky-soft dark:border-sky/20 rounded-xl px-5 py-4">
            <p className="text-xs font-medium text-steel dark:text-sky/70 mb-1">{t("labels.category")}</p>
            <p className={`text-2xl font-bold ${categoryColor(result.category)}`}>
              {t(`categories.${result.category}`)}
            </p>
            <p className="text-xs text-steel dark:text-sky/50 mt-1">
              {t(`categoryRange.${sex}.${result.category}`)}
            </p>
          </div>
        </div>
      ) : (
        !isInvalidInput && (
          <p className="text-sm text-steel dark:text-sky/50 text-center py-6">
            {t("ui.hint")}
          </p>
        )
      )}

      <p className="text-xs text-steel dark:text-sky/50 text-center">
        {t("ui.disclaimer")}
      </p>
    </div>
  );
}
