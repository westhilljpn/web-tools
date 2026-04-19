"use client";
import { useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useSnakeGame, GRID, type Direction } from "@/hooks/useSnakeGame";

export default function SnakeGame() {
  const t = useTranslations("snake-game");
  const { snake, snakeSet, headKey, foodKey, status, score, bestScore, start, togglePause, setDir, reset } =
    useSnakeGame();
  const touchX = useRef(0);
  const touchY = useRef(0);

  const onKeyDown = useCallback((e: KeyboardEvent) => {
    const map: Record<string, Direction> = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", s: "down", a: "left", d: "right",
    };
    if (map[e.key]) { e.preventDefault(); setDir(map[e.key]); }
    if (e.key === " ") { e.preventDefault(); if (status === "idle") start(); else togglePause(); }
  }, [setDir, start, togglePause, status]);

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    const dy = e.changedTouches[0].clientY - touchY.current;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx > 0 ? "right" : "left");
    else setDir(dy > 0 ? "down" : "up");
  }, [setDir]);

  // suppress unused warning — snake is used via snakeSet/headKey
  void snake;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Header */}
      <div className="flex w-full max-w-xs justify-between items-center">
        <div className="flex gap-3">
          {[{ label: t("score"), val: score }, { label: t("best"), val: bestScore }].map(({ label, val }) => (
            <div key={label} className="bg-green-50 dark:bg-green-900/30 rounded-lg px-3 py-1 text-center min-w-[56px]">
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              <div className="font-bold text-gray-800 dark:text-green-300">{val}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {status !== "idle" && status !== "over" && (
            <button onClick={togglePause} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              {status === "paused" ? t("resume") : t("pause")}
            </button>
          )}
          <button onClick={status === "idle" ? start : reset} className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-semibold transition-colors">
            {status === "idle" ? t("start") : t("tryAgain")}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="relative border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden touch-none select-none"
        style={{ display: "grid", gridTemplateColumns: `repeat(${GRID}, 1fr)`, width: "min(360px, 100%)", aspectRatio: "1" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {Array.from({ length: GRID }, (_, y) =>
          Array.from({ length: GRID }, (_, x) => {
            const key = `${x},${y}`;
            const isHead = key === headKey;
            const isBody = !isHead && snakeSet.has(key);
            const isFood = key === foodKey;
            return (
              <div
                key={key}
                className={
                  isHead ? "bg-green-600 dark:bg-green-500" :
                  isBody ? "bg-green-400 dark:bg-green-700" :
                  isFood ? "bg-red-500 dark:bg-red-400 rounded-full" :
                  "bg-gray-50 dark:bg-gray-900"
                }
              />
            );
          })
        )}

        {/* Overlays */}
        {status === "idle" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg">
            <p className="text-white font-bold text-lg text-center px-4">{t("idle")}</p>
          </div>
        )}
        {status === "paused" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <p className="text-white font-bold text-2xl">{t("pause")}</p>
          </div>
        )}
        {status === "over" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-lg">
            <p className="text-white font-bold text-2xl">{t("gameOver")}</p>
            <p className="text-white text-lg">{t("score")}: {score}</p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">{t("hint")}</p>
    </div>
  );
}
