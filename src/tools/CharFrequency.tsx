"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Tab = "char" | "word";
type Entry = { key: string; count: number };

function getCharFreq(text: string, excludeSpaces: boolean, excludePunct: boolean): Entry[] {
  const map = new Map<string, number>();
  Array.from(text).forEach((ch) => {
    if (excludeSpaces && /\s/.test(ch)) return;
    if (excludePunct && /[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]/.test(ch)) return;
    map.set(ch, (map.get(ch) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

// 単語境界: ASCII英字 + 日本語文字（ひらがな・カタカナ・漢字）+ ハングル
const WORD_RE = /[a-zA-Z\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uAC00-\uD7AF]+/g;

function getWordFreq(text: string): Entry[] {
  const words = text.toLowerCase().match(WORD_RE) ?? [];
  const map = new Map<string, number>();
  for (const w of words) map.set(w, (map.get(w) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count);
}

export default function CharFrequency() {
  const t = useTranslations("char-frequency");
  const [input, setInput] = useState("");
  const [tab, setTab] = useState<Tab>("char");
  const [excludeSpaces, setExcludeSpaces] = useState(true);
  const [excludePunct, setExcludePunct] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const { entries, totalChars, uniqueChars, uniqueWords } = useMemo(() => {
    const charEntries = getCharFreq(input, excludeSpaces, excludePunct);
    const wordEntries = getWordFreq(input);
    return {
      entries: tab === "char" ? charEntries : wordEntries,
      totalChars: Array.from(input).length,
      uniqueChars: new Set(Array.from(input).filter((c) => !/\s/.test(c))).size,
      uniqueWords: new Set((input.toLowerCase().match(WORD_RE) ?? [])).size,
    };
  }, [input, tab, excludeSpaces, excludePunct]);

  const TOP = 20;
  const displayed = showAll ? entries : entries.slice(0, TOP);
  const max = entries[0]?.count ?? 1;

  return (
    <div className="space-y-4">
      <div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 統計バッジ */}
      {input && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {t("stats.totalChars")} {totalChars.toLocaleString()}
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700">
            {t("stats.uniqueChars")} {uniqueChars.toLocaleString()}
          </span>
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700">
            {t("stats.uniqueWords")} {uniqueWords.toLocaleString()}
          </span>
        </div>
      )}

      {/* タブ + オプション */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["char", "word"] as Tab[]).map((tb) => (
            <button
              key={tb}
              type="button"
              onClick={() => { setTab(tb); setShowAll(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === tb
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t(`tabs.${tb}`)}
            </button>
          ))}
        </div>
        {tab === "char" && (
          <div className="flex flex-wrap gap-4 text-sm">
            {(
              [
                { val: excludeSpaces, set: setExcludeSpaces, key: "excludeSpaces" },
                { val: excludePunct, set: setExcludePunct, key: "excludePunct" },
              ] as const
            ).map(({ val, set, key }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => set(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-gray-700">{t(`options.${key}`)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 棒グラフ */}
      {entries.length > 0 ? (
        <div className="space-y-1.5">
          <div className="grid grid-cols-[24px_60px_1fr_40px] gap-x-3 text-xs text-gray-400 mb-2 px-1">
            <span>#</span>
            <span>{t("columnKey")}</span>
            <span></span>
            <span className="text-right">{t("columnCount")}</span>
          </div>
          {displayed.map(({ key, count }, i) => (
            <div key={`${key}-${i}`} className="grid grid-cols-[24px_60px_1fr_40px] items-center gap-x-3 text-sm">
              <span className="text-xs text-gray-400 text-right">{i + 1}</span>
              <span className="font-mono text-gray-700 truncate">
                {key === " " ? t("space") : key}
              </span>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/60 rounded-full"
                  style={{ width: `${(count / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 text-right tabular-nums">{count}</span>
            </div>
          ))}
          {entries.length > TOP && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="w-full text-xs text-primary hover:underline mt-2 py-1"
            >
              {showAll
                ? t("showLess")
                : t("showAll", { count: entries.length - TOP })}
            </button>
          )}
        </div>
      ) : (
        input && (
          <p className="text-sm text-gray-400 text-center py-4">{t("noData")}</p>
        )
      )}
    </div>
  );
}
