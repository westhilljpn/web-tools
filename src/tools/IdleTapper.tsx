"use client";
import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useIdleTapper, UPGRADES } from "@/hooks/useIdleTapper";

function formatStars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return Math.floor(n).toString();
}

export default function IdleTapper() {
  const t = useTranslations("idle-tapper");
  const { stars, totalClicks, purchased, clickPower, autoRate, tap, buyUpgrade, resetGame } =
    useIdleTapper();
  const [pressed, setPressed] = useState(false);

  const handleTap = useCallback(() => {
    tap();
    setPressed(true);
    setTimeout(() => setPressed(false), 100);
  }, [tap]);

  const handleReset = useCallback(() => {
    if (window.confirm(t("resetConfirm"))) resetGame();
  }, [resetGame, t]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats */}
      <div className="flex gap-4 text-center">
        <div>
          <div className="text-3xl font-bold text-yellow-500">{formatStars(stars)}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t("stars")}</div>
        </div>
        {autoRate > 0 && (
          <div>
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              +{autoRate}{t("perSecond")}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t("autoLabel")}</div>
          </div>
        )}
      </div>

      {/* Tap button */}
      <button
        onClick={handleTap}
        className={`text-7xl select-none transition-transform active:scale-90 ${
          pressed ? "scale-90" : "scale-100 hover:scale-105"
        }`}
        aria-label={t("tap")}
      >
        ⭐
      </button>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t("clickPower")}: ×{clickPower} &nbsp;·&nbsp; {t("totalClicks")}: {totalClicks.toLocaleString()}
      </div>

      {/* Upgrades */}
      <div className="w-full max-w-sm">
        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">{t("upgrades")}</h3>
        <div className="flex flex-col gap-2">
          {UPGRADES.map((u) => {
            const isPurchased = purchased.includes(u.id);
            const canAfford = stars >= u.cost;
            return (
              <button
                key={u.id}
                onClick={() => buyUpgrade(u.id)}
                disabled={isPurchased || !canAfford}
                className={`flex items-center justify-between px-4 py-2 rounded-lg border text-sm transition-colors ${
                  isPurchased
                    ? "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 cursor-default"
                    : canAfford
                    ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 text-gray-800 dark:text-gray-200 cursor-pointer"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{u.description}</div>
                </div>
                <div className="ml-4 whitespace-nowrap font-semibold">
                  {isPurchased ? (
                    <span className="text-green-500">{t("purchased")}</span>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">⭐ {u.cost.toLocaleString()}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors underline"
      >
        {t("resetButton")}
      </button>
    </div>
  );
}
