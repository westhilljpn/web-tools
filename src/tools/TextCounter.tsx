"use client";

import { useState, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useClipboard } from "@/lib/hooks/useClipboard";
import Toast from "@/components/Toast";

// 各サービスの文字数上限（サービス名はブランド名のためローカライズ不要）
const LIMITS = [
  { label: "Twitter / X", max: 140, color: "bg-sky-500" },
  { label: "Instagram", max: 2200, color: "bg-pink-500" },
  { label: "note", max: 100000, color: "bg-emerald-500" },
] as const;

interface Stats {
  totalChars: number;
  charsNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  fullWidthChars: number;
  halfWidthChars: number;
  bytes: number;
}

// テキストの各種統計を計算する（重い処理なので useMemo で囲む）
function calcStats(text: string): Stats {
  if (text === "") {
    return {
      totalChars: 0,
      charsNoSpaces: 0,
      words: 0,
      lines: 0,
      paragraphs: 0,
      fullWidthChars: 0,
      halfWidthChars: 0,
      bytes: 0,
    };
  }

  const totalChars = text.length;
  const charsNoSpaces = text.replace(/\s/g, "").length;
  // 日本語は分かち書きなしのためスペース区切りのトークン数
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n").length;
  // 空行で区切られたブロックを段落とする
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim() !== "").length;
  // 全角（U+0100 以上を全角として扱う簡易判定）
  const fullWidthChars = (text.match(/[^\x00-\xff]/g) ?? []).length;
  const halfWidthChars = totalChars - fullWidthChars;
  const bytes = new TextEncoder().encode(text).length;

  return {
    totalChars,
    charsNoSpaces,
    words,
    lines,
    paragraphs,
    fullWidthChars,
    halfWidthChars,
    bytes,
  };
}

export default function TextCounter() {
  const t = useTranslations("text-counter");
  const [input, setInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const { copy } = useClipboard();

  // 大量テキストでもフリーズしないよう 300ms デバウンス
  const debouncedInput = useDebounce(input, 300);
  const stats = useMemo(() => calcStats(debouncedInput), [debouncedInput]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  }, []);

  async function handlePaste() {
    try {
      const text = await navigator.clipboard.readText();
      setInput(text);
      showToast(t("toast.pasted"));
    } catch {
      showToast(t("toast.pasteError"));
    }
  }

  async function handleCopy() {
    await copy(input);
    showToast(t("toast.copied"));
  }

  return (
    <div className="space-y-6">
      {/* テキスト入力エリア */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <label htmlFor="text-counter-input" className="text-sm font-medium text-gray-700">
            {t("label")}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handlePaste}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.paste")}
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={input === ""}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.copy")}
            </button>
            <button
              type="button"
              onClick={() => setInput("")}
              disabled={input === ""}
              className="btn-secondary text-xs px-3 py-1.5"
            >
              {t("buttons.clear")}
            </button>
          </div>
        </div>
        <textarea
          id="text-counter-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("placeholder")}
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                     resize-y font-mono leading-relaxed"
        />
      </div>

      {/* 統計グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label={t("results.totalChars")} value={stats.totalChars} highlight />
        <StatCard label={t("results.charsNoSpaces")} value={stats.charsNoSpaces} />
        <StatCard label={t("results.words")} value={stats.words} />
        <StatCard label={t("results.lines")} value={stats.lines} />
        <StatCard label={t("results.paragraphs")} value={stats.paragraphs} />
        <StatCard label={t("results.fullWidthChars")} value={stats.fullWidthChars} />
        <StatCard label={t("results.halfWidthChars")} value={stats.halfWidthChars} />
        <StatCard label={t("results.bytes")} value={stats.bytes} />
      </div>

      {/* 文字数制限プログレスバー */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          {t("limitCheck.title")}
        </h3>
        <div className="space-y-4">
          {LIMITS.map((limit) => {
            const pct = Math.min((stats.totalChars / limit.max) * 100, 100);
            const isOver = stats.totalChars > limit.max;
            const overCount = stats.totalChars - limit.max;
            return (
              <div key={limit.label}>
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <span className="font-medium text-gray-700">{limit.label}</span>
                  <span className={isOver ? "text-red-500 font-semibold" : "text-gray-500"}>
                    {stats.totalChars.toLocaleString()} / {limit.max.toLocaleString()}{" "}
                    {t("limitCheck.unit")}
                    {isOver && (
                      <span className="ml-1">
                        （{t("limitCheck.over", { count: overCount.toLocaleString() })}）
                      </span>
                    )}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  {/* 動的な幅はインラインスタイルが必要（Tailwind の任意値はビルド時確定が必要なため） */}
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? "bg-red-500" : limit.color
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Toast message={toastMessage} visible={toastVisible} />
    </div>
  );
}

// 統計値を表示するカード（内部コンポーネント）
interface StatCardProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function StatCard({ label, value, highlight = false }: StatCardProps) {
  return (
    <div className={`rounded-lg p-3 text-center ${highlight ? "bg-blue-50" : "bg-gray-50"}`}>
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-gray-700"}`}>
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
    </div>
  );
}
