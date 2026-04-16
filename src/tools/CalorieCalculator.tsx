"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Sex = "male" | "female";

const ACTIVITY_FACTORS = [
  { key: "sedentary", factor: 1.2 },
  { key: "light", factor: 1.375 },
  { key: "moderate", factor: 1.55 },
  { key: "heavy", factor: 1.725 },
  { key: "extreme", factor: 1.9 },
] as const;

// Mifflin-St Jeor 式
function calcBMR(sex: Sex, age: number, height: number, weight: number): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

export default function CalorieCalculator() {
  const t = useTranslations("calorie-calculator");

  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(65);
  const [activityKey, setActivityKey] = useState<string>("light");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { bmr, tdee } = useMemo(() => {
    const bmr = calcBMR(sex, age, height, weight);
    const factor =
      ACTIVITY_FACTORS.find((a) => a.key === activityKey)?.factor ?? 1.2;
    const tdee = Math.round(bmr * factor);
    return { bmr, tdee };
  }, [sex, age, height, weight, activityKey]);

  function handleCopy(key: string, value: number) {
    navigator.clipboard.writeText(String(value)).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  const inputClass =
    "flex-1 px-3 py-2 border border-sky-soft dark:border-sky/20 rounded-lg text-sm text-right " +
    "bg-white dark:bg-primary/5 text-primary dark:text-sky " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  const copyBtnClass =
    "text-xs px-2 py-0.5 rounded border border-sky-soft dark:border-sky/20 " +
    "bg-white dark:bg-primary/5 text-steel dark:text-sky/70 " +
    "hover:bg-sky hover:text-primary dark:hover:bg-sky/20 transition-colors";

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

      {/* 年齢・身長・体重 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.age")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              max={120}
              step={1}
              value={age}
              onChange={(e) =>
                setAge(Math.min(120, Math.max(10, parseInt(e.target.value) || 10)))
              }
              className={inputClass}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">
              {t("labels.ageUnit")}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.height")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={100}
              max={250}
              step={0.1}
              value={height}
              onChange={(e) =>
                setHeight(
                  Math.min(250, Math.max(100, parseFloat(e.target.value) || 100))
                )
              }
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
              type="number"
              min={20}
              max={300}
              step={0.1}
              value={weight}
              onChange={(e) =>
                setWeight(
                  Math.min(300, Math.max(20, parseFloat(e.target.value) || 20))
                )
              }
              className={inputClass}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">kg</span>
          </div>
        </div>
      </div>

      {/* 活動レベル */}
      <div>
        <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
          {t("labels.activityLevel")}
        </label>
        <select
          value={activityKey}
          onChange={(e) => setActivityKey(e.target.value)}
          className="w-full px-3 py-2.5 border border-sky-soft dark:border-sky/20 rounded-lg text-sm
                     bg-white dark:bg-primary/5 text-primary dark:text-sky
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        >
          {ACTIVITY_FACTORS.map(({ key }) => (
            <option key={key} value={key}>
              {t(`activity.${key}`)}
            </option>
          ))}
        </select>
      </div>

      {/* 結果カード（BMR / TDEE） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface dark:bg-primary/10 border border-sky-soft dark:border-sky/20 rounded-xl p-5">
          <p className="text-xs font-medium text-steel dark:text-sky/70 mb-2">
            {t("labels.bmr")}
          </p>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-3xl font-bold text-primary dark:text-sky leading-none">
              {bmr.toLocaleString()}
            </span>
            <span className="text-sm text-steel dark:text-sky/70 pb-0.5">kcal</span>
          </div>
          <button type="button" onClick={() => handleCopy("bmr", bmr)} className={copyBtnClass}>
            {copiedKey === "bmr" ? t("ui.copied") : t("ui.copy")}
          </button>
        </div>

        <div className="bg-surface dark:bg-primary/10 border border-sky-soft dark:border-sky/20 rounded-xl p-5">
          <p className="text-xs font-medium text-steel dark:text-sky/70 mb-2">
            {t("labels.tdee")}
          </p>
          <div className="flex items-end gap-1.5 mb-3">
            <span className="text-3xl font-bold text-accent leading-none">
              {tdee.toLocaleString()}
            </span>
            <span className="text-sm text-steel dark:text-sky/70 pb-0.5">kcal</span>
          </div>
          <button type="button" onClick={() => handleCopy("tdee", tdee)} className={copyBtnClass}>
            {copiedKey === "tdee" ? t("ui.copied") : t("ui.copy")}
          </button>
        </div>
      </div>

      {/* 目標別カロリー */}
      <div className="rounded-xl border border-sky-soft dark:border-sky/20 overflow-hidden">
        <div className="px-4 py-2.5 bg-surface dark:bg-primary/10 border-b border-sky-soft dark:border-sky/20">
          <p className="text-xs font-semibold text-steel dark:text-sky/70">
            {t("labels.targetTitle")}
          </p>
        </div>
        <div className="grid grid-cols-3 divide-x divide-sky-soft dark:divide-sky/20">
          {(
            [
              { key: "loss", value: tdee - 500, delta: "−500" },
              { key: "maintain", value: tdee, delta: "±0" },
              { key: "gain", value: tdee + 500, delta: "+500" },
            ] as const
          ).map(({ key, value, delta }) => (
            <div
              key={key}
              className="px-3 py-4 text-center bg-white dark:bg-primary/5"
            >
              <p className="text-xs text-steel dark:text-sky/60 mb-1">
                {t(`target.${key}`)}
              </p>
              <p className="text-lg font-bold text-primary dark:text-sky leading-none">
                {value.toLocaleString()}
              </p>
              <p className="text-[10px] text-steel/60 dark:text-sky/40 mt-0.5">
                {delta} kcal
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 免責注意 */}
      <p className="text-xs text-steel dark:text-sky/50 text-center">
        {t("ui.disclaimer")}
      </p>
    </div>
  );
}
