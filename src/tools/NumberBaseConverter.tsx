"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Base = 2 | 8 | 10 | 16;
const BASES: { base: Base; key: string }[] = [
  { base: 2, key: "binary" },
  { base: 8, key: "octal" },
  { base: 10, key: "decimal" },
  { base: 16, key: "hex" },
];

const VALID_CHARS: Record<Base, RegExp> = {
  2:  /^-?[01]+$/,
  8:  /^-?[0-7]+$/,
  10: /^-?[0-9]+$/,
  16: /^-?[0-9a-fA-F]+$/,
};

function convert(value: string, from: Base): Record<Base, string> | null {
  if (!value) return null;
  if (!VALID_CHARS[from].test(value)) return null;
  const isNeg = value.startsWith("-");
  const abs = isNeg ? value.slice(1) : value;
  const decimal = parseInt(abs, from);
  if (isNaN(decimal)) return null;
  const prefix = isNeg ? "-" : "";
  return {
    2:  prefix + decimal.toString(2),
    8:  prefix + decimal.toString(8),
    10: prefix + decimal.toString(10),
    16: prefix + decimal.toString(16).toUpperCase(),
  };
}

export default function NumberBaseConverter() {
  const t = useTranslations("number-base-converter");
  const [inputBase, setInputBase] = useState<Base>(10);
  const [input, setInput] = useState("");
  const [toast, setToast] = useState("");

  const result = useMemo(() => convert(input, inputBase), [input, inputBase]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    showToast(t("buttons.copy"));
  };

  return (
    <div className="space-y-5">
      {/* 入力エリア */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            {t("labels.inputBase")}
          </label>
          <div className="flex gap-2">
            <select
              value={inputBase}
              onChange={(e) => { setInputBase(Number(e.target.value) as Base); setInput(""); }}
              className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {BASES.map(({ base, key }) => (
                <option key={base} value={base}>
                  {t(`labels.base${base}`)} — {t(`labels.${key}`)}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("placeholder")}
              spellCheck={false}
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {input && !result && (
            <p className="mt-1 text-xs text-red-500">{t("results.invalid")}</p>
          )}
        </div>
      </div>

      {/* 変換結果 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {BASES.map(({ base, key }) => {
          const value = result ? result[base] : "";
          const isActive = base === inputBase;
          return (
            <div
              key={base}
              className={`border rounded-lg p-3 ${isActive ? "border-primary/40 bg-primary/5" : "border-gray-200 bg-gray-50"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {t(`labels.${key}`)} ({t(`labels.base${base}`)})
                </span>
                {value && (
                  <button
                    type="button"
                    onClick={() => handleCopy(value)}
                    className="text-xs text-primary hover:text-blue-700 font-medium transition-colors"
                  >
                    {t("buttons.copy")}
                  </button>
                )}
              </div>
              <p className="font-mono text-sm text-gray-800 break-all min-h-[1.5rem]">
                {value || <span className="text-gray-300">—</span>}
              </p>
            </div>
          );
        })}
      </div>

      {!input && (
        <p className="text-sm text-gray-400 text-center py-4">{t("results.empty")}</p>
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
