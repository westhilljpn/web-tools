"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

function analyze(text: string) {
  if (!text.trim()) return null;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = text.length;
  const charNoSpaces = text.replace(/\s/g, "").length;

  // 文: . ! ? で区切る
  const sentences = text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;

  // 段落: 空白行で区切る
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // 読了・スピーチ時間（秒）
  const readingSeconds = Math.round((wordCount / 200) * 60);
  const speakingSeconds = Math.round((wordCount / 130) * 60);

  // ユニーク単語数
  const uniqueWords = new Set(
    words.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
  ).size;

  // 平均単語長
  const avgWordLen =
    wordCount > 0
      ? (words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z0-9]/g, "").length, 0) / wordCount).toFixed(1)
      : "0";

  // 最長単語（アルファベットのみ）
  const longestWord = words.reduce((longest, w) => {
    const clean = w.replace(/[^a-zA-Z]/g, "");
    return clean.length > longest.length ? clean : longest;
  }, "");

  // 頻出単語 TOP 5（ストップワード除外）
  const stopWords = new Set([
    "the","a","an","and","or","but","in","on","at","to","for","of","with","is","it","this","that",
    "was","are","be","as","by","from","have","had","he","she","they","we","i","you","not","no","so",
    "if","than","do","did","has","been","will","would","can","could","should","may","might",
  ]);
  const freq: Record<string, number> = {};
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length > 2 && !stopWords.has(clean)) {
      freq[clean] = (freq[clean] ?? 0) + 1;
    }
  });
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return {
    wordCount, charCount, charNoSpaces, sentences, paragraphs,
    readingSeconds, speakingSeconds, uniqueWords, avgWordLen,
    longestWord, topWords,
  };
}

function formatTime(seconds: number, minLabel: string, secLabel: string): string {
  if (seconds < 60) return `${seconds} ${secLabel}`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m} ${minLabel} ${s} ${secLabel}` : `${m} ${minLabel}`;
}

interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}
function StatCard({ label, value, highlight }: StatCardProps) {
  return (
    <div className={`rounded-lg p-3 border ${highlight ? "border-primary/30 bg-primary/5" : "border-gray-200 bg-white"}`}>
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

export default function WordCounter() {
  const t = useTranslations("word-counter");
  const [text, setText] = useState("");

  const stats = useMemo(() => analyze(text), [text]);

  return (
    <div className="space-y-5">
      {/* テキストエリア */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t("placeholder")}
        rows={8}
        spellCheck={false}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm leading-relaxed
                   resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      {/* クリアボタン */}
      {text && (
        <button
          type="button"
          onClick={() => setText("")}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {t("buttons.clear")}
        </button>
      )}

      {/* 統計カード */}
      {stats ? (
        <div className="space-y-4">
          {/* メイン統計グリッド */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            <StatCard label={t("labels.words")} value={stats.wordCount.toLocaleString()} highlight />
            <StatCard label={t("labels.characters")} value={stats.charCount.toLocaleString()} />
            <StatCard label={t("labels.charactersNoSpaces")} value={stats.charNoSpaces.toLocaleString()} />
            <StatCard label={t("labels.sentences")} value={stats.sentences.toLocaleString()} />
            <StatCard label={t("labels.paragraphs")} value={stats.paragraphs.toLocaleString()} />
            <StatCard label={t("labels.uniqueWords")} value={stats.uniqueWords.toLocaleString()} />
            <StatCard
              label={t("labels.readingTime")}
              value={formatTime(stats.readingSeconds, t("labels.minutes"), t("labels.seconds"))}
            />
            <StatCard
              label={t("labels.speakingTime")}
              value={formatTime(stats.speakingSeconds, t("labels.minutes"), t("labels.seconds"))}
            />
          </div>

          {/* 詳細統計 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-gray-500 font-medium mb-1">{t("labels.avgWordLength")}</p>
              <p className="text-gray-900 font-semibold">{stats.avgWordLen} chars</p>
            </div>
            {stats.longestWord && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <p className="text-gray-500 font-medium mb-1">{t("labels.longestWord")}</p>
                <p className="text-gray-900 font-semibold font-mono">{stats.longestWord}</p>
              </div>
            )}
          </div>

          {/* 頻出単語 */}
          {stats.topWords.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">{t("labels.topWords")}</p>
              <div className="flex flex-wrap gap-2">
                {stats.topWords.map(([word, count]) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs"
                  >
                    <span className="text-gray-800 font-medium">{word}</span>
                    <span className="text-gray-400">×{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-6">{t("results.empty")}</p>
      )}
    </div>
  );
}
