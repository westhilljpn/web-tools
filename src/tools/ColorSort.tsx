"use client";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { useColorSort, TUBE_CAP, PALETTE, type Difficulty } from "@/hooks/useColorSort";

const COLS: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5, expert: 6 };
const DIFFS: Difficulty[] = ["easy", "medium", "hard", "expert"];

function Tube({ balls, isSelected, onClick }: {
  balls: string[];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label="tube"
      className={`relative flex flex-col-reverse items-center rounded-xl border-2 p-1 gap-0.5 w-12 h-44 transition-transform duration-150 cursor-pointer
        ${isSelected
          ? "-translate-y-2 border-yellow-400 shadow-yellow-300/40 shadow-lg"
          : "border-white/30 hover:border-white/50 hover:-translate-y-0.5"
        }
        bg-white/10 backdrop-blur-sm`}
    >
      {Array.from({ length: TUBE_CAP }, (_, i) => {
        const color = balls[i];
        return (
          <div key={i} className="w-10 h-10 flex items-center justify-center shrink-0">
            {color ? (
              <div
                className="w-9 h-9 rounded-full"
                style={{
                  backgroundColor: color,
                  backgroundImage:
                    "radial-gradient(circle at 33% 33%, rgba(255,255,255,0.55) 0%, transparent 55%)",
                  boxShadow:
                    "inset -2px -3px 5px rgba(0,0,0,0.22), 0 1px 3px rgba(0,0,0,0.2)",
                }}
              />
            ) : null}
          </div>
        );
      })}
    </button>
  );
}

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-20" aria-hidden>
      {Array.from({ length: 28 }, (_, i) => (
        <div
          key={i}
          className="absolute w-2.5 h-2.5 rounded-sm cs-confetti"
          style={{
            left: `${2 + (i / 28) * 96}%`,
            top: "-16px",
            backgroundColor: PALETTE[i % PALETTE.length],
            animationDelay: `${(i * 0.08).toFixed(2)}s`,
            animationDuration: `${(1.4 + (i % 7) * 0.22).toFixed(1)}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function ColorSort() {
  const t = useTranslations("color-sort");
  const {
    tubes, sel, moves, status, level, diff, hist, best,
    clickTube, undo, restart, nextLevel, changeDiff,
  } = useColorSort();

  const handleShare = useCallback(async () => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const text = `Color Sort Puzzle - Level ${level} cleared in ${moves} moves! 🎉 ${siteUrl}/color-sort`;
    try { await navigator.clipboard.writeText(text); } catch { /* clipboard unavailable */ }
  }, [level, moves]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Difficulty tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {DIFFS.map((d) => (
          <button
            key={d}
            onClick={() => changeDiff(d)}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors
              ${diff === d
                ? "bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
          >
            {t(d)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
        <span>{t("level")}: <b className="text-gray-900 dark:text-white">{level}</b></span>
        <span>{t("moves")}: <b className="text-gray-900 dark:text-white">{moves}</b></span>
        {best !== null && (
          <span>{t("best")}: <b className="text-green-600 dark:text-green-400">{best}</b></span>
        )}
      </div>

      {/* Tube grid (dark panel) */}
      <div
        className="grid gap-2 p-5 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl shadow-xl"
        style={{ gridTemplateColumns: `repeat(${COLS[diff]}, minmax(0, 1fr))` }}
      >
        {tubes.map((balls, i) => (
          <Tube
            key={i}
            balls={balls}
            isSelected={sel === i}
            onClick={() => clickTube(i)}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={!hist.length}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-40"
        >
          {t("undo")}
        </button>
        <button
          onClick={restart}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          {t("restart")}
        </button>
      </div>

      {/* Win banner */}
      {status === "won" && (
        <>
          <Confetti />
          <div className="w-full max-w-xs bg-green-50 dark:bg-green-900/30 rounded-2xl p-5 text-center border border-green-200 dark:border-green-800">
            <p className="text-2xl font-bold text-green-700 dark:text-green-300">🎉 {t("cleared")}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{moves} {t("moves")}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button
                onClick={nextLevel}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {t("nextLevel")}
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {t("share")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
