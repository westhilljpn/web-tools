"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import { useDebounce } from "@/lib/hooks/useDebounce";
import Toast from "@/components/Toast";

type Mode = "format" | "minify";
type IndentType = "2" | "4" | "tab";

const SAMPLE_JSON = `{
  "name": "Alice",
  "age": 30,
  "email": "alice@example.com",
  "address": {
    "city": "Tokyo",
    "country": "JP"
  },
  "hobbies": ["reading", "coding", "hiking"],
  "active": true
}`;

export default function JsonFormatter() {
  const t = useTranslations("json-formatter");
  const { copy } = useClipboard();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState<IndentType>("2");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  // 大きなJSONでもフリーズしないよう 300ms デバウンス
  const debouncedInput = useDebounce(input, 300);

  const { output, error, isValid } = useMemo(() => {
    const src = debouncedInput.trim();
    if (!src) return { output: "", error: null, isValid: null };
    try {
      const parsed = JSON.parse(src);
      const indentVal = indent === "tab" ? "\t" : Number(indent);
      const formatted =
        mode === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indentVal);
      return { output: formatted, error: null, isValid: true };
    } catch (e) {
      return { output: "", error: (e as Error).message, isValid: false };
    }
  }, [debouncedInput, mode, indent]);

  const outputLines = output ? output.split("\n").length : 0;
  const outputBytes = output ? new TextEncoder().encode(output).length : 0;

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      showToast(t("toast.pasted"));
    } catch {
      showToast(t("toast.pasteError"));
    }
  }

  async function handleCopy() {
    await copy(output);
    showToast(t("toast.copied"));
  }

  function handleSample() {
    setInput(SAMPLE_JSON.trim());
    showToast(t("toast.sampleLoaded"));
  }

  return (
    <div className="space-y-5">
      {/* モード切替 + インデント選択 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["format", "minify"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t(`modes.${m}`)}
            </button>
          ))}
        </div>

        {mode === "format" && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="text-xs text-gray-400">{t("indent.label")}:</span>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["2", "4", "tab"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setIndent(v)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    indent === v
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t(`indent.${v}`)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 入力エリア */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label className="text-sm font-medium text-gray-700">
            {t("inputLabel")}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSample}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.sample")}
            </button>
            <button
              type="button"
              onClick={handlePaste}
              className="btn-secondary text-xs px-3 py-1.5"
            >
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={10}
          spellCheck={false}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     resize-y font-mono leading-relaxed"
        />
      </div>

      {/* バリデーション ステータスバー */}
      {isValid !== null && (
        <div
          className={`flex items-start gap-2 px-3 py-2 rounded-lg text-sm ${
            isValid
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span className="shrink-0 font-semibold">
            {isValid ? "✓" : "✗"}
          </span>
          <span className="break-all">
            {isValid ? t("status.valid") : `${t("status.invalid")}: ${error}`}
          </span>
        </div>
      )}

      {/* 出力エリア */}
      {isValid && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">
                {t("outputLabel")}
              </label>
              {outputLines > 0 && (
                <span className="text-xs text-gray-400">
                  {t("stats.lines", { count: outputLines.toLocaleString() })}
                  {" · "}
                  {t("stats.bytes", { size: outputBytes.toLocaleString() })}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.copy")}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={12}
            spellCheck={false}
            placeholder={t("outputPlaceholder")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm
                       bg-gray-50 resize-y font-mono leading-relaxed text-gray-700"
          />
        </div>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
