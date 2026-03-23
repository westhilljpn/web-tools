"use client";

import { useState, useMemo } from "react";
import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import tools, { type Tool } from "@/lib/toolsRegistry";

// NOTE: "use client" と export const metadata は共存できないため、
// メタデータは layout.tsx のデフォルト値を使用する

const CATEGORIES: Array<Tool["category"] | "すべて"> = [
  "すべて",
  "テキスト",
  "変換",
  "画像",
  "計算",
  "生活",
  "開発",
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Tool["category"] | "すべて">("すべて");

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === "すべて" || tool.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ページタイトル */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
          無料で使えるWebツール集
        </h1>
        <p className="mt-3 text-gray-500 text-sm sm:text-base">
          すべてブラウザ上で動作します。データは一切サーバーに送信されません。
        </p>
      </div>

      {/* 検索 + カテゴリフィルター */}
      <div className="mb-8 space-y-4">
        {/* 検索ボックス */}
        <div className="max-w-md mx-auto">
          <label htmlFor="tool-filter" className="sr-only">
            ツールを絞り込む
          </label>
          <input
            id="tool-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ツール名・キーワードで絞り込む..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-300 hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ツール一覧グリッド */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">
            {tools.length === 0
              ? "ツールは順次追加予定です。しばらくお待ちください。"
              : "該当するツールが見つかりませんでした。"}
          </p>
        </div>
      )}
    </div>
  );
}
