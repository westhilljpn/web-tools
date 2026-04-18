"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const VALUES = [
  [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],
  [100,"C"],[90,"XC"],[50,"L"],[40,"XL"],
  [10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"],
] as const;

function toRoman(n: number): string {
  let result = "", rem = n;
  for (const [v, s] of VALUES) { while (rem >= v) { result += s; rem -= v; } }
  return result;
}

function fromRoman(s: string): number {
  const map: Record<string, number> = { M:1000,D:500,C:100,L:50,X:10,V:5,I:1 };
  const str = s.toUpperCase().trim();
  if (!/^[MDCLXVI]+$/.test(str)) return NaN;
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const cur = map[str[i]], next = map[str[i + 1]];
    result += (next && next > cur) ? -cur : cur;
  }
  return result;
}

function breakdown(n: number): { sym: string; count: number }[] {
  const out: { sym: string; count: number }[] = [];
  let rem = n;
  for (const [v, s] of VALUES) {
    const c = Math.floor(rem / v);
    if (c > 0) { out.push({ sym: s, count: c }); rem -= c * v; }
  }
  return out;
}

type Tab = "toRoman" | "toNumber";

export default function RomanNumerals() {
  const t = useTranslations("roman-numerals");
  const [tab, setTab] = useState<Tab>("toRoman");
  const [numInput, setNumInput] = useState("");
  const [romInput, setRomInput] = useState("");
  const [copied, setCopied] = useState(false);

  const numVal = parseInt(numInput, 10);
  const roman = numInput && !isNaN(numVal) && numVal >= 1 && numVal <= 3999 ? toRoman(numVal) : null;
  const numErr = !!numInput && (isNaN(numVal) || numVal < 1 || numVal > 3999);

  const fromVal = romInput.trim() ? fromRoman(romInput) : NaN;
  const romErr = !!romInput.trim() && isNaN(fromVal);

  async function handleCopy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }

  return (
    <div className="space-y-5">
      {/* タブ */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["toRoman", "toNumber"] as Tab[]).map(k => (
          <button
            key={k}
            type="button"
            onClick={() => { setTab(k); setCopied(false); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === k ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t(`tabs.${k}`)}
          </button>
        ))}
      </div>

      {tab === "toRoman" ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("numberLabel")}
            </label>
            <input
              type="number"
              min={1} max={3999}
              value={numInput}
              onChange={e => setNumInput(e.target.value)}
              placeholder="1 – 3999"
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {numErr && <p className="mt-1.5 text-xs text-red-500">{t("errorRange")}</p>}
          </div>

          {roman && (
            <div className="bg-gray-50 border border-gray-200 dark:border-slate-600 dark:bg-slate-800/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-bold tracking-widest text-primary">{roman}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(roman)}
                  className="shrink-0 text-xs px-3 py-1 rounded bg-gray-200 dark:bg-slate-600
                             hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300 transition-colors"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {breakdown(numVal).map(({ sym, count }) => (
                  <span key={sym}
                    className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-primary dark:text-blue-400 text-sm font-mono rounded-lg">
                    {sym} × {count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("romanLabel")}
            </label>
            <input
              type="text"
              value={romInput}
              onChange={e => setRomInput(e.target.value.toUpperCase())}
              placeholder="XIV"
              className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {romErr && <p className="mt-1.5 text-xs text-red-500">{t("errorInvalid")}</p>}
          </div>

          {!isNaN(fromVal) && romInput.trim() && (
            <div className="bg-gray-50 border border-gray-200 dark:border-slate-600 dark:bg-slate-800/50 rounded-xl p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-3xl font-bold text-primary">
                  {fromVal.toLocaleString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(String(fromVal))}
                  className="shrink-0 text-xs px-3 py-1 rounded bg-gray-200 dark:bg-slate-600
                             hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300 transition-colors"
                >
                  {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
