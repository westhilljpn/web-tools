"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

const GENKOU_SIZE = 400;
const TWITTER_LIMIT = 280;

function isHalfWidth(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return (cp >= 0x00 && cp <= 0x7f) || (cp >= 0xff61 && cp <= 0xff9f);
}

function countTwitterWeight(text: string): number {
  let count = 0;
  Array.from(text).forEach((ch) => {
    const cp = ch.codePointAt(0) ?? 0;
    count += (cp >= 0x00 && cp <= 0x7f) ? 1 : 2;
  });
  return count;
}

export default function CharacterCounterJp() {
  const t = useTranslations("character-counter-jp");
  const [input, setInput] = useState("");

  const stats = useMemo(() => {
    const chars = Array.from(input);
    const total = chars.length;
    const withoutNewlines = chars.filter((c) => c !== "\n").length;
    const half = chars.filter((c) => isHalfWidth(c) && c !== "\n").length;
    const full = withoutNewlines - half;
    const twitterWeight = countTwitterWeight(input.replace(/\n/g, ""));
    return { total, withoutNewlines, half, full, twitterWeight };
  }, [input]);

  const genkouPages = stats.total / GENKOU_SIZE;
  const genkouBarPct = stats.total === 0 ? 0 : Math.min(((genkouPages % 1) || 1) * 100, 100);
  const twitterRemaining = TWITTER_LIMIT - stats.twitterWeight;
  const twitterBarPct = Math.min((stats.twitterWeight / TWITTER_LIMIT) * 100, 100);
  const twitterOver = twitterRemaining < 0;

  const RESUME_SECTIONS = [
    { key: "motivation", min: 100, max: 300 },
    { key: "selfPr", min: 100, max: 300 },
    { key: "activities", min: 100, max: 200 },
  ] as const;

  return (
    <div className="space-y-6">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t("placeholder")}
        rows={8}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y
                   focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
      />

      {/* 基本統計 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { key: "total", val: stats.total },
            { key: "withoutNewlines", val: stats.withoutNewlines },
            { key: "halfWidth", val: stats.half },
            { key: "fullWidth", val: stats.full },
          ] as const
        ).map(({ key, val }) => (
          <div key={key} className="tool-card p-3 text-center">
            <div className="text-2xl font-bold text-primary tabular-nums">
              {val.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">{t(`stats.${key}`)}</div>
          </div>
        ))}
      </div>

      {/* 原稿用紙換算 */}
      <div className="tool-card p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t("sections.genkou")}</h2>
        <div className="flex items-end gap-2 mb-2">
          <span className="text-3xl font-bold text-primary tabular-nums">
            {genkouPages.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500 mb-1">{t("genkouUnit")}</span>
        </div>
        <p className="text-xs text-gray-400 mb-2">{t("genkouNote")}</p>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/60 rounded-full transition-all duration-300"
            style={{ width: `${genkouBarPct}%` }}
          />
        </div>
      </div>

      {/* X/Twitter */}
      <div className="tool-card p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t("sections.twitter")}</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="tabular-nums font-medium text-sm">
            {stats.twitterWeight} / {TWITTER_LIMIT}
          </span>
          <span
            className={`text-sm font-medium tabular-nums ${
              twitterOver ? "text-red-500" : "text-gray-600"
            }`}
          >
            {twitterOver
              ? `${Math.abs(twitterRemaining)} ${t("over")}`
              : `${twitterRemaining} ${t("remaining")}`}
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              twitterOver ? "bg-red-400" : "bg-primary/60"
            }`}
            style={{ width: `${Math.min(twitterBarPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{t("twitterNote")}</p>
      </div>

      {/* 履歴書目安 */}
      <div className="tool-card p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t("sections.resume")}</h2>
        <div className="space-y-4">
          {RESUME_SECTIONS.map(({ key, min, max }) => {
            const pct = Math.min((stats.withoutNewlines / max) * 100, 100);
            const inRange =
              stats.withoutNewlines >= min && stats.withoutNewlines <= max;
            const over = stats.withoutNewlines > max;
            const below = stats.withoutNewlines > 0 && stats.withoutNewlines < min;
            return (
              <div key={key}>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{t(`resume.${key}`)}</span>
                  <span>
                    {min}〜{max}{t("chars")}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      inRange
                        ? "bg-green-400"
                        : over
                        ? "bg-red-400"
                        : below
                        ? "bg-yellow-400"
                        : "bg-primary/60"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">{t("resumeNote")}</p>
      </div>
    </div>
  );
}
