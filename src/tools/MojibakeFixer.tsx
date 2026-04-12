"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

// Windows-1252の拡張文字(0x80–0x9F) → バイト値 逆引きテーブル
// 文字化けテキストをバイト列に正しく戻すために使用する
const WIN1252_BACK = new Map<number, number>([
  [0x20AC, 0x80], [0x201A, 0x82], [0x0192, 0x83], [0x201E, 0x84], [0x2026, 0x85],
  [0x2020, 0x86], [0x2021, 0x87], [0x02C6, 0x88], [0x2030, 0x89], [0x0160, 0x8A],
  [0x2039, 0x8B], [0x0152, 0x8C], [0x017D, 0x8E], [0x2018, 0x91], [0x2019, 0x92],
  [0x201C, 0x93], [0x201D, 0x94], [0x2022, 0x95], [0x2013, 0x96], [0x2014, 0x97],
  [0x02DC, 0x98], [0x2122, 0x99], [0x0161, 0x9A], [0x203A, 0x9B], [0x0153, 0x9C],
  [0x017E, 0x9E], [0x0178, 0x9F],
]);

// テキストをISO-8859-1バイト列として取り出す（charCode & 0xFF）
function asLatin1(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xFF;
  return b;
}

// テキストをWindows-1252バイト列として取り出す（拡張文字を正しく逆変換）
function asWin1252(s: string): Uint8Array {
  const b = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const cp = s.charCodeAt(i);
    b[i] = WIN1252_BACK.get(cp) ?? (cp & 0xFF);
  }
  return b;
}

function tryDecode(bytes: Uint8Array, enc: string): string | null {
  try {
    return new TextDecoder(enc, { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

const containsJapanese = (s: string): boolean =>
  /[\u3040-\u30FF\u4E00-\u9FFF\uFF65-\uFF9F]/.test(s);

// 修復戦略: バイト取り出し方法 × 再デコードエンコーディング
const STRATEGIES = [
  { id: "wUtf8",  fn: asWin1252, enc: "utf-8"     },
  { id: "lUtf8",  fn: asLatin1,  enc: "utf-8"     },
  { id: "lSjis",  fn: asLatin1,  enc: "shift-jis" },
  { id: "lEucjp", fn: asLatin1,  enc: "euc-jp"    },
] as const;

// UTF-8「日本語」をWindows-1252で読んだ例
// 日(E6 97 A5)本(E6 9C AC)語(E8 AA 9E) → æ—¥æœ¬èªž
const EXAMPLE = "\u00E6\u2014\u00A5\u00E6\u0153\u00AC\u00E8\u00AA\u017E";

export default function MojibakeFixer() {
  const t = useTranslations("mojibake-fixer");
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const results = useMemo(() => {
    if (!input.trim()) return [];
    const seen = new Set<string>();
    return STRATEGIES.flatMap(({ id, fn, enc }) => {
      const decoded = tryDecode(fn(input), enc);
      if (!decoded || seen.has(decoded)) return [];
      seen.add(decoded);
      return [{ id, decoded, recommended: containsJapanese(decoded) }];
    });
  }, [input]);

  async function handleCopy(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* 入力エリア */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="mojibake-input" className="text-sm font-medium text-gray-700">
            {t("inputLabel")}
          </label>
          <button
            type="button"
            onClick={() => setInput(EXAMPLE)}
            className="text-xs text-primary hover:underline"
          >
            {t("tryExample")}
          </button>
        </div>
        <textarea
          id="mojibake-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("inputPlaceholder")}
          rows={5}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-mono resize-y
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-xs text-gray-400">{t("hint")}</span>
          {input && (
            <button
              type="button"
              onClick={() => setInput("")}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {t("clear")}
            </button>
          )}
        </div>
      </div>

      {/* 修復結果 */}
      {input.trim() && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700">{t("resultsLabel")}</p>
          {results.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">🤔</p>
              <p className="text-sm">{t("noResults")}</p>
            </div>
          ) : (
            results.map(({ id, decoded, recommended }) => (
              <div
                key={id}
                className={`border rounded-lg p-4 ${
                  recommended
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/20"
                    : "border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-700/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
                      {t(`labels.${id}`)}
                    </span>
                    {recommended && (
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/50 px-1.5 py-0.5 rounded">
                        ✓ {t("jpDetected")}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(decoded, id)}
                    className="shrink-0 text-xs px-3 py-1 rounded bg-gray-200 dark:bg-slate-600
                               hover:bg-gray-300 dark:hover:bg-slate-500 text-gray-700 dark:text-slate-300
                               transition-colors"
                  >
                    {copiedId === id ? t("copied") : t("copy")}
                  </button>
                </div>
                <p className="text-sm font-mono break-all leading-relaxed text-gray-800 dark:text-slate-200">
                  {decoded}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
