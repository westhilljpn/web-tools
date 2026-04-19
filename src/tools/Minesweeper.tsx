"use client";
import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useMinesweeper, type Difficulty } from "@/hooks/useMinesweeper";

const NUM_COLORS = [
  "",
  "text-blue-600 dark:text-blue-400",
  "text-green-600 dark:text-green-400",
  "text-red-600 dark:text-red-400",
  "text-indigo-700 dark:text-indigo-400",
  "text-red-800 dark:text-red-300",
  "text-cyan-600 dark:text-cyan-400",
  "text-gray-700 dark:text-gray-200",
  "text-gray-400",
];

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

export default function Minesweeper() {
  const t = useTranslations("minesweeper");
  const { grid, status, difficulty, elapsed, flagCount, mineCount, bestTimes, reveal, toggleFlag, reset, changeDifficulty } =
    useMinesweeper();

  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onTouchStart = useCallback((r: number, c: number) => {
    longPressRef.current = setTimeout(() => {
      toggleFlag(r, c);
    }, 500);
  }, [toggleFlag]);

  const onTouchEnd = useCallback(() => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  }, []);

  const faceEmoji = status === "won" ? "😎" : status === "lost" ? "😵" : "🙂";
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Difficulty tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {difficulties.map((d) => (
          <button
            key={d}
            onClick={() => changeDifficulty(d)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              difficulty === d
                ? "bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            {t(d)}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 bg-gray-100 dark:bg-gray-700 rounded-lg px-4 py-2 w-full max-w-sm justify-between">
        <div className="text-center min-w-[48px]">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t("minesLeft")}</div>
          <div className="font-bold text-red-600 dark:text-red-400">{mineCount - flagCount}</div>
        </div>
        <button onClick={reset} className="text-2xl hover:scale-110 transition-transform" title={t("newGame")}>
          {faceEmoji}
        </button>
        <div className="text-center min-w-[48px]">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t("time")}</div>
          <div className="font-bold text-gray-700 dark:text-gray-200">{formatTime(elapsed)}</div>
        </div>
      </div>

      {/* Best time */}
      {bestTimes[difficulty] !== null && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {t("best")}: {formatTime(bestTimes[difficulty]!)}
        </p>
      )}

      {/* Result banner */}
      {(status === "won" || status === "lost") && (
        <div className={`w-full max-w-sm text-center py-2 rounded-lg font-bold text-lg ${
          status === "won" ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
        }`}>
          {status === "won" ? t("won") : t("lost")}
        </div>
      )}

      {/* Grid */}
      <div className="overflow-auto max-w-full">
        <div
          className="grid gap-0.5 bg-gray-300 dark:bg-gray-600 p-0.5 rounded select-none"
          style={{ gridTemplateColumns: `repeat(${grid[0]?.length ?? 9}, minmax(0, 1fr))` }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`w-8 h-8 flex items-center justify-center text-xs font-bold rounded-sm transition-colors ${
                  cell.isRevealed
                    ? cell.isMine
                      ? "bg-red-400 dark:bg-red-600"
                      : "bg-gray-100 dark:bg-gray-800"
                    : cell.isFlagged
                    ? "bg-amber-200 dark:bg-amber-700"
                    : "bg-gray-300 dark:bg-gray-500 hover:bg-gray-200 dark:hover:bg-gray-400 active:bg-gray-100"
                }`}
                onClick={() => reveal(r, c)}
                onContextMenu={(e) => { e.preventDefault(); toggleFlag(r, c); }}
                onTouchStart={() => onTouchStart(r, c)}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchEnd}
              >
                {cell.isRevealed && cell.isMine && "💣"}
                {cell.isRevealed && !cell.isMine && cell.adjacentMines > 0 && (
                  <span className={NUM_COLORS[cell.adjacentMines]}>{cell.adjacentMines}</span>
                )}
                {!cell.isRevealed && cell.isFlagged && "🚩"}
              </button>
            ))
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">{t("hint")}</p>
    </div>
  );
}
