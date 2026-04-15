"use client";

import { useState, useMemo, useEffect } from "react";
import ToolCard from "@/components/ToolCard";
import type { LocalizedTool } from "@/lib/toolsRegistry";
import { Link } from "@/i18n/routing";

const STORAGE_KEY = "quicker:recentTools";

/** カテゴリキーと絵文字アイコンのマッピング */
const CATEGORY_ICONS: Record<string, string> = {
  text:      "📝",
  convert:   "🔄",
  image:     "🖼️",
  calculate: "🧮",
  lifestyle: "🌿",
  dev:       "💻",
};

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
  heroTitleTop: string;
  heroTitleBottom: string;
  eyebrow: string;
  statsTools: string;
  statsFree: string;
  statsNoSignup: string;
}

interface HomepageClientProps {
  tools: LocalizedTool[];
  featuredTools: LocalizedTool[];
  categories: CategoryItem[];
  homeStrings: HomeStrings;
  locale: string;
}

/** おすすめ・最近使ったツール用コンパクトカード */
function CompactToolCard({ tool, locale }: { tool: LocalizedTool; locale: string }) {
  return (
    <Link
      href={`/${tool.slug}`}
      locale={locale as "en" | "ja"}
      className="flex-shrink-0 flex items-center gap-3 w-48 sm:w-52
                 bg-white border border-sky-soft dark:border-sky/10
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

  // URLパラメーターから初期クエリを読み込む
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

  const showSections = query.trim() === "" && activeCategory === "all";

  return (
    <>
      {/* ===== グラデーションヒーロー ===== */}
      <div
        className="relative overflow-hidden px-4 py-12 sm:py-16 text-center"
        style={{
          background:
            "linear-gradient(135deg,#1D3D5E 0%,#1e5080 45%,#2a7aaa 75%,#b6dcef 100%)",
        }}
      >
        {/* 装飾: 右上の円形ブラー */}
        <div
          className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rounded-full"
          style={{ background: "rgba(182,220,239,0.18)" }}
          aria-hidden="true"
        />
        {/* 装飾: 左下の円形ブラー */}
        <div
          className="pointer-events-none absolute -bottom-8 -left-8 w-24 h-24 rounded-full"
          style={{ background: "rgba(233,77,113,0.06)" }}
          aria-hidden="true"
        />

        {/* eyebrow バッジ */}
        <p
          className="relative z-10 inline-block mb-3 rounded-full border border-sky/40
                     bg-sky/20 px-3 py-0.5 text-[10px] font-semibold uppercase
                     tracking-widest text-sky"
        >
          ✨ {homeStrings.eyebrow}
        </p>

        {/* H1 */}
        <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold leading-tight text-white">
          <span className="block text-sky">{homeStrings.heroTitleTop}</span>
          <span className="block">{homeStrings.heroTitleBottom}</span>
        </h1>

        {/* 説明文 */}
        <p className="relative z-10 mt-2 mb-6 text-sm text-white/60">
          {homeStrings.subtitle}
        </p>

        {/* 検索バー */}
        <div className="relative z-10 mx-auto w-72 max-w-full">
          <label htmlFor="tool-filter" className="sr-only">
            {homeStrings.filterLabel}
          </label>
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-steel"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
          </span>
          <input
            id="tool-filter"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={homeStrings.filterPlaceholder}
            className="w-full rounded-full bg-white pl-10 pr-4 py-2.5 text-sm
                       text-primary placeholder-steel/60 shadow-xl
                       focus:outline-none focus:ring-2 focus:ring-sky/40
                       transition-colors"
          />
        </div>

        {/* 統計バッジ */}
        <div className="relative z-10 mt-4 flex flex-wrap justify-center gap-2">
          {[homeStrings.statsTools, homeStrings.statsFree, homeStrings.statsNoSignup].map(
            (label) => (
              <span
                key={label}
                className="rounded-full border border-white/[0.22] bg-white/[0.12]
                           px-3 py-0.5 text-[11px] font-medium text-white/[0.88]"
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>

      {/* ===== メインコンテンツ ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* カテゴリフィルター */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => {
              const icon = CATEGORY_ICONS[cat.key];
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  aria-pressed={activeCategory === cat.key}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat.key
                      ? "bg-primary text-white shadow-sm"
                      : "bg-white text-steel dark:text-sky/60 border border-sky-soft dark:border-sky/15 hover:border-primary hover:text-primary dark:hover:border-sky dark:hover:text-sky"
                  }`}
                >
                  {icon && <span aria-hidden="true">{icon}</span>}{" "}
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* おすすめ + 最近使ったセクション */}
        {showSections && (
          <div className="mb-10 space-y-6">
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
    </>
  );
}
