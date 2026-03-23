import { notFound } from "next/navigation";
import type { Metadata } from "next";
import tools, { getToolBySlug, getRelatedTools } from "@/lib/toolsRegistry";
import toolComponentMap from "@/lib/toolComponents";
import FAQSection from "@/components/FAQSection";
import HowToUse from "@/components/HowToUse";
import RelatedTools from "@/components/RelatedTools";
import AdBanner from "@/components/AdBanner";
import SEOHead from "@/components/SEOHead";

interface PageProps {
  params: { "tool-slug": string };
}

// 静的パス生成（ツール一覧から自動生成）
export function generateStaticParams() {
  return tools.map((tool) => ({ "tool-slug": tool.slug }));
}

// 動的メタデータ生成
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params["tool-slug"];
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "便利ツール集";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return {
    title: `${tool.title} - 無料オンラインツール`,
    description: tool.description,
    keywords: tool.keywords,
    alternates: {
      canonical: `${siteUrl}/${tool.slug}`,
    },
    openGraph: {
      title: `${tool.title} - 無料オンラインツール | ${siteName}`,
      description: tool.description,
      url: `${siteUrl}/${tool.slug}`,
    },
  };
}

export default function ToolPage({ params }: PageProps) {
  const slug = params["tool-slug"];
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  const relatedTools = getRelatedTools(slug);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  // WebApplication 構造化データ（チェックリスト項目5）
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.title,
    description: tool.description,
    url: `${siteUrl}/${tool.slug}`,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
  };

  // toolComponents.tsx に登録済みのコンポーネントを取得
  const ToolComponent = toolComponentMap[tool.component] ?? null;

  return (
    <>
      <SEOHead jsonLd={webAppSchema} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* メインコンテンツ */}
          <div className="min-w-0">
            {/* ページ見出し（H1はページ内1つだけ） */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span aria-hidden="true">{tool.icon}</span>
              {tool.title}
            </h1>
            <p className="mt-2 text-gray-500 text-sm">{tool.description}</p>

            {/* ツール本体 */}
            <div className="mt-6 tool-card">
              {ToolComponent ? (
                <ToolComponent />
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  このツールは現在準備中です。
                </p>
              )}
            </div>

            {/* 広告: ツール出力結果の下（24px以上の余白確保済み） */}
            <AdBanner slot="tool-result-below" className="mt-6" />

            {/* 使い方セクション（チェックリスト項目3） */}
            <HowToUse steps={tool.howToUse} />

            {/* 広告: FAQの前（24px以上の余白確保済み） */}
            <AdBanner slot="before-faq" className="mt-6" />

            {/* FAQセクション（チェックリスト項目4・5） */}
            <FAQSection faqs={tool.faq} />
          </div>

          {/* サイドバー（デスクトップのみ・チェックリスト項目6・7） */}
          <aside className="hidden lg:block mt-0">
            <div className="sticky top-24">
              {/* 広告: サイドバー */}
              <AdBanner slot="sidebar" className="mb-6" />

              <RelatedTools tools={relatedTools} />
            </div>
          </aside>
        </div>

        {/* モバイル: 関連ツール（375px 対応） */}
        <div className="lg:hidden mt-8">
          <RelatedTools tools={relatedTools} />
        </div>
      </div>
    </>
  );
}
