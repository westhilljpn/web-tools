"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

export default function TextDeduplicator() {
  const t = useTranslations("text-deduplicator");
  const [input, setInput] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(false);
  const [copied, setCopied] = useState(false);

  const { output, inputCount, outputCount, removedCount } = useMemo(() => {
    let lines = input.split("\n");
    if (removeEmpty) lines = lines.filter((l) => l.trim() !== "");
    const seen = new Set<string>();
    const result: string[] = [];
    for (const line of lines) {
      const trimmed = trimWhitespace ? line.trim() : line;
      const key = caseSensitive ? trimmed : trimmed.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(trimmed);
      }
    }
    return {
      output: result.join("\n"),
      inputCount: lines.length,
      outputCount: result.length,
      removedCount: lines.length - result.length,
    };
  }, [input, caseSensitive, trimWhitespace, removeEmpty]);

  async function handleCopy() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {/* オプション */}
      <div className="flex flex-wrap gap-5 text-sm">
        {(
          [
            { val: caseSensitive, set: setCaseSensitive, key: "caseSensitive" },
            { val: trimWhitespace, set: setTrimWhitespace, key: "trimWhitespace" },
            { val: removeEmpty, set: setRemoveEmpty, key: "removeEmpty" },
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

      {/* 統計バッジ */}
      {input && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700">
            {t("stats.input")} {inputCount}
          </span>
          <span className="px-3 py-1 rounded-full bg-green-50 text-green-700">
            {t("stats.output")} {outputCount}
          </span>
          {removedCount > 0 && (
            <span className="px-3 py-1 rounded-full bg-red-50 text-red-700">
              {t("stats.removed")} {removedCount}
            </span>
          )}
        </div>
      )}

      {/* 入力 / 出力 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{t("inputLabel")}</label>
            {input && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                {t("clear")}
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{t("outputLabel")}</label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700
                         disabled:opacity-40 transition-colors"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={12}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-y
                       bg-gray-50 dark:bg-slate-800/50"
          />
        </div>
      </div>
    </div>
  );
}
