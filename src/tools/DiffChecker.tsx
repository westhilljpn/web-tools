"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";

type DiffType = "equal" | "added" | "removed";
interface DiffLine { type: DiffType; text: string; oldNum: number; newNum: number; }

const MAX_LINES = 2000;

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const a = oldText ? oldText.split("\n") : [];
  const b = newText ? newText.split("\n") : [];
  const m = Math.min(a.length, MAX_LINES);
  const n = Math.min(b.length, MAX_LINES);
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] + 1 : Math.max(dp[i-1][j], dp[i][j-1]);

  const result: DiffLine[] = [];
  let i = m, j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i-1] === b[j-1]) {
      result.push({ type: "equal", text: a[i-1], oldNum: i, newNum: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      result.push({ type: "added", text: b[j-1], oldNum: 0, newNum: j });
      j--;
    } else {
      result.push({ type: "removed", text: a[i-1], oldNum: i, newNum: 0 });
      i--;
    }
  }
  return result.reverse();
}

const LINE_STYLE: Record<DiffType, string> = {
  equal:   "bg-white text-gray-700",
  added:   "bg-green-50 text-green-900",
  removed: "bg-red-50 text-red-900",
};
const GUTTER_STYLE: Record<DiffType, string> = {
  equal:   "bg-gray-50 text-gray-400",
  added:   "bg-green-100 text-green-700",
  removed: "bg-red-100 text-red-700",
};
const MARKER: Record<DiffType, string> = { equal: " ", added: "+", removed: "−" };

export default function DiffChecker() {
  const t = useTranslations("diff-checker");
  const [original, setOriginal] = useState("");
  const [modified, setModified] = useState("");
  const [diff, setDiff] = useState<DiffLine[] | null>(null);
  const [changesOnly, setChangesOnly] = useState(false);
  const debouncedOriginal = useDebounce(original, 300);
  const debouncedModified = useDebounce(modified, 300);

  useEffect(() => {
    if (!debouncedOriginal && !debouncedModified) { setDiff(null); return; }
    setDiff(computeDiff(debouncedOriginal, debouncedModified));
  }, [debouncedOriginal, debouncedModified]);

  const handleSwap = () => { setOriginal(modified); setModified(original); };
  const handleClear = () => { setOriginal(""); setModified(""); setDiff(null); };

  const stats = diff
    ? {
        added:     diff.filter((l) => l.type === "added").length,
        removed:   diff.filter((l) => l.type === "removed").length,
        unchanged: diff.filter((l) => l.type === "equal").length,
      }
    : null;
  const isIdentical = stats && stats.added === 0 && stats.removed === 0;
  const visibleLines = diff
    ? changesOnly ? diff.filter((l) => l.type !== "equal") : diff
    : [];

  return (
    <div className="space-y-5">
      {/* 2列テキストエリア */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: t("labels.original"), value: original, onChange: setOriginal, ph: t("placeholder.original") },
          { label: t("labels.modified"),  value: modified,  onChange: setModified,  ph: t("placeholder.modified") },
        ].map(({ label, value, onChange, ph }) => (
          <div key={label}>
            <p className="text-xs font-medium text-gray-500 mb-1.5">{label}</p>
            <textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={ph}
              spellCheck={false}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                         leading-relaxed resize-y
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        ))}
      </div>

      {/* 操作ボタン */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={handleSwap} disabled={!original && !modified}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50">
          {t("buttons.swap")}
        </button>
        <button type="button" onClick={handleClear} disabled={!original && !modified}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50">
          {t("buttons.clear")}
        </button>
      </div>

      {/* 統計バッジ */}
      {stats && (
        <div className="flex flex-wrap items-center gap-3">
          {isIdentical ? (
            <span className="text-sm text-gray-500">{t("results.identical")}</span>
          ) : (
            <>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                +{stats.added} {t("results.added")}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                −{stats.removed} {t("results.removed")}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {stats.unchanged} {t("results.unchanged")}
              </span>
              <button type="button" onClick={() => setChangesOnly((v) => !v)}
                className="ml-auto text-xs text-primary hover:text-blue-700 font-medium transition-colors">
                {changesOnly ? t("buttons.showAll") : t("buttons.showChanges")}
              </button>
            </>
          )}
        </div>
      )}

      {/* Diff 表示 */}
      {diff && !isIdentical && visibleLines.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden overflow-x-auto text-xs font-mono">
          {visibleLines.map((line, idx) => (
            <div key={idx} className={`flex ${LINE_STYLE[line.type]}`}>
              {/* 行番号（旧） */}
              <span className={`w-10 shrink-0 text-right px-2 py-1 select-none border-r border-gray-200 ${GUTTER_STYLE[line.type]}`}>
                {line.type !== "added" ? line.oldNum : ""}
              </span>
              {/* 行番号（新） */}
              <span className={`w-10 shrink-0 text-right px-2 py-1 select-none border-r border-gray-200 ${GUTTER_STYLE[line.type]}`}>
                {line.type !== "removed" ? line.newNum : ""}
              </span>
              {/* マーカー */}
              <span className={`w-5 shrink-0 text-center py-1 select-none border-r border-gray-200 ${GUTTER_STYLE[line.type]}`}>
                {MARKER[line.type]}
              </span>
              {/* テキスト */}
              <span className="flex-1 px-3 py-1 whitespace-pre">{line.text}</span>
            </div>
          ))}
        </div>
      )}

      {!diff && (
        <p className="text-sm text-gray-400 text-center py-6">{t("results.empty")}</p>
      )}
    </div>
  );
}
