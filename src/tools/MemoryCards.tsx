"use client";
import { useTranslations } from "next-intl";
import { useMemoryCards } from "@/hooks/useMemoryCards";

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  return m > 0 ? `${m}:${String(s % 60).padStart(2, "0")}` : `${s}s`;
}

export default function MemoryCards() {
  const t = useTranslations("memory-cards");
  const { cards, moves, matches, status, elapsed, bestMoves, flip, reset } = useMemoryCards();

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stats */}
      <div className="flex gap-3 items-center w-full max-w-sm justify-between">
        <div className="flex gap-3">
          {[
            { label: t("moves"), val: moves },
            { label: t("pairs"), val: `${matches}/8` },
            { label: t("time"),  val: formatTime(elapsed) },
          ].map(({ label, val }) => (
            <div key={label} className="bg-purple-50 dark:bg-purple-900/20 rounded-lg px-2 py-1 text-center min-w-[48px]">
              <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              <div className="font-bold text-gray-800 dark:text-purple-200 text-sm">{val}</div>
            </div>
          ))}
        </div>
        <button
          onClick={reset}
          className="px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {t("newGame")}
        </button>
      </div>

      {bestMoves !== null && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{t("best")}: {bestMoves} {t("moves")}</p>
      )}

      {/* Card grid */}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => flip(card.id)}
            disabled={card.isMatched || status === "won"}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl text-2xl sm:text-3xl font-bold transition-all duration-200 select-none ${
              card.isMatched
                ? "bg-green-100 dark:bg-green-900/30 scale-95 cursor-default"
                : card.isFlipped
                ? "bg-white dark:bg-gray-700 shadow-md scale-105"
                : "bg-purple-400 dark:bg-purple-700 hover:bg-purple-300 dark:hover:bg-purple-600 cursor-pointer"
            }`}
          >
            {card.isFlipped || card.isMatched ? card.emoji : ""}
          </button>
        ))}
      </div>

      {/* Won banner (inline) */}
      {status === "won" && (
        <div className="w-full max-w-sm bg-green-50 dark:bg-green-900/30 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">{t("won")}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {moves} {t("moves")} · {formatTime(elapsed)}
          </p>
          <button onClick={reset} className="mt-3 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition-colors text-sm">
            {t("newGame")}
          </button>
        </div>
      )}
    </div>
  );
}
