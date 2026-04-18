"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// アクセント文字→ASCII マッピング
const ACCENT_MAP: Record<string, string> = {
  à: "a", á: "a", â: "a", ã: "a", ä: "a", å: "a", æ: "ae",
  ç: "c", è: "e", é: "e", ê: "e", ë: "e",
  ì: "i", í: "i", î: "i", ï: "i",
  ñ: "n", ò: "o", ó: "o", ô: "o", õ: "o", ö: "o", ø: "o",
  ù: "u", ú: "u", û: "u", ü: "u",
  ý: "y", ÿ: "y", ß: "ss",
};

function toSlug(text: string, separator: string, lowercase: boolean, removeNumbers: boolean): string {
  let s = text;

  // アクセント文字を変換
  s = s.replace(/[àáâãäåæçèéêëìíîïñòóôõöøùúûüýÿß]/g, (c) => ACCENT_MAP[c] ?? c);

  // 小文字化
  if (lowercase) s = s.toLowerCase();

  // 数字を除去
  if (removeNumbers) s = s.replace(/[0-9]/g, " ");

  // 英数字・ハイフン以外を区切り文字に変換
  s = s.replace(/[^a-zA-Z0-9]+/g, separator);

  // 先頭・末尾の区切り文字を除去
  const sep = separator.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  s = s.replace(new RegExp(`^${sep}+|${sep}+$`, "g"), "");

  return s;
}

export default function TextToSlug() {
  const t = useTranslations("text-to-slug");
  const [input, setInput] = useState("");
  const [separator, setSeparator] = useState("-");
  const [lowercase, setLowercase] = useState(true);
  const [removeNumbers, setRemoveNumbers] = useState(false);
  const [toast, setToast] = useState(false);

  const slug = useMemo(
    () => toSlug(input, separator, lowercase, removeNumbers),
    [input, separator, lowercase, removeNumbers]
  );

  const handleCopy = async () => {
    if (!slug) return;
    try {
      await navigator.clipboard.writeText(slug);
      setToast(true);
      setTimeout(() => setToast(false), 1800);
    } catch { }
  };

  return (
    <div className="space-y-5">
      {/* 入力 */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          {t("labels.input")}
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          spellCheck={false}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* オプション */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* 区切り文字 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t("options.separator")}</label>
          <div className="flex gap-2">
            {[
              { value: "-", label: t("options.hyphen") },
              { value: "_", label: t("options.underscore") },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="radio"
                  name="separator"
                  value={value}
                  checked={separator === value}
                  onChange={() => setSeparator(value)}
                  className="accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* トグル */}
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lowercase}
              onChange={(e) => setLowercase(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-gray-700">{t("options.lowercase")}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={removeNumbers}
              onChange={(e) => setRemoveNumbers(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-gray-700">{t("options.removeNumbers")}</span>
          </label>
        </div>
      </div>

      {/* 出力 */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5">
          {t("labels.output")}
        </label>
        {slug ? (
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg
                             text-sm font-mono text-gray-800 break-all">
              {slug}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 btn-secondary text-xs px-3 py-2"
            >
              {t("buttons.copy")}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 text-center py-6">{t("results.empty")}</p>
        )}
      </div>

      {/* クリアボタン */}
      {input && (
        <button
          type="button"
          onClick={() => setInput("")}
          className="btn-secondary text-xs px-3 py-1.5"
        >
          {t("buttons.clear")}
        </button>
      )}

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("results.copied")}
        </div>
      )}
    </div>
  );
}
