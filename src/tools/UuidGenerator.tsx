"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";

function generateUUID(uppercase: boolean, hyphens: boolean): string {
  const raw = crypto.randomUUID();
  let result = raw;
  if (!hyphens) result = result.replace(/-/g, "");
  if (uppercase) result = result.toUpperCase();
  return result;
}

export default function UuidGenerator() {
  const t = useTranslations("uuid-generator");
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [toast, setToast] = useState("");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  }, []);

  const handleGenerate = () => {
    const n = Math.max(1, Math.min(100, count));
    setUuids(Array.from({ length: n }, () => generateUUID(uppercase, hyphens)));
  };

  const handleCopyOne = async (uuid: string) => {
    try {
      await navigator.clipboard.writeText(uuid);
      showToast(t("results.copied"));
    } catch { }
  };

  const handleCopyAll = async () => {
    if (!uuids.length) return;
    try {
      await navigator.clipboard.writeText(uuids.join("\n"));
      showToast(t("results.copiedAll"));
    } catch { }
  };

  const handleClear = () => setUuids([]);

  return (
    <div className="space-y-5">
      {/* オプション */}
      <div className="flex flex-wrap items-end gap-4">
        {/* 件数 */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">{t("options.count")}</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* トグルオプション */}
        <div className="flex flex-wrap gap-4">
          {/* 大文字 */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-gray-700">{t("options.uppercase")}</span>
          </label>
          {/* ハイフン */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hyphens}
              onChange={(e) => setHyphens(e.target.checked)}
              className="w-4 h-4 rounded accent-primary"
            />
            <span className="text-sm text-gray-700">{t("options.hyphens")}</span>
          </label>
        </div>
      </div>

      {/* ボタン */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          className="btn-primary text-sm px-4 py-2"
        >
          {t("buttons.generate")}
        </button>
        <button
          type="button"
          onClick={handleCopyAll}
          disabled={!uuids.length}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
        >
          {t("buttons.copyAll")}
        </button>
        <button
          type="button"
          onClick={handleClear}
          disabled={!uuids.length}
          className="btn-secondary text-sm px-4 py-2 disabled:opacity-50"
        >
          {t("buttons.clear")}
        </button>
      </div>

      {/* 結果リスト */}
      {uuids.length > 0 ? (
        <ul className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
          {uuids.map((uuid, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-3 px-4 py-2.5
                         hover:bg-gray-50 transition-colors group"
            >
              <code className="text-sm font-mono text-gray-800 break-all">{uuid}</code>
              <button
                type="button"
                onClick={() => handleCopyOne(uuid)}
                aria-label="Copy"
                className="shrink-0 text-gray-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">{t("results.empty")}</p>
      )}

      {/* トースト */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white
                        text-sm px-4 py-2 rounded-full shadow-lg pointer-events-none z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
