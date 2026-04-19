"use client";
import { useTranslations } from "next-intl";
import { useReactionTime } from "@/hooks/useReactionTime";

const PHASE_STYLES = {
  idle:    "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
  waiting: "bg-blue-400 dark:bg-blue-600 text-white",
  ready:   "bg-green-400 dark:bg-green-500 text-white",
  result:  "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200",
  early:   "bg-red-400 dark:bg-red-600 text-white",
};

function ratingLabel(ms: number): string {
  if (ms < 150) return "🏆 Exceptional";
  if (ms < 200) return "⚡ Excellent";
  if (ms < 250) return "✅ Good";
  if (ms < 350) return "👍 Average";
  return "💪 Keep practicing";
}

export default function ReactionTime() {
  const t = useTranslations("reaction-time");
  const { phase, lastMs, bestMs, history, avg, click } = useReactionTime();

  const phaseText =
    phase === "idle" ? t("idle") :
    phase === "waiting" ? t("waiting") :
    phase === "ready" ? t("ready") :
    phase === "early" ? t("early") :
    lastMs !== null ? `${lastMs} ${t("result")}` : "";

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Clickable area */}
      <button
        onClick={click}
        className={`w-full max-w-sm h-48 rounded-2xl font-bold text-3xl transition-colors duration-100 select-none cursor-pointer ${PHASE_STYLES[phase]}`}
        aria-label={phaseText}
      >
        {phaseText}
      </button>

      {/* Rating */}
      {phase === "result" && lastMs !== null && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{ratingLabel(lastMs)}</p>
      )}

      {/* Stats */}
      <div className="flex gap-6 text-center">
        {bestMs !== null && (
          <div>
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{bestMs}ms</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("best")}</div>
          </div>
        )}
        {avg !== null && (
          <div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{avg}ms</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("average")}</div>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="w-full max-w-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t("history")}</p>
          <div className="flex gap-2 flex-wrap">
            {history.map((ms, i) => (
              <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                {ms}ms
              </span>
            ))}
          </div>
        </div>
      )}

      {phase !== "waiting" && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {phase !== "idle" ? `${t("tryAgain")} — ` : ""}{t("idle")}
        </p>
      )}
    </div>
  );
}
