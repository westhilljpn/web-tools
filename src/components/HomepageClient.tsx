"use client";

import { useState, useMemo, useEffect } from "react";
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
                 bg-white dark:bg-[#162236] border border-sky-soft dark:border-sky/10
                 rounded-xl px-4 py-3 hover:border-accent dark:hover:border-accent
                 hover:shadow-md transition-all duration-150 group"
    >
      <span className="text-2xl" aria-hidden="true">{tool.icon}</span>
      <span className="text-sm font-medium text-primary dark:text-sky truncate
                       group-hover:text-accent dark:group-hover:text-accent transition-colors">
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
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [recentTools, setRecentTools] = useState<LocalizedTool[]>([]);

  // URLパラメーター（ヘッダー検索など）から初期クエリを読み込む（クライアントのみ）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

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
        <h1 className="text-3xl sm:text-4xl font-bold text-primary dark:text-sky tracking-tight">
          {homeStrings.title}
        </h1>
        <p className="mt-3 text-steel dark:text-sky/60 text-sm sm:text-base">
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
            className="w-full px-4 py-2.5 rounded-lg text-sm
                       bg-white dark:bg-[#162236]
                       text-primary dark:text-sky
                       placeholder-steel/60 dark:placeholder-sky/30
                       border border-sky-soft dark:border-sky/15
                       focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50
                       transition-colors"
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
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white dark:bg-[#162236] text-steel dark:text-sky/60 border border-sky-soft dark:border-sky/15 hover:border-accent hover:text-accent dark:hover:border-accent dark:hover:text-accent"
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
              <h2 className="text-xs font-semibold text-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="inline-block w-3 h-0.5 bg-gold rounded" />
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
              <h2 className="text-xs font-semibold text-steel dark:text-sky/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="inline-block w-3 h-0.5 bg-steel/40 dark:bg-sky/30 rounded" />
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
        <div className="text-center py-16 text-steel dark:text-sky/40">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">
            {tools.length === 0 ? homeStrings.comingSoon : homeStrings.noTools}
          </p>
        </div>
      )}
    </div>
  );
}
