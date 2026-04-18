"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";

type Lang = "js" | "css" | "html";

// ---- ミニファイア関数 ----

function minifyJS(code: string): string {
  const out: string[] = [];
  let i = 0;
  let spacePending = false;

  while (i < code.length) {
    const ch = code[i];

    if (ch === "/" && code[i + 1] === "/") {          // 行コメント
      i += 2;
      while (i < code.length && code[i] !== "\n") i++;
      spacePending = true; continue;
    }
    if (ch === "/" && code[i + 1] === "*") {           // ブロックコメント
      i += 2;
      while (i < code.length - 1 && !(code[i] === "*" && code[i + 1] === "/")) i++;
      i += 2;
      spacePending = true; continue;
    }
    if (ch === '"' || ch === "'") {                    // 文字列リテラル
      if (spacePending) { out.push(" "); spacePending = false; }
      let s = ch; i++;
      while (i < code.length && code[i] !== ch) {
        if (code[i] === "\\") { s += code[i] + (code[i + 1] ?? ""); i += 2; continue; }
        s += code[i]; i++;
      }
      out.push(s + ch); i++; continue;
    }
    if (ch === "`") {                                  // テンプレートリテラル
      if (spacePending) { out.push(" "); spacePending = false; }
      let s = "`"; i++;
      while (i < code.length && code[i] !== "`") {
        if (code[i] === "\\") { s += code[i] + (code[i + 1] ?? ""); i += 2; continue; }
        s += code[i]; i++;
      }
      out.push(s + "`"); i++; continue;
    }
    if (/\s/.test(ch)) {                              // 空白
      spacePending = true; i++; continue;
    }
    if (spacePending && out.length) {                  // 空白挿入
      const last = out[out.length - 1];
      const isIdChar = /[\w$]/.test(last.slice(-1)) && /[\w$]/.test(ch);
      if (isIdChar) out.push(" ");
    }
    spacePending = false;
    out.push(ch); i++;
  }
  return out.join("").trim();
}

function minifyCSS(code: string): string {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

function minifyHTML(code: string): string {
  return code
    .replace(/<!--(?!\[if)[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .trim();
}

function formatBytes(n: number): string {
  return n < 1024 ? `${n} B` : `${(n / 1024).toFixed(1)} KB`;
}

const MINIFIERS: Record<Lang, (s: string) => string> = {
  js: minifyJS, css: minifyCSS, html: minifyHTML,
};

// ---- コンポーネント ----

export default function CodeMinifier() {
  const t = useTranslations("code-minifier");
  const [lang, setLang] = useState<Lang>("js");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const output = useMemo(() => (input ? MINIFIERS[lang](input) : ""), [input, lang]);

  const saved = input.length > 0
    ? Math.round((1 - output.length / input.length) * 100)
    : 0;

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { }
  };

  const LANGS: Lang[] = ["js", "css", "html"];

  return (
    <div className="space-y-5">
      {/* 言語タブ */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {LANGS.map((l) => (
          <button key={l} type="button" onClick={() => setLang(l)}
            className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${
              lang === l
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 入力 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{t("input")}</label>
          <button type="button" onClick={() => setInput("")}
            className="text-xs text-gray-400 hover:text-gray-600">{t("clear")}</button>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(`placeholder.${lang}`)}
          rows={8}
          spellCheck={false}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                     resize-y focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
      </div>

      {/* 出力 */}
      {output ? (
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">{t("output")}</label>
              <span className="text-xs text-gray-400">
                {formatBytes(input.length)} → {formatBytes(output.length)}
              </span>
              {saved > 0 && (
                <span className="text-xs font-medium text-green-600">−{saved}%</span>
              )}
            </div>
            <button type="button" onClick={handleCopy}
              className="text-xs text-primary hover:underline">
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            rows={5}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono
                       bg-gray-50 resize-y select-all"
          />
          <p className="mt-1.5 text-xs text-gray-400">{t(`note.${lang}`)}</p>
        </div>
      ) : (
        input && <p className="text-sm text-gray-400 text-center py-4">{t("empty")}</p>
      )}
    </div>
  );
}
