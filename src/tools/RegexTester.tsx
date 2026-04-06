"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";
import Toast from "@/components/Toast";
import { useClipboard } from "@/lib/hooks/useClipboard";

const FLAG_KEYS = ["g", "i", "m", "s"] as const;
type FlagKey = (typeof FLAG_KEYS)[number];

interface MatchInfo {
  index: number;
  length: number;
  value: string;
  groups: string[];
}

interface TestResult {
  matches: MatchInfo[];
  error: string | null;
}

function runRegex(pattern: string, flags: string, text: string): TestResult {
  if (!pattern) return { matches: [], error: null };
  try {
    // g フラグが無くても全マッチを取れるよう、常に g を付与
    const activeFlags = flags.includes("g") ? flags : flags + "g";
    const re = new RegExp(pattern, activeFlags);
    const matches: MatchInfo[] = [];
    let m: RegExpExecArray | null;
    let safeLimit = 0;
    while ((m = re.exec(text)) !== null && safeLimit < 1000) {
      matches.push({
        index: m.index,
        length: m[0].length,
        value: m[0],
        groups: m.slice(1).map((g) => (g === undefined ? "" : g)),
      });
      // 長さ 0 のマッチでの無限ループを防止
      if (m[0].length === 0) re.lastIndex++;
      safeLimit++;
    }
    return { matches, error: null };
  } catch (e) {
    return { matches: [], error: (e as Error).message };
  }
}

export default function RegexTester() {
  const t = useTranslations("regex-tester");
  const { copy } = useClipboard();
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testText, setTestText] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  const debouncedPattern = useDebounce(pattern, 300);
  const debouncedText = useDebounce(testText, 300);

  const result = useMemo<TestResult>(
    () => runRegex(debouncedPattern, flags, debouncedText),
    [debouncedPattern, flags, debouncedText]
  );

  function toggleFlag(f: FlagKey) {
    setFlags((prev) =>
      prev.includes(f) ? prev.replace(f, "") : prev + f
    );
  }

  // マッチ箇所をハイライトした HTML を生成
  const highlightedHtml = useMemo(() => {
    if (!debouncedText || result.matches.length === 0) return null;
    let html = "";
    let cursor = 0;
    for (const m of result.matches) {
      html += escapeHtml(debouncedText.slice(cursor, m.index));
      html += `<mark class="bg-yellow-200 rounded px-0.5">${escapeHtml(m.value)}</mark>`;
      cursor = m.index + m.length;
    }
    html += escapeHtml(debouncedText.slice(cursor));
    return html;
  }, [debouncedText, result.matches]);

  async function handleCopyPattern() {
    await copy(pattern);
    showToast(t("toast.copied"));
  }

  return (
    <div className="space-y-5">
      {/* パターン入力 */}
      <div>
        <label htmlFor="regex-pattern" className="block text-sm font-medium text-gray-700 mb-2">
          {t("patternLabel")}
        </label>
        <div className="flex gap-2 items-stretch">
          <span className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-500 text-sm select-none">
            /
          </span>
          <input
            id="regex-pattern"
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder={t("patternPlaceholder")}
            spellCheck={false}
            className="flex-1 px-3 py-2.5 border border-gray-300 text-sm font-mono
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary min-w-0"
          />
          <span className="flex items-center px-3 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-500 text-sm select-none font-mono">
            /{flags}
          </span>
          <button
            type="button"
            onClick={handleCopyPattern}
            disabled={!pattern}
            className="btn-secondary text-xs px-3 py-2 shrink-0"
          >
            {t("buttons.copy")}
          </button>
        </div>

        {/* フラグ切替 */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {FLAG_KEYS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => toggleFlag(f)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                flags.includes(f)
                  ? "bg-primary/10 text-primary border border-primary/30"
                  : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
              }`}
            >
              {f} — {t(`flags.${f}`)}
            </button>
          ))}
        </div>

        {result.error && (
          <p className="mt-2 text-xs text-red-500 font-mono">{t("error.invalid")}: {result.error}</p>
        )}
      </div>

      {/* テスト文字列 */}
      <div>
        <label htmlFor="regex-text" className="block text-sm font-medium text-gray-700 mb-2">
          {t("textLabel")}
        </label>
        <textarea
          id="regex-text"
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          placeholder={t("textPlaceholder")}
          rows={6}
          spellCheck={false}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     resize-y leading-relaxed"
        />
      </div>

      {/* マッチ結果サマリー */}
      {debouncedPattern && !result.error && (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border ${
            result.matches.length > 0
              ? "bg-green-50 text-green-700 border-green-200"
              : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          <span className="font-semibold">
            {result.matches.length > 0 ? "✓" : "○"}
          </span>
          <span>
            {result.matches.length > 0
              ? t("status.matched", { count: result.matches.length })
              : t("status.noMatch")}
          </span>
        </div>
      )}

      {/* ハイライト表示 */}
      {highlightedHtml && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t("highlightLabel")}</p>
          <div
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm
                       bg-gray-50 font-mono whitespace-pre-wrap break-all leading-relaxed"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </div>
      )}

      {/* マッチ詳細リスト */}
      {result.matches.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">{t("matchListLabel")}</p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {result.matches.map((m, i) => (
              <div key={i} className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 text-xs font-mono">
                <span className="text-gray-400 mr-2">#{i + 1}</span>
                <span className="text-gray-800 font-semibold">{m.value || '""'}</span>
                <span className="text-gray-400 ml-2">
                  {t("matchMeta", { index: m.index, length: m.length })}
                </span>
                {m.groups.length > 0 && (
                  <span className="text-blue-500 ml-2">
                    {t("groups")}: [{m.groups.map((g) => `"${g}"`).join(", ")}]
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br/>");
}
