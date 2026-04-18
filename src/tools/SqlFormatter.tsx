"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";

// ---- SQL フォーマッターロジック ----

type TKind = "str" | "cmt" | "word" | "comma" | "semi" | "lparen" | "rparen" | "op" | "ws";
interface Tok { kind: TKind; val: string }

function tokenize(sql: string): Tok[] {
  const toks: Tok[] = [];
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    // 文字列リテラル（'...' / "..." / `...`）
    if (ch === "'" || ch === '"' || ch === "`") {
      let s = ch; i++;
      while (i < sql.length) {
        if (sql[i] === ch && sql[i + 1] === ch) { s += ch + ch; i += 2; }
        else if (sql[i] === ch) { s += ch; i++; break; }
        else s += sql[i++];
      }
      toks.push({ kind: "str", val: s }); continue;
    }
    // ラインコメント
    if (ch === "-" && sql[i + 1] === "-") {
      let s = ""; while (i < sql.length && sql[i] !== "\n") s += sql[i++];
      toks.push({ kind: "cmt", val: s }); continue;
    }
    // ブロックコメント
    if (ch === "/" && sql[i + 1] === "*") {
      let s = "/*"; i += 2;
      while (i < sql.length && !(sql[i] === "*" && sql[i + 1] === "/")) s += sql[i++];
      s += "*/"; i += 2;
      toks.push({ kind: "cmt", val: s }); continue;
    }
    // 空白
    if (/\s/.test(ch)) {
      while (i < sql.length && /\s/.test(sql[i])) i++;
      toks.push({ kind: "ws", val: " " }); continue;
    }
    if (ch === ",") { toks.push({ kind: "comma", val: "," }); i++; continue; }
    if (ch === ";") { toks.push({ kind: "semi",  val: ";" }); i++; continue; }
    if (ch === "(") { toks.push({ kind: "lparen", val: "(" }); i++; continue; }
    if (ch === ")") { toks.push({ kind: "rparen", val: ")" }); i++; continue; }
    // 演算子
    if (/[=<>!+\-*\/|&~^%@]/.test(ch)) {
      let s = sql[i++];
      while (i < sql.length && /[=<>!]/.test(sql[i])) s += sql[i++];
      toks.push({ kind: "op", val: s }); continue;
    }
    // 単語（識別子・数値・t.col 等のドット込みも1トークン）
    let s = "";
    while (i < sql.length && !/[\s,;()=<>!+\-*\/|&~^%@'"`;]/.test(sql[i])) s += sql[i++];
    if (s) { toks.push({ kind: "word", val: s }); continue; }
    toks.push({ kind: "op", val: sql[i++] });
  }
  return toks;
}

// 大文字化するキーワード
const KW = new Set([
  "SELECT","DISTINCT","FROM","WHERE","AND","OR","NOT","NULL","IS","AS",
  "IN","LIKE","BETWEEN","EXISTS","CASE","WHEN","THEN","ELSE","END",
  "JOIN","ON","BY","GROUP","ORDER","HAVING","LIMIT","OFFSET","TOP",
  "LEFT","RIGHT","INNER","OUTER","FULL","CROSS","NATURAL",
  "INSERT","INTO","VALUES","UPDATE","SET","DELETE",
  "CREATE","ALTER","DROP","TABLE","INDEX","VIEW","DATABASE","SCHEMA",
  "UNION","ALL","INTERSECT","EXCEPT","WITH","OVER","PARTITION",
  "COUNT","SUM","AVG","MIN","MAX","COALESCE","NULLIF","CAST","CONVERT",
  "TRUE","FALSE","PRIMARY","KEY","FOREIGN","REFERENCES","CONSTRAINT",
  "UNIQUE","DEFAULT","ASC","DESC",
  "INT","INTEGER","VARCHAR","CHAR","TEXT","DATE","DATETIME","TIMESTAMP",
  "FLOAT","DOUBLE","DECIMAL","BIGINT","BOOLEAN",
]);

// 関数的な使われ方をする（前に空白不要）キーワード
const FUNC_KW = new Set([
  "COUNT","SUM","AVG","MIN","MAX","COALESCE","NULLIF","CAST","CONVERT",
  "ISNULL","IFNULL","NVL","IF","TRIM","UPPER","LOWER","LENGTH","LEN",
  "REPLACE","CONCAT","SUBSTRING","SUBSTR","DATE","NOW","GETDATE","YEAR",
  "MONTH","DAY","DATEDIFF","DATEADD","ROW_NUMBER","RANK","DENSE_RANK",
  "NTILE","LAG","LEAD","DECODE","CHARINDEX","PATINDEX",
]);

// 直前に改行を入れる句キーワード（depth 0 のみ）
const CLAUSE_NL = new Set([
  "FROM","WHERE","HAVING","LIMIT","OFFSET","GROUP","ORDER",
  "JOIN","LEFT","RIGHT","INNER","FULL","CROSS","NATURAL","ON",
  "UNION","INTERSECT","EXCEPT","INSERT","VALUES","UPDATE","DELETE",
  "CREATE","ALTER","DROP","WITH",
]);

// SELECT/SET の後はインデント付き改行（各項目を別行に）
const INDENT_AFTER = new Set(["SELECT","DISTINCT","SET"]);

// AND/OR は改行 + インデント
const LOGICAL = new Set(["AND","OR"]);

function formatSQL(sql: string, indentSize: number, upperKw: boolean): string {
  const toks = tokenize(sql);
  const sp = " ".repeat(indentSize);
  let depth = 0;
  const lines: string[] = [];
  let cur = "";
  let prevKind: TKind | "" = "";
  let prevUpper = "";

  function flush() {
    const t = cur.trim();
    if (t) lines.push(t);
    cur = "";
  }

  function kw(w: string): string {
    const u = w.toUpperCase();
    if (!KW.has(u)) return w;
    return upperKw ? u : u.toLowerCase();
  }

  function append(s: string, wantSpace = true) {
    const trimCur = cur.trimEnd();
    const endsWithSpace = cur.endsWith(" ");
    const noSpace = !trimCur || endsWithSpace || cur.endsWith("(");
    const noSpaceToken = s === "," || s === ")" || s === ";";
    if (wantSpace && !noSpace && !noSpaceToken) cur += " ";
    cur += s;
  }

  for (const tok of toks) {
    const { kind, val } = tok;
    if (kind === "ws") continue;

    const upper = kind === "word" ? val.toUpperCase() : "";

    // 開き括弧
    if (kind === "lparen") {
      const isFuncCall = prevKind === "word" && (!KW.has(prevUpper) || FUNC_KW.has(prevUpper));
      if (isFuncCall) { cur += "("; } else { append("("); }
      depth++;
      prevKind = kind; prevUpper = "";
      continue;
    }
    // 閉じ括弧
    if (kind === "rparen") {
      depth = Math.max(0, depth - 1);
      cur = cur.trimEnd() + ")";
      prevKind = kind; prevUpper = "";
      continue;
    }
    // セミコロン
    if (kind === "semi") {
      cur = cur.trimEnd() + ";";
      flush(); lines.push("");
      prevKind = kind; prevUpper = "";
      continue;
    }
    // カンマ（depth 0: 改行 + インデント）
    if (kind === "comma" && depth === 0) {
      cur = cur.trimEnd() + ",";
      flush(); cur = sp;
      prevKind = kind; prevUpper = "";
      continue;
    }

    // depth 0 の句キーワード
    if (kind === "word" && depth === 0) {
      if (INDENT_AFTER.has(upper)) {
        flush();
        lines.push(kw(val)); // SELECT / SET を単独行に
        cur = sp;            // 以降の内容はインデント
        prevKind = kind; prevUpper = upper;
        continue;
      }
      if (CLAUSE_NL.has(upper)) {
        flush();
        cur = kw(val) + " ";
        prevKind = kind; prevUpper = upper;
        continue;
      }
      if (LOGICAL.has(upper)) {
        flush();
        cur = sp + kw(val) + " ";
        prevKind = kind; prevUpper = upper;
        continue;
      }
    }

    append(kind === "word" ? kw(val) : val);
    prevKind = kind; prevUpper = upper;
  }

  flush();

  // 先頭・末尾・連続の空行を除去
  return lines
    .filter((l, i, a) => !(l === "" && (i === 0 || i === a.length - 1 || a[i - 1] === "")))
    .join("\n")
    .trim();
}

// ---- コンポーネント ----

export default function SqlFormatter() {
  const t = useTranslations("sql-formatter");
  const [input, setInput] = useState("");
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [upperKw, setUpperKw] = useState(true);
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  const output = useMemo(() => {
    if (!debouncedInput.trim()) return "";
    try { return formatSQL(debouncedInput, indentSize, upperKw); }
    catch { return debouncedInput; }
  }, [debouncedInput, indentSize, upperKw]);

  async function handleCopy() {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { }
  }

  return (
    <div className="space-y-4">
      {/* オプション */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500">{t("indentSize")}</span>
          {([2, 4] as const).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setIndentSize(n)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                indentSize === n ? "bg-primary text-white border-primary" : "border-gray-300 text-gray-600 hover:border-primary"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={upperKw}
            onChange={(e) => setUpperKw(e.target.checked)}
            className="accent-primary"
          />
          <span className="text-xs text-gray-600">{t("uppercaseKeywords")}</span>
        </label>
      </div>

      {/* 入力 */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-1.5">{t("input")}</p>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={8}
          spellCheck={false}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                     resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 出力 */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-medium text-gray-500">{t("output")}</p>
            <button type="button" onClick={handleCopy} className="btn-secondary text-xs px-3 py-1.5">
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <pre className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm font-mono
                          bg-gray-50 text-gray-800 overflow-x-auto whitespace-pre">
            {output}
          </pre>
        </div>
      )}

      {!input && (
        <p className="text-sm text-gray-400 text-center py-4">{t("empty")}</p>
      )}
    </div>
  );
}
