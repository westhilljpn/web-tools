"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import type { LocalizedTool } from "@/lib/toolsRegistry";

interface CategoryItem {
  key: string;
  label: string;
}

interface HomeStrings {
  title: string;
  subtitle: string;
  filterLabel: string;
  filterPlaceholder: string;
  noTools: string;
  comingSoon: string;
}

interface HomepageClientProps {
  tools: LocalizedTool[];
  categories: CategoryItem[];
  homeStrings: HomeStrings;
  locale: string;
}

export default function HomepageClient({
  tools,
  categories,
  homeStrings,
  locale,
}: HomepageClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState("all");

  // ヘッダー検索によるURLパラメーター変化を監視してフィルターに反映
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filteredTools = useMemo(() => {
    return tools.filter((tool) => {
      const matchesCategory =
        activeCategory === "all" || tool.category === activeCategory;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q === "" ||
        tool.title.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, activeCategory, tools]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ページタイトル */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100">
          {homeStrings.title}
        </h1>
        <p className="mt-3 text-gray-500 dark:text-slate-400 text-sm sm:text-base">
          {homeStrings.subtitle}
        </p>
      </div>

      {/* 検索 + カテゴリフィルター */}
      <div className="mb-8 space-y-4">
        <div className="max-w-md mx-auto">
          <label htmlFor="tool-filter" className="sr-only">
            {homeStrings.filterLabel}
          </label>
          <input
            id="tool-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={homeStrings.filterPlaceholder}
            className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm
                       bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100
                       placeholder-gray-400 dark:placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* カテゴリタブ */}
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat.key
                  ? "bg-primary text-white"
                  : "bg-white dark:bg-slate-700 text-gray-600 dark:text-slate-300 border border-gray-300 dark:border-slate-600 hover:border-primary hover:text-primary dark:hover:border-blue-400 dark:hover:text-blue-400"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ツール一覧グリッド */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 dark:text-slate-500">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">
            {tools.length === 0 ? homeStrings.comingSoon : homeStrings.noTools}
          </p>
        </div>
      )}
    </div>
  );
}
