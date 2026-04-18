"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Align = "left" | "center" | "right";

const ALIGN_LABELS: Record<Align, string> = { left: "L", center: "C", right: "R" };
const ALIGN_NEXT:  Record<Align, Align>   = { left: "center", center: "right", right: "left" };

function initCells(rows: number, cols: number): string[][] {
  return Array.from({ length: rows }, (_, ri) =>
    Array.from({ length: cols }, (_, ci) => (ri === 0 ? `Column ${ci + 1}` : ""))
  );
}

export default function MarkdownTableGenerator() {
  const t = useTranslations("markdown-table-generator");
  const [cells, setCells] = useState<string[][]>(() => initCells(3, 3));
  const [aligns, setAligns] = useState<Align[]>(["left", "left", "left"]);
  const [copied, setCopied] = useState(false);

  const numCols = cells[0]?.length ?? 0;

  const updateCell = (row: number, col: number, val: string) =>
    setCells((c) => {
      const next = c.map((r) => [...r]);
      next[row][col] = val;
      return next;
    });

  const addRow    = () => setCells((c) => [...c, Array(numCols).fill("")]);
  const removeRow = () => setCells((c) => (c.length > 1 ? c.slice(0, -1) : c));
  const addCol    = () => {
    setCells((c) => c.map((r) => [...r, ""]));
    setAligns((a) => [...a, "left"]);
  };
  const removeCol = () => {
    if (numCols <= 1) return;
    setCells((c) => c.map((r) => r.slice(0, -1)));
    setAligns((a) => a.slice(0, -1));
  };
  const cycleAlign = (ci: number) =>
    setAligns((a) => {
      const next = [...a];
      next[ci] = ALIGN_NEXT[next[ci]];
      return next;
    });

  const sepStr = (a: Align) =>
    a === "center" ? ":---:" : a === "right" ? "---:" : "---";

  const markdown = useMemo(() => {
    if (!cells.length || !cells[0].length) return "";
    const header = "| " + cells[0].join(" | ") + " |";
    const divider = "| " + aligns.map(sepStr).join(" | ") + " |";
    const body = cells
      .slice(1)
      .map((r) => "| " + r.join(" | ") + " |")
      .join("\n");
    return [header, divider, body].join("\n");
  }, [cells, aligns]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { }
  };

  return (
    <div className="space-y-5">
      {/* ツールバー */}
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addRow}    className="btn-secondary text-xs px-3 py-1.5">+ {t("addRow")}</button>
        <button type="button" onClick={removeRow} className="btn-secondary text-xs px-3 py-1.5"
          disabled={cells.length <= 1}>− {t("removeRow")}</button>
        <button type="button" onClick={addCol}    className="btn-secondary text-xs px-3 py-1.5">+ {t("addCol")}</button>
        <button type="button" onClick={removeCol} className="btn-secondary text-xs px-3 py-1.5"
          disabled={numCols <= 1}>− {t("removeCol")}</button>
      </div>

      {/* 入力グリッド */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="border-collapse w-full">
          <thead className="bg-gray-50">
            <tr>
              {cells[0]?.map((cell, ci) => (
                <th key={ci} className="border border-gray-200 p-0 min-w-[100px]">
                  <input
                    value={cell}
                    onChange={(e) => updateCell(0, ci, e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-semibold bg-transparent text-center focus:outline-none"
                    placeholder={`Col ${ci + 1}`}
                  />
                  <button type="button" onClick={() => cycleAlign(ci)}
                    className="w-full text-[10px] text-gray-400 hover:text-primary py-0.5 border-t border-gray-100 transition-colors">
                    {ALIGN_LABELS[aligns[ci]]} — {t(`align.${aligns[ci]}`)}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cells.slice(1).map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-gray-200 p-0">
                    <input
                      value={cell}
                      onChange={(e) => updateCell(ri + 1, ci, e.target.value)}
                      className="w-full px-2 py-1.5 text-xs bg-transparent focus:outline-none"
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Markdownコード出力 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{t("output")}</label>
          <button type="button" onClick={handleCopy}
            className="text-xs text-primary hover:underline">
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <pre className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                        text-sm font-mono overflow-x-auto whitespace-pre leading-relaxed">
          {markdown}
        </pre>
      </div>
    </div>
  );
}
