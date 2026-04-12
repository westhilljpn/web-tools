"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import type { LocalizedTool } from "@/lib/toolsRegistry";
import { Link } from "@/i18n/routing";

const STORAGE_KEY = "quicker:recentTools";

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
  featured: string;
  recentTools: string;
}

interface HomepageClientProps {
  tools: LocalizedTool[];
  featuredTools: LocalizedTool[];
  categories: CategoryItem[];
  homeStrings: HomeStrings;
  locale: string;
}

// ツールのコンパクトな横スクロールカードを返す
function CompactToolCard({ tool, locale }: { tool: LocalizedTool; locale: string }) {
  return (
    <Link
      href={`/${tool.slug}`}
      locale={locale as "en" | "ja"}
      className="flex-shrink-0 flex items-center gap-3 w-48 sm:w-52
                 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700
                 rounded-xl px-4 py-3 hover:border-primary dark:hover:border-blue-400
                 hover:shadow-md transition-all duration-150 group"
    >
      <span className="text-2xl" aria-hidden="true">{tool.icon}</span>
      <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate
                       group-hover:text-primary dark:group-hover:text-blue-400 transition-colors">
        {tool.title}
      </span>
    </Link>
  );
}

export default function HomepageClient({
  tools,
  featuredTools,
  categories,
  homeStrings,
  locale,
}: HomepageClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentTools, setRecentTools] = useState<LocalizedTool[]>([]);

  // ヘッダー検索によるURLパラメーター変化を監視してフィルターに反映
  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  // localStorage から最近使ったツールを復元
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const slugs: string[] = JSON.parse(raw);
      const toolMap = new Map(tools.map((t) => [t.slug, t]));
      const recent = slugs
        .map((s) => toolMap.get(s))
        .filter((t): t is LocalizedTool => t !== undefined);
      setRecentTools(recent);
    } catch {
      // 取得失敗時は何も表示しない
    }
  }, [tools]);

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

  // 検索・フィルター未適用時のみおすすめ/最近セクションを表示
  const showSections = query.trim() === "" && activeCategory === "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ページタイトル */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
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
              aria-pressed={activeCategory === cat.key}
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

      {/* おすすめ + 最近使ったセクション（検索・フィルター未適用時のみ） */}
      {showSections && (
        <div className="mb-10 space-y-6">
          {/* おすすめツール */}
          {featuredTools.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {homeStrings.featured}
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {featuredTools.map((tool) => (
                  <CompactToolCard key={tool.slug} tool={tool} locale={locale} />
                ))}
              </div>
            </div>
          )}

          {/* 最近使ったツール */}
          {recentTools.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {homeStrings.recentTools}
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {recentTools.map((tool) => (
                  <CompactToolCard key={tool.slug} tool={tool} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
