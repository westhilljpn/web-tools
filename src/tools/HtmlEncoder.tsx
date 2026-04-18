"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

const NAMED_MAP: [RegExp, string][] = [
  [/&/g,  "&amp;"],
  [/</g,  "&lt;"],
  [/>/g,  "&gt;"],
  [/"/g,  "&quot;"],
  [/'/g,  "&#39;"],
];

function encodeSpecial(text: string): string {
  return NAMED_MAP.reduce((s, [re, ent]) => s.replace(re, ent), text);
}

function encodeAll(text: string): string {
  return Array.from(text)
    .map((c) => {
      const code = c.codePointAt(0) ?? c.charCodeAt(0);
      // ASCII 印刷可能文字（スペース含む）はそのまま、それ以外と特殊文字はエンコード
      if (code > 32 && code < 127 && !"&<>\"'".includes(c)) return c;
      return `&#${code};`;
    })
    .join("");
}

function decodeHtml(text: string): string {
  // ブラウザのパーサーを利用して安全にデコード
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

type Mode = "encode" | "decode";
type EncodeMode = "special" | "all";

export default function HtmlEncoder() {
  const t = useTranslations("html-encoder");
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [encodeMode, setEncodeMode] = useState<EncodeMode>("special");
  const [toast, setToast] = useState(false);

  const output = useMemo(() => {
    if (!input) return "";
    if (mode === "decode") return decodeHtml(input);
    return encodeMode === "all" ? encodeAll(input) : encodeSpecial(input);
  }, [input, mode, encodeMode]);

  const handleSwap = () => {
    setInput(output);
    setMode((m) => (m === "encode" ? "decode" : "encode"));
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setToast(true);
      setTimeout(() => setToast(false), 1800);
    } catch { }
  };

  return (
    <div className="space-y-5">
      {/* モード切替 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {t(`options.${m}`)}
            </button>
          ))}
        </div>

        {mode === "encode" && (
          <div className="flex flex-wrap gap-3">
            {(["special", "all"] as EncodeMode[]).map((em) => (
              <label key={em} className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-700">
                <input
                  type="radio"
                  name="encodeMode"
                  checked={encodeMode === em}
                  onChange={() => setEncodeMode(em)}
                  className="accent-primary"
                />
                {t(`options.encode${em === "special" ? "Special" : "All"}`)}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 2列テキストエリア */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{t("labels.input")}</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "encode" ? "Hello <World> & \"Friends\"" : "&lt;p&gt;Hello&lt;/p&gt;"}
            spellCheck={false}
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                       leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{t("labels.output")}</p>
          <textarea
            readOnly
            value={output}
            rows={10}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-mono
                       leading-relaxed resize-y bg-gray-50 focus:outline-none"
          />
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleCopy} disabled={!output}
          className="btn-primary text-sm px-4 py-2 disabled:opacity-50">
          {t("buttons.copy")}
        </button>
        <button type="button" onClick={handleSwap} disabled={!output}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">
          {t("buttons.swap")}
        </button>
        <button type="button" onClick={() => setInput("")} disabled={!input}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50">
          {t("buttons.clear")}
        </button>
      </div>

      {!input && (
        <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {t("results.copied")}
        </div>
      )}
    </div>
  );
}
