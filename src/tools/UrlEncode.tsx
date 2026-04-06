"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

type Mode = "encode" | "decode";

export default function UrlEncode() {
  const t = useTranslations("url-encode");
  const { copy } = useClipboard();
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("encode");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const { output, hasError } = useMemo(() => {
    if (!input.trim()) return { output: "", hasError: false };
    try {
      return {
        output: mode === "encode"
          ? encodeURIComponent(input)
          : decodeURIComponent(input),
        hasError: false,
      };
    } catch {
      return { output: "", hasError: true };
    }
  }, [input, mode]);

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

  function handleSwap() {
    if (!output || hasError) return;
    setInput(output);
    setMode(mode === "encode" ? "decode" : "encode");
  }

  return (
    <div className="space-y-5">
      {/* モード切替 */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
        {(["encode", "decode"] as const).map((m) => (
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

      {/* 入力 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{t("inputLabel")}</label>
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(`placeholder.${mode}`)}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     resize-y font-mono leading-relaxed"
        />
      </div>

      {/* 入出力交換ボタン */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSwap}
          disabled={!output || hasError}
          className="btn-secondary text-sm px-5 py-2"
        >
          {t("buttons.swap")}
        </button>
      </div>

      {/* 出力 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-700">{t("outputLabel")}</label>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!output || hasError}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {t("buttons.copy")}
          </button>
        </div>
        {hasError ? (
          <div className="w-full px-4 py-3 border border-red-200 rounded-lg bg-red-50 text-sm text-red-600">
            {t("error")}
          </div>
        ) : (
          <textarea
            readOnly
            value={output}
            rows={5}
            placeholder={t("outputPlaceholder")}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm
                       bg-gray-50 resize-y font-mono leading-relaxed text-gray-700"
          />
        )}
      </div>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
