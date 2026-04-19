"use client";
import { useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import { use2048 } from "@/hooks/use2048";

const TILE_STYLES: Record<number, string> = {
  2:    "bg-amber-100 text-gray-700",
  4:    "bg-amber-200 text-gray-700",
  8:    "bg-orange-300 text-white",
  16:   "bg-orange-400 text-white",
  32:   "bg-orange-500 text-white",
  64:   "bg-red-500 text-white",
  128:  "bg-yellow-400 text-white",
  256:  "bg-yellow-500 text-white",
  512:  "bg-yellow-600 text-white",
  1024: "bg-yellow-700 text-white",
  2048: "bg-yellow-800 text-white",
};

function tileStyle(v: number) {
  return TILE_STYLES[v] ?? "bg-purple-600 text-white";
}

export default function Game2048() {
  const t = useTranslations("game-2048");
  const { grid, score, bestScore, status, move, reset, continueGame } = use2048();
  const touchX = useRef(0);
  const touchY = useRef(0);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const map: Record<string, "left" | "right" | "up" | "down"> = {
        ArrowLeft: "left",
        ArrowRight: "right",
        ArrowUp: "up",
        ArrowDown: "down",
      };
      if (map[e.key]) {
        e.preventDefault();
        move(map[e.key]);
      }
    },
    [move]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
    touchY.current = e.touches[0].clientY;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchX.current;
      const dy = e.changedTouches[0].clientY - touchY.current;
      if (Math.abs(dx) < 50 && Math.abs(dy) < 50) return;
      if (Math.abs(dx) > Math.abs(dy)) move(dx > 0 ? "right" : "left");
      else move(dy > 0 ? "down" : "up");
    },
    [move]
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex w-full max-w-xs justify-between items-center">
        <div className="flex gap-2">
          {[
            { label: t("score"), val: score },
            { label: t("best"), val: bestScore },
          ].map(({ label, val }) => (
            <div
              key={label}
              className="bg-amber-100 dark:bg-amber-900/50 rounded-lg px-3 py-1 text-center min-w-[64px]"
            >
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              <div className="font-bold text-gray-800 dark:text-amber-100">{val}</div>
            </div>
          ))}
        </div>
        <button
          onClick={reset}
          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm transition-colors"
        >
          {t("newGame")}
        </button>
      </div>

      <div
        className="relative bg-amber-300 dark:bg-amber-700 p-2 rounded-xl grid grid-cols-4 gap-2 select-none touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {grid.flat().map((v, i) => (
          <div
            key={i}
            className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center rounded-lg font-bold text-base sm:text-xl transition-colors ${
              v === 0
                ? "bg-amber-200/60 dark:bg-amber-600/40"
                : tileStyle(v)
            }`}
          >
            {v !== 0 && v}
          </div>
        ))}

        {status !== "playing" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 rounded-xl">
            <p className="text-white text-2xl font-bold">
              {status === "won" ? t("won") : t("gameOver")}
            </p>
            {status === "won" && (
              <button
                onClick={continueGame}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
              >
                {t("continue")}
              </button>
            )}
            <button
              onClick={reset}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
            >
              {t("tryAgain")}
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">{t("hint")}</p>
    </div>
  );
}
