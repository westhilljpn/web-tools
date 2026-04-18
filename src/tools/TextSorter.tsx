"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";

type SortMode = "az" | "za" | "lengthAsc" | "lengthDesc" | "random";

function sortLines(lines: string[], mode: SortMode, caseSensitive: boolean): string[] {
  const cmp = (a: string, b: string) =>
    caseSensitive ? a.localeCompare(b) : a.toLowerCase().localeCompare(b.toLowerCase());
  const arr = [...lines];
  switch (mode) {
    case "az":        return arr.sort(cmp);
    case "za":        return arr.sort((a, b) => cmp(b, a));
    case "lengthAsc": return arr.sort((a, b) => a.length - b.length || cmp(a, b));
    case "lengthDesc":return arr.sort((a, b) => b.length - a.length || cmp(a, b));
    case "random":    return arr.sort(() => Math.random() - 0.5);
  }
}

export default function TextSorter() {
  const t = useTranslations("text-sorter");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<SortMode>("az");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [removeDupes, setRemoveDupes] = useState(false);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  const output = useMemo(() => {
    let lines = debouncedInput.split("\n");
    if (removeEmpty) lines = lines.filter(l => l.trim() !== "");
    if (removeDupes) {
      const seen = new Set<string>();
      lines = lines.filter(l => {
        const key = caseSensitive ? l : l.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    return sortLines(lines, mode, caseSensitive).join("\n");
  }, [debouncedInput, mode, caseSensitive, removeDupes, removeEmpty]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }

  const MODES: { key: SortMode; label: string }[] = [
    { key: "az",         label: t("modes.az") },
    { key: "za",         label: t("modes.za") },
    { key: "lengthAsc",  label: t("modes.lengthAsc") },
    { key: "lengthDesc", label: t("modes.lengthDesc") },
    { key: "random",     label: t("modes.random") },
  ];

  const outputLineCount = output ? output.split("\n").filter(Boolean).length : 0;

  return (
    <div className="space-y-4">
      {/* 並び順ボタン */}
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              mode === key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* オプション */}
      <div className="flex flex-wrap gap-5 text-sm">
        {([
          { val: caseSensitive, set: setCaseSensitive, key: "caseSensitive" },
          { val: removeDupes,   set: setRemoveDupes,   key: "removeDuplicates" },
          { val: removeEmpty,   set: setRemoveEmpty,   key: "removeEmpty" },
        ] as const).map(({ val, set, key }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={val}
              onChange={e => set(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-gray-700">{t(`options.${key}`)}</span>
          </label>
        ))}
      </div>

      {/* 入力 / 出力 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{t("inputLabel")}</label>
            {input && (
              <button type="button" onClick={() => setInput("")}
                className="text-xs text-gray-400 hover:text-gray-600">
                {t("clear")}
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t("placeholder")}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">
              {t("outputLabel")}
              {outputLineCount > 0 && (
                <span className="ml-2 text-xs font-normal text-gray-400">
                  {outputLineCount} {t("lines")}
                </span>
              )}
            </label>
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
