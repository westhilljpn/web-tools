"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Mode = "toBedtime" | "toWakeup";

const CYCLE_MIN = 90;
// 推奨サイクル数: 6〜2 の順（多い順に表示）
const CYCLES = [6, 5, 4, 3, 2] as const;

function addMinutes(hhmm: string, minutes: number): string {
  const [h, m] = hhmm.split(":").map(Number);
  const total = (h * 60 + m + minutes + 24 * 60) % (24 * 60);
  const rh = Math.floor(total / 60);
  const rm = total % 60;
  return `${String(rh).padStart(2, "0")}:${String(rm).padStart(2, "0")}`;
}

function subtractMinutes(hhmm: string, minutes: number): string {
  return addMinutes(hhmm, -minutes);
}

function cycleLabel(n: number, totalMin: number, t: (k: string) => string): string {
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const timeStr = m > 0 ? `${h}h ${m}m` : `${h}h`;
  return `${n} ${t("labels.cycles")} / ${timeStr} ${t("labels.totalSleep")}`;
}

export default function SleepCalculator() {
  const t = useTranslations("sleep-calculator");

  const [mode, setMode] = useState<Mode>("toBedtime");
  const [time, setTime] = useState("07:00");
  const [fallAsleepMins, setFallAsleepMins] = useState(14);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const results = useMemo(() => {
    return CYCLES.map((n) => {
      const sleepMin = n * CYCLE_MIN;
      if (mode === "toBedtime") {
        // 起床時刻 → 就寝時刻: 起床時刻から (sleepMin + fallAsleepMins) を引く
        const bedtime = subtractMinutes(time, sleepMin + fallAsleepMins);
        return { n, sleepMin, time: bedtime };
      } else {
        // 就寝時刻 → 起床時刻: 就寝時刻に (sleepMin + fallAsleepMins) を足す
        const wakeup = addMinutes(time, sleepMin + fallAsleepMins);
        return { n, sleepMin, time: wakeup };
      }
    });
  }, [mode, time, fallAsleepMins]);

  function handleCopy(key: string, val: string) {
    navigator.clipboard.writeText(val).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  function cycleColor(n: number): string {
    if (n >= 6) return "text-green-600 dark:text-green-400";
    if (n >= 5) return "text-green-500 dark:text-green-400";
    if (n >= 4) return "text-sky dark:text-sky";
    return "text-steel dark:text-sky/60";
  }

  const inputClass =
    "px-3 py-2.5 border border-sky-soft dark:border-sky/20 rounded-lg text-sm " +
    "bg-white dark:bg-primary/5 text-primary dark:text-sky " +
    "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";

  return (
    <div className="space-y-6">
      {/* モード切替 */}
      <div className="flex flex-wrap gap-2">
        {(["toBedtime", "toWakeup"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
              mode === m
                ? "bg-primary text-white border-primary"
                : "bg-white dark:bg-primary/5 text-steel dark:text-sky/70 border-sky-soft dark:border-sky/20 hover:border-primary"
            }`}
          >
            {t(`modes.${m}`)}
          </button>
        ))}
      </div>

      {/* 時刻入力 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {mode === "toBedtime" ? t("labels.wakeupTime") : t("labels.bedtime")}
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={`w-full ${inputClass}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-primary dark:text-sky mb-1.5">
            {t("labels.fallAsleepMins")}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={120}
              step={1}
              value={fallAsleepMins}
              onChange={(e) =>
                setFallAsleepMins(Math.min(120, Math.max(0, parseInt(e.target.value) || 0)))
              }
              className={`w-full text-right ${inputClass}`}
            />
            <span className="text-sm text-steel dark:text-sky/70 shrink-0">
              {t("labels.minsUnit")}
            </span>
          </div>
        </div>
      </div>

      {/* 結果 */}
      <div>
        <p className="text-sm font-medium text-primary dark:text-sky mb-3">
          {mode === "toBedtime"
            ? t("labels.recommendedBedtimes")
            : t("labels.recommendedWakeups")}
        </p>
        <div className="space-y-2">
          {results.map(({ n, sleepMin, time: resultTime }) => (
            <div
              key={n}
              className="flex items-center justify-between bg-surface dark:bg-primary/10
                         border border-sky-soft dark:border-sky/20 rounded-xl px-4 py-3"
            >
              <div>
                <span className={`text-2xl font-bold font-mono ${cycleColor(n)}`}>
                  {resultTime}
                </span>
                <p className="text-xs text-steel dark:text-sky/50 mt-0.5">
                  {cycleLabel(n, sleepMin, t)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(n), resultTime)}
                className="text-xs px-2 py-0.5 rounded border border-sky-soft dark:border-sky/20
                           bg-white dark:bg-primary/5 text-steel dark:text-sky/70
                           hover:bg-sky hover:text-primary dark:hover:bg-sky/20 transition-colors shrink-0"
              >
                {copiedKey === String(n) ? t("ui.copied") : t("ui.copy")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* サイクル説明 */}
      <p className="text-xs text-steel dark:text-sky/50 text-center">
        {t("ui.cycleNote")}
      </p>
      <p className="text-xs text-steel dark:text-sky/50 text-center">
        {t("ui.disclaimer")}
      </p>
    </div>
  );
}
