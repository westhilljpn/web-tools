"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import Toast from "@/components/Toast";

const SAMPLE = `# Hello, Markdown!

Write **bold**, *italic*, or \`inline code\`.

## Lists

- Item 1
- Item 2
  - Nested item

## Code block

\`\`\`js
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

> Blockquote example

[Visit example.com](https://example.com)
`;

export default function MarkdownPreview() {
  const t = useTranslations("markdown-preview");
  const [input, setInput] = useState("");
  const [html, setHtml] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!input) { setHtml(""); return; }
    timerRef.current = setTimeout(async () => {
      const { marked } = await import("marked");
      const result = marked.parse(input);
      setHtml(await Promise.resolve(result));
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [input]);

  const handleCopy = async () => {
    if (!input) return;
    await navigator.clipboard.writeText(input);
    showToast(t("toast.copied"));
  };

  const handleSample = () => setInput(SAMPLE);

  return (
    <div className="space-y-4">
      {/* ツールバー */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!input}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
        >
          {t("buttons.copy")}
        </button>
        <button
          type="button"
          onClick={() => setInput("")}
          disabled={!input}
          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-50"
        >
          {t("buttons.clear")}
        </button>
        {!input && (
          <button
            type="button"
            onClick={handleSample}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {t("buttons.sample")}
          </button>
        )}
        {input && (
          <span className="text-xs text-gray-400 ml-auto">
            {input.length.toLocaleString()} {t("charCount")}
          </span>
        )}
      </div>

      {/* 2ペインレイアウト */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 入力 */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{t("labels.input")}</p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("placeholder")}
            spellCheck={false}
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono
                       leading-relaxed resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* プレビュー */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1.5">{t("labels.preview")}</p>
          <div className="w-full h-96 px-5 py-4 border border-gray-300 rounded-lg overflow-y-auto bg-white">
            {html ? (
              <div
                className="markdown-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ) : (
              <p className="text-sm text-gray-400">{t("results.empty")}</p>
            )}
          </div>
        </div>
      </div>

      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}
