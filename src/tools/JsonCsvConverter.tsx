"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Mode = "json2csv" | "csv2json";

// ---- 変換ロジック ----

function escapeCSV(val: string): string {
  if (/[,"\n\r]/.test(val)) return `"${val.replace(/"/g, '""')}"`;
  return val;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      let cell = ""; i++;
      while (i < line.length) {
        if (line[i] === '"' && line[i + 1] === '"') { cell += '"'; i += 2; }
        else if (line[i] === '"') { i++; break; }
        else cell += line[i++];
      }
      result.push(cell);
      if (line[i] === ",") i++;
    } else {
      const end = line.indexOf(",", i);
      if (end === -1) { result.push(line.slice(i)); break; }
      result.push(line.slice(i, end));
      i = end + 1;
    }
  }
  return result;
}

function jsonToCsv(json: string): string {
  const data = JSON.parse(json);
  const arr = Array.isArray(data) ? data : [data];
  if (arr.length === 0) return "";
  const keys = Object.keys(arr[0] as Record<string, unknown>);
  const header = keys.map(escapeCSV).join(",");
  const rows = arr.map((row: Record<string, unknown>) =>
    keys.map((k) => escapeCSV(String(row[k] ?? ""))).join(",")
  );
  return [header, ...rows].join("\n");
}

function csvToJson(csv: string): string {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("Need header row + at least 1 data row");
  const headers = parseCSVLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i] ?? ""; });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}

// ---- コンポーネント ----

export default function JsonCsvConverter() {
  const t = useTranslations("json-csv-converter");
  const [mode, setMode] = useState<Mode>("json2csv");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: "" };
    try {
      return { output: mode === "json2csv" ? jsonToCsv(input) : csvToJson(input), error: "" };
    } catch (e) {
      return { output: "", error: e instanceof Error ? e.message : String(e) };
    }
  }, [input, mode]);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  function handleSwap() {
    setMode((m) => (m === "json2csv" ? "csv2json" : "json2csv"));
    setInput(output);
  }

  function handleModeChange(m: Mode) {
    setMode(m);
    setInput("");
  }

  return (
    <div className="space-y-4">
      {/* モード切替 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm">
          {(["json2csv", "csv2json"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleModeChange(m)}
              className={`px-4 py-2 font-medium transition-colors ${
                mode === m ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t(m)}
            </button>
          ))}
        </div>
        {output && (
          <button type="button" onClick={handleSwap} className="btn-secondary text-sm px-3 py-1.5">
            ⇄ {t("swap")}
          </button>
        )}
      </div>

      {/* 入力 + 出力（2カラム） */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">
            {mode === "json2csv" ? "JSON" : "CSV"} — {t("input")}
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === "json2csv" ? t("placeholderJson") : t("placeholderCsv")}
            rows={12}
            spellCheck={false}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                       resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-500">
              {mode === "json2csv" ? "CSV" : "JSON"} — {t("output")}
            </p>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="btn-secondary text-xs px-2 py-1 disabled:opacity-40"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={12}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono
                       bg-gray-50 resize-y focus:outline-none"
          />
        </div>
      </div>

      {/* エラー */}
      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      {!input && (
        <p className="text-sm text-gray-400 text-center py-2">{t("empty")}</p>
      )}
    </div>
  );
}
