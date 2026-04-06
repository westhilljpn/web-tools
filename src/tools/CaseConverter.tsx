"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

const CASE_KEYS = [
  "upper", "lower", "title", "camel", "pascal", "snake", "kebab", "constant",
] as const;
type CaseKey = (typeof CASE_KEYS)[number];

// 入力テキストを単語リストに分割する
function tokenize(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")       // camelCase → camel Case
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2") // ABCDef → ABC Def
    .split(/[\s_\-]+/)
    .filter(Boolean)
    .map((w) => w.toLowerCase());
}

function convert(words: string[], type: CaseKey): string {
  if (words.length === 0) return "";
  const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);
  switch (type) {
    case "upper":    return words.join(" ").toUpperCase();
    case "lower":    return words.join(" ");
    case "title":    return words.map(cap).join(" ");
    case "camel":    return words.map((w, i) => (i === 0 ? w : cap(w))).join("");
    case "pascal":   return words.map(cap).join("");
    case "snake":    return words.join("_");
    case "kebab":    return words.join("-");
    case "constant": return words.join("_").toUpperCase();
  }
}

export default function CaseConverter() {
  const t = useTranslations("case-converter");
  const { copy } = useClipboard();
  const [input, setInput] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const results = useMemo<Record<CaseKey, string>>(() => {
    const words = input.trim() ? tokenize(input) : [];
    return Object.fromEntries(
      CASE_KEYS.map((k) => [k, convert(words, k)])
    ) as Record<CaseKey, string>;
  }, [input]);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      showToast(t("toast.pasted"));
    } catch {
      showToast(t("toast.pasteError"));
    }
  }

  async function handleCopy(key: CaseKey) {
    await copy(results[key]);
    showToast(t("toast.copied"));
  }

  return (
    <div className="space-y-6">
      {/* 入力 */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label htmlFor="case-input" className="text-sm font-medium text-gray-700">
            {t("inputLabel")}
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={handlePaste} className="btn-secondary text-xs px-3 py-1.5">
              {t("buttons.paste")}
            </button>
            <button
              type="button"
              onClick={() => setInput("")}
              disabled={!input}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.clear")}
            </button>
          </div>
        </div>
        <textarea
          id="case-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     resize-y font-mono leading-relaxed"
        />
      </div>

      {/* 変換結果グリッド */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CASE_KEYS.map((key) => (
          <ResultCard
            key={key}
            label={t(`cases.${key}`)}
            value={results[key]}
            onCopy={() => handleCopy(key)}
            copyLabel={t("buttons.copy")}
          />
        ))}
      </div>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}

// 各ケースの結果カード
interface ResultCardProps {
  label: string;
  value: string;
  onCopy: () => void;
  copyLabel: string;
}

function ResultCard({ label, value, onCopy, copyLabel }: ResultCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-xs font-medium text-gray-500 font-mono truncate">{label}</span>
        <button
          type="button"
          onClick={onCopy}
          disabled={!value}
          className="btn-secondary text-xs px-2 py-0.5 shrink-0"
        >
          {copyLabel}
        </button>
      </div>
      <p className="text-sm font-mono text-gray-800 break-all min-h-[1.5rem] leading-relaxed">
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  );
}
