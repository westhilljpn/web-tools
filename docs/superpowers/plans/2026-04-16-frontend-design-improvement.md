# フロントエンドデザイン改善 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** サイト全体のデザインをパレット（Navy/Sky/Rose/Gold）に統一し、グラデーションヒーロー・ToolCardリニューアル・色の一貫性を実装する

**Architecture:** 4つの独立した変更を D→C→A→B の順で実施。各タスク完了後に `npm run build` で確認してコミット。テストフレームワーク未導入のためビルド通過＋目視確認が検証手段。

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS JIT, next-intl 4.x

---

## ファイル変更マップ

| ファイル | タスク | 変更種別 |
|---|---|---|
| `src/app/[locale]/[tool-slug]/page.tsx` | D | Modify: H1・説明文の色クラス変更 |
| `src/components/HowToUse.tsx` | D, B | Modify: 色クラス変更 + 区切り線追加 |
| `src/components/FAQSection.tsx` | D, B | Modify: 色クラス変更 + 区切り線追加 |
| `src/components/ToolCard.tsx` | C | Modify: カテゴリ別グラデーション・アイコン背景 |
| `src/messages/ja/common.json` | A | Modify: home セクションに6キー追加 |
| `src/messages/en/common.json` | A | Modify: home セクションに6キー追加 |
| `src/components/HomepageClient.tsx` | A | Modify: ヒーローセクション追加・カテゴリタブ更新 |
| `src/app/[locale]/page.tsx` | A | Modify: homeStrings に6キーを追加して渡す |

---

## Task 1: D — gray-*/slate-* をデザインシステム色に統一

**Files:**
- Modify: `src/app/[locale]/[tool-slug]/page.tsx`
- Modify: `src/components/HowToUse.tsx`
- Modify: `src/components/FAQSection.tsx`

- [ ] **Step 1: `[tool-slug]/page.tsx` の H1・説明文クラスを修正**

`src/app/[locale]/[tool-slug]/page.tsx` の 180〜183 行を以下に変更する：

```tsx
// 変更前:
<h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 tracking-tight">
  <span aria-hidden="true" className="mr-2">{tool.icon}</span>{tm.title}
</h1>
<p className="mt-2 text-gray-500 dark:text-slate-400 text-sm">{tm.description}</p>

// 変更後:
<h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-sky tracking-tight">
  <span aria-hidden="true" className="mr-2">{tool.icon}</span>{tm.title}
</h1>
<p className="mt-2 text-steel dark:text-sky/60 text-sm">{tm.description}</p>
```

- [ ] **Step 2: `HowToUse.tsx` の色クラスを修正**

`src/components/HowToUse.tsx` を以下に全置換する（40行→40行、構造変更なし）：

```tsx
interface Step {
  label: string;
  description: string;
}

interface HowToUseProps {
  steps: Step[];
  /** セクション見出し（親コンポーネントから渡す） */
  title: string;
}

export default function HowToUse({ steps, title }: HowToUseProps) {
  if (steps.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight">
        {title}
      </h2>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={index} className="flex gap-4 items-start">
            {/* ステップ番号 */}
            <span
              className="shrink-0 w-7 h-7 rounded-full bg-primary text-white text-sm
                         font-bold flex items-center justify-center mt-0.5"
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div>
              <p className="font-medium text-primary dark:text-sky">{step.label}</p>
              {step.description && (
                <p className="text-sm text-steel dark:text-sky/60 mt-0.5">{step.description}</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 3: `FAQSection.tsx` の色クラスを修正**

`src/components/FAQSection.tsx` を以下に全置換する：

```tsx
"use client";

import { useState } from "react";

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQ[];
  /** セクション見出し（親コンポーネントから渡す） */
  title: string;
}

export default function FAQSection({ faqs, title }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  function toggle(index: number) {
    setOpenIndex(openIndex === index ? null : index);
  }

  if (faqs.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight">
        {title}
      </h2>
      <dl className="space-y-2">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={index} className="tool-card">
              <dt>
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="w-full flex justify-between items-center text-left gap-4
                             font-medium text-primary dark:text-sky
                             hover:text-accent dark:hover:text-accent transition-colors"
                >
                  <span>{faq.question}</span>
                  {/* SVG シェブロン */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`shrink-0 w-4 h-4 text-steel/60 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </dt>
              <dd
                id={`faq-answer-${index}`}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{ maxHeight: isOpen ? "1000px" : "0px" }}
              >
                <p className="mt-3 text-sm text-steel dark:text-sky/60 leading-relaxed">
                  {faq.answer}
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: ビルド確認**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

期待出力: `✓ Compiled successfully` または `Route (app)` のページ一覧。TypeScript エラーがあれば修正してから次に進む。

- [ ] **Step 5: コミット**

```bash
git add src/app/[locale]/[tool-slug]/page.tsx src/components/HowToUse.tsx src/components/FAQSection.tsx
git commit -m "$(cat <<'EOF'
[スタイル] gray-*/slate-* をデザインシステム色に統一 (Task D)

- [tool-slug]/page.tsx: H1→text-primary dark:text-sky, 説明→text-steel dark:text-sky/60
- HowToUse.tsx: 見出し・ラベル→text-primary, 説明→text-steel dark:text-sky/60
- FAQSection.tsx: 見出し・質問→text-primary, chevron→text-steel/60, 回答→text-steel

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: C — ToolCard カテゴリ別グラデーション・アイコン背景

**Files:**
- Modify: `src/components/ToolCard.tsx`

- [ ] **Step 1: ToolCard.tsx を全置換**

`src/components/ToolCard.tsx` を以下に全置換する：

```tsx
import { Link } from "@/i18n/routing";
import type { LocalizedTool, ToolCategory } from "@/lib/toolsRegistry";

interface ToolCardProps {
  tool: LocalizedTool;
  locale: string;
}

/** カテゴリ別スタイル定義（パレット7色のみ使用） */
const CATEGORY_STYLES: Record<ToolCategory, {
  /** span の inline style に渡す CSS グラデーション文字列 */
  gradient: string;
  /** アイコン背景の Tailwind クラス */
  iconBg: string;
  /** カテゴリバッジの Tailwind クラス */
  badgeCls: string;
}> = {
  text: {
    gradient: "linear-gradient(90deg,#1D3D5E,#b6dcef)",
    iconBg: "bg-sky/40",
    badgeCls: "bg-sky/40 text-primary dark:bg-sky/20 dark:text-sky",
  },
  convert: {
    gradient: "linear-gradient(90deg,#7B9098,#cbe0eb)",
    iconBg: "bg-sky-soft/80",
    badgeCls: "bg-sky-soft text-steel dark:bg-sky/10 dark:text-sky/80",
  },
  image: {
    gradient: "linear-gradient(90deg,#1D3D5E,#7B9098)",
    iconBg: "bg-primary/10",
    badgeCls: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky",
  },
  calculate: {
    gradient: "linear-gradient(90deg,#9D8C56,#c8b87a)",
    iconBg: "bg-gold/10",
    badgeCls: "bg-gold/10 text-gold",
  },
  lifestyle: {
    gradient: "linear-gradient(90deg,#b6dcef,#f2f5fd)",
    iconBg: "bg-sky/25",
    badgeCls: "bg-sky/20 text-steel dark:bg-sky/10 dark:text-sky/70",
  },
  dev: {
    gradient: "linear-gradient(90deg,#e94d71,rgba(233,77,113,0.3))",
    iconBg: "bg-accent/10",
    badgeCls: "bg-accent/10 text-accent",
  },
};

export default function ToolCard({ tool, locale }: ToolCardProps) {
  const styles = CATEGORY_STYLES[tool.category];

  return (
    <Link href={`/${tool.slug}`} locale={locale as "en" | "ja"} className="block group">
      <article className="tool-card h-full relative overflow-hidden transition-colors duration-200">
        {/* カテゴリ別トップグラデーションボーダー（3px） */}
        <span
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: styles.gradient }}
          aria-hidden="true"
        />

        {/* アイコン + タイトル */}
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${styles.iconBg}`}
            aria-hidden="true"
          >
            {tool.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-primary dark:text-sky group-hover:text-accent transition-colors truncate">
              {tool.title}
            </h2>
            {/* カテゴリバッジ */}
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles.badgeCls}`}>
              {tool.categoryLabel}
            </span>
          </div>
        </div>

        {/* 説明文 */}
        <p className="mt-3 text-sm text-steel dark:text-sky/60 line-clamp-2">
          {tool.description}
        </p>
      </article>
    </Link>
  );
}
```

- [ ] **Step 2: ビルド確認**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

期待出力: `✓ Compiled successfully`。`ToolCategory` インポートでエラーが出た場合は `src/lib/toolsRegistry.ts` の export を確認する（型は既に export されているはず）。

- [ ] **Step 3: コミット**

```bash
git add src/components/ToolCard.tsx
git commit -m "$(cat <<'EOF'
[スタイル] ToolCard カテゴリ別グラデーション・アイコン背景リニューアル (Task C)

- カテゴリ別 3px トップグラデーションボーダーを追加
- アイコンをカテゴリカラー背景付きの角丸正方形に変更
- カテゴリバッジをパレット7色のみで構成
- border-l-4 を廃止し relative/overflow-hidden に変更

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: A — i18n キー追加（ヒーロー用文字列）

**Files:**
- Modify: `src/messages/ja/common.json`
- Modify: `src/messages/en/common.json`

- [ ] **Step 1: `ja/common.json` の `home` セクションに6キーを追加**

`src/messages/ja/common.json` の `"home"` オブジェクト末尾（`"recentTools"` の後）に追記する：

```json
"home": {
  "title": "無料Webツール集",
  "subtitle": "すべてブラウザ上で動作します。データは一切サーバーに送信されません。",
  "filterLabel": "ツールを絞り込む",
  "filterPlaceholder": "ツール名・キーワードで絞り込む...",
  "noTools": "該当するツールが見つかりませんでした。",
  "comingSoon": "ツールは順次追加予定です。しばらくお待ちください。",
  "featured": "おすすめ",
  "recentTools": "最近使ったツール",
  "heroTitleTop": "いつでも、すぐ使える",
  "heroTitleBottom": "無料ツール集",
  "eyebrow": "Free Online Tools",
  "statsTools": "{count}のツール",
  "statsFree": "完全無料",
  "statsNoSignup": "登録不要"
}
```

- [ ] **Step 2: `en/common.json` の `home` セクションに6キーを追加**

`src/messages/en/common.json` の `"home"` オブジェクト末尾に追記する：

```json
"home": {
  "title": "Free Online Tools",
  "subtitle": "All tools run in your browser. No data is ever sent to a server.",
  "filterLabel": "Filter tools",
  "filterPlaceholder": "Filter by name or keyword...",
  "noTools": "No tools found.",
  "comingSoon": "More tools are coming soon. Stay tuned!",
  "featured": "Recommended",
  "recentTools": "Recently Used",
  "heroTitleTop": "Always Ready,",
  "heroTitleBottom": "Free Online Tools",
  "eyebrow": "Free Online Tools",
  "statsTools": "{count} Tools",
  "statsFree": "100% Free",
  "statsNoSignup": "No Sign-up"
}
```

- [ ] **Step 3: ビルド確認**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

期待出力: `✓ Compiled successfully`。JSON 構文エラーがないことを確認。

- [ ] **Step 4: コミット**

```bash
git add src/messages/ja/common.json src/messages/en/common.json
git commit -m "$(cat <<'EOF'
[設定] ホームページヒーロー用 i18n キーを追加 (Task A step1)

home に heroTitleTop/Bottom・eyebrow・statsTools/Free/NoSignup を追加
ja: "いつでも、すぐ使える" / en: "Always Ready,"

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: A — HomepageClient ヒーロー実装・カテゴリタブ更新

**Files:**
- Modify: `src/components/HomepageClient.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: `HomepageClient.tsx` を全置換**

`src/components/HomepageClient.tsx` を以下に全置換する：

```tsx
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
          className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28 rounded-full"
          style={{ background: "rgba(233,77,113,0.08)" }}
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
        <div className="relative z-10 mx-auto w-80 max-w-[90%]">
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
                className="rounded-full border border-white/25 bg-white/[0.12]
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
                      : "bg-white dark:bg-[#162236] text-steel dark:text-sky/60 border border-sky-soft dark:border-sky/15 hover:border-primary hover:text-primary dark:hover:border-sky dark:hover:text-sky"
                  }`}
                >
                  {icon && <span aria-hidden="true">{icon} </span>}
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
```

- [ ] **Step 2: `src/app/[locale]/page.tsx` の `homeStrings` に6キーを追加**

`src/app/[locale]/page.tsx` の `homeStrings` オブジェクト（現在 78〜87 行付近）を以下に変更する：

```tsx
const homeStrings = {
  title: tHome("title"),
  subtitle: tHome("subtitle"),
  filterLabel: tHome("filterLabel"),
  filterPlaceholder: tHome("filterPlaceholder"),
  noTools: tHome("noTools"),
  comingSoon: tHome("comingSoon"),
  featured: tHome("featured"),
  recentTools: tHome("recentTools"),
  heroTitleTop: tHome("heroTitleTop"),
  heroTitleBottom: tHome("heroTitleBottom"),
  eyebrow: tHome("eyebrow"),
  statsTools: tHome("statsTools", { count: localizedTools.length }),
  statsFree: tHome("statsFree"),
  statsNoSignup: tHome("statsNoSignup"),
};
```

- [ ] **Step 3: ビルド確認**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -30
```

期待出力: `✓ Compiled successfully`（116ページ生成）。型エラーが出た場合は `HomeStrings` インターフェースと `homeStrings` オブジェクトのキーが一致しているか確認する。

- [ ] **Step 4: コミット**

```bash
git add src/components/HomepageClient.tsx src/app/[locale]/page.tsx
git commit -m "$(cat <<'EOF'
[改善] ホームページ グラデーションヒーロー実装 (Task A)

- Navy→Sky グラデーションヒーローセクションを追加
- eyebrow バッジ・統計バッジ（52ツール・完全無料・登録不要）を追加
- 検索バーを rounded-full に変更しヒーロー内に移動
- カテゴリタブにアイコン追加、アクティブ色を primary に変更

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: B — セクション見出しに区切り線を追加

**Files:**
- Modify: `src/components/HowToUse.tsx`
- Modify: `src/components/FAQSection.tsx`

- [ ] **Step 1: `HowToUse.tsx` の h2 に区切り線を追加**

`src/components/HowToUse.tsx` の h2 部分（Task 1 で修正済み）を以下に変更する：

```tsx
// 変更前:
<h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight">
  {title}
</h2>

// 変更後:
<h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight flex items-center gap-3">
  {title}
  <span className="flex-1 h-px bg-sky-soft dark:bg-sky/20" aria-hidden="true" />
</h2>
```

- [ ] **Step 2: `FAQSection.tsx` の h2 に区切り線を追加**

`src/components/FAQSection.tsx` の h2 部分（Task 1 で修正済み）を以下に変更する：

```tsx
// 変更前:
<h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight">
  {title}
</h2>

// 変更後:
<h2 className="text-xl font-bold text-primary dark:text-sky mb-4 tracking-tight flex items-center gap-3">
  {title}
  <span className="flex-1 h-px bg-sky-soft dark:bg-sky/20" aria-hidden="true" />
</h2>
```

- [ ] **Step 3: ビルド確認**

```bash
cd /home/taki/projects/web-tools && npm run build 2>&1 | tail -20
```

期待出力: `✓ Compiled successfully`

- [ ] **Step 4: コミット**

```bash
git add src/components/HowToUse.tsx src/components/FAQSection.tsx
git commit -m "$(cat <<'EOF'
[改善] HowToUse・FAQ セクション見出しに区切り線を追加 (Task B)

h2 に flex items-center gap-3 + span.flex-1.h-px.bg-sky-soft を追加
ライト/ダークモード両対応（bg-sky-soft / dark:bg-sky/20）

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## 自己レビューチェックリスト（実施済み）

- [x] **スペックカバレッジ**: D・C・A・B の全要件をカバー
- [x] **プレースホルダーなし**: TBD・TODO・「実装する」のみの記述なし
- [x] **型一貫性**: `ToolCategory` を Task 2 でインポート、`HomeStrings` の全キーを Task 3/4 で使用
- [x] **グラデーション**: `style` 属性使用（仕様書で明示的に許可）
- [x] **Tailwind 不透明度**: 非標準値は `bg-white/[0.12]` 記法を使用
- [x] **ハードコード禁止**: heroTitleTop/Bottom・eyebrow・stats は全て i18n 経由
