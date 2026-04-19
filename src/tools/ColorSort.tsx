"use client";
import { useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  useColorSort,
  TUBE_CAP,
  TUBE_HEIGHT,
  LAYER_HEIGHT,
  PALETTE,
  getColorData,
  type Difficulty,
} from "@/hooks/useColorSort";

const COLS: Record<Difficulty, number> = { easy: 3, medium: 4, hard: 5, expert: 6 };
const DIFFS: Difficulty[] = ["easy", "medium", "hard", "expert"];

function Tube({ balls, isSelected, onClick }: {
  balls: string[];
  isSelected: boolean;
  onClick: () => void;
}) {
  const completed = balls.length === TUBE_CAP && balls.every((b) => b === balls[0]);
  const topData = balls.length ? getColorData(balls[balls.length - 1]) : null;

  const borderStyle = completed && topData
    ? {
        border: `2px solid ${topData.glow.replace("0.7", "0.9")}`,
        boxShadow: `0 0 22px ${topData.glow}, 0 4px 20px rgba(0,0,0,0.6)`,
      }
    : isSelected && topData
    ? {
        border: `2px solid ${topData.glow.replace("0.7", "0.85")}`,
        boxShadow: `0 0 20px ${topData.glow}, 0 6px 24px rgba(0,0,0,0.7)`,
      }
    : {
        border: "1.5px solid rgba(255,255,255,0.2)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
      };

  return (
    <button
      onClick={onClick}
      aria-label="tube"
      className={`relative flex flex-col-reverse overflow-hidden cursor-pointer transition-transform duration-150
        ${isSelected ? "-translate-y-2.5" : "hover:-translate-y-0.5"}
      `}
      style={{
        width: 44,
        height: TUBE_HEIGHT,
        borderRadius: "6px 6px 22px 22px",
        background: "rgba(255,255,255,0.05)",
        ...borderStyle,
      }}
    >
      {/* Liquid layers bottom-to-top: key by position+color triggers pour-in on new layers */}
      {balls.map((color, i) => {
        const cd = getColorData(color);
        return (
          <div
            key={`${i}-${color}`}
            className="liquid-pour-in shrink-0 relative w-full"
            style={{
              height: LAYER_HEIGHT,
              background: `linear-gradient(180deg, ${cd.light}F0 0%, ${cd.base} 100%)`,
              boxShadow: `inset 0 0 12px ${cd.glow}`,
              borderTop: "1px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              className="absolute"
              style={{
                top: 4,
                left: 5,
                right: 5,
                height: 3,
                background: "rgba(255,255,255,0.30)",
                borderRadius: 2,
              }}
            />
          </div>
        );
      })}

      {completed && topData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <span style={{ fontSize: 22, filter: `drop-shadow(0 0 6px ${topData.base})` }}>
            ✓
          </span>
        </div>
      )}

      <div
        className="absolute pointer-events-none rounded"
        style={{
          top: 0,
          left: 6,
          width: 8,
          height: "60%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)",
        }}
      />
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

      {/* Tube grid (Deep Space Glass panel) */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 shadow-2xl"
        style={{
          background: "linear-gradient(160deg, #0a0e1a 0%, #0d1a2e 60%, #0a1020 100%)",
        }}
      >
        {/* 背景グロー光源 */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.09) 0%, transparent 70%)",
            top: -30,
            left: 10,
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)",
            bottom: 10,
            right: 10,
          }}
        />

        <div
          className="relative grid gap-2.5"
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
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={!hist.length}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-40 bg-[#1e293b] border border-white/10 text-slate-400"
        >
          {t("undo")}
        </button>
        <button
          onClick={restart}
          className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-[#1e293b] border border-white/10 text-slate-400"
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
