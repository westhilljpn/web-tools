"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";

// DOMノードをMarkdownテキストに再帰変換する
function nodeToMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? "").replace(/\n+/g, " ");
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return "";

  const el = node as Element;
  const tag = el.tagName.toLowerCase();
  const inner = () => Array.from(el.childNodes).map(nodeToMd).join("");

  switch (tag) {
    case "h1": return `# ${inner().trim()}\n\n`;
    case "h2": return `## ${inner().trim()}\n\n`;
    case "h3": return `### ${inner().trim()}\n\n`;
    case "h4": return `#### ${inner().trim()}\n\n`;
    case "h5": return `##### ${inner().trim()}\n\n`;
    case "h6": return `###### ${inner().trim()}\n\n`;
    case "p": {
      const c = inner().trim();
      return c ? `${c}\n\n` : "";
    }
    case "br": return "\n";
    case "hr": return "\n---\n\n";
    case "strong":
    case "b":   return `**${inner()}**`;
    case "em":
    case "i":   return `*${inner()}*`;
    case "del":
    case "s":   return `~~${inner()}~~`;
    case "code":
      // pre > code の場合は内部テキストのみ（pre 側で ``` 囲む）
      if (el.parentElement?.tagName.toLowerCase() === "pre") return inner();
      return `\`${inner()}\``;
    case "pre": {
      const codeEl = el.querySelector("code");
      const lang = codeEl?.className.replace(/.*language-(\w+).*/, "$1") ?? "";
      const content = (codeEl ?? el).textContent ?? "";
      return `\`\`\`${lang}\n${content.trimEnd()}\n\`\`\`\n\n`;
    }
    case "blockquote": {
      const lines = inner().trim().split("\n");
      return lines.map(l => `> ${l}`).join("\n") + "\n\n";
    }
    case "a": {
      const href = el.getAttribute("href") ?? "";
      return `[${inner()}](${href})`;
    }
    case "img": {
      const src = el.getAttribute("src") ?? "";
      const alt = el.getAttribute("alt") ?? "";
      return `![${alt}](${src})`;
    }
    case "ul":
    case "ol": {
      const items = Array.from(el.children)
        .filter(c => c.tagName.toLowerCase() === "li")
        .map((li, i) => {
          const prefix = tag === "ul" ? "-" : `${i + 1}.`;
          return `${prefix} ${Array.from(li.childNodes).map(nodeToMd).join("").trim()}`;
        });
      return items.join("\n") + "\n\n";
    }
    case "li": return inner();
    case "table": {
      const rows = Array.from(el.querySelectorAll("tr"));
      if (!rows.length) return "";
      const toRow = (cols: string[]) => `| ${cols.join(" | ")} |`;
      const head = Array.from(rows[0].children).map(c => c.textContent?.trim() ?? "");
      const sep  = head.map(() => "---");
      const body = rows.slice(1).map(r =>
        Array.from(r.children).map(c => c.textContent?.trim() ?? "")
      );
      return [toRow(head), toRow(sep), ...body.map(toRow)].join("\n") + "\n\n";
    }
    default: return inner();
  }
}

function htmlToMarkdown(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return nodeToMd(doc.body).replace(/\n{3,}/g, "\n\n").trim();
}

export default function HtmlToMarkdown() {
  const t = useTranslations("html-to-markdown");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebounce(input, 300);

  const output = useMemo(() => (debouncedInput.trim() ? htmlToMarkdown(debouncedInput) : ""), [debouncedInput]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 入力 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{t("inputLabel")}</label>
            {input && (
              <button type="button" onClick={() => setInput("")}
                className="text-xs text-gray-400 hover:text-gray-600">
                {t("clear")}
              </button>
            )}
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t("placeholder")}
            rows={16}
            spellCheck={false}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono resize-y
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* 出力 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">{t("outputLabel")}</label>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!output}
              className="text-xs px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700
                         disabled:opacity-40 transition-colors"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            rows={16}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono resize-y
                       bg-gray-50 dark:bg-slate-800/50"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400">{t("supportedTags")}</p>
    </div>
  );
}
