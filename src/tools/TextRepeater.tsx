"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const SEPS = ["none", "newline", "space", "comma", "custom"] as const;
type SepKey = typeof SEPS[number];

export default function TextRepeater() {
  const t = useTranslations("text-repeater");
  const [text, setText] = useState("");
  const [count, setCount] = useState(3);
  const [sep, setSep] = useState<SepKey>("newline");
  const [custom, setCustom] = useState(" | ");
  const [copied, setCopied] = useState(false);

  const separator =
    sep === "none"    ? "" :
    sep === "newline" ? "\n" :
    sep === "space"   ? " " :
    sep === "comma"   ? ", " : custom;

  const output = useMemo(() => {
    if (!text.trim() || count < 1) return "";
    return Array(count).fill(text).join(separator);
  }, [text, count, separator]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-5">
      {/* テキスト入力 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t("labels.text")}
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("placeholder")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                     resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 繰り返し回数 + 区切り文字 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("labels.count")}
          </label>
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) =>
              setCount(Math.max(1, Math.min(1000, Number(e.target.value))))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("labels.separator")}
          </label>
          <select
            value={sep}
            onChange={(e) => setSep(e.target.value as SepKey)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {SEPS.map((s) => (
              <option key={s} value={s}>{t(`separators.${s}`)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* カスタム区切り文字 */}
      {sep === "custom" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("labels.customSep")}
          </label>
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      )}

      {/* 出力 */}
      {output ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              {t("labels.output")}
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {t("charCount", { n: output.length })}
              </span>
              <button type="button" onClick={handleCopy}
                className="text-xs text-primary hover:underline">
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            rows={6}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono
                       bg-gray-50 resize-y select-all"
          />
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-4">{t("empty")}</p>
      )}
    </div>
  );
}
