import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import tools, { getToolBySlug, getRelatedTools } from "@/lib/toolsRegistry";
import type { LocalizedTool, ToolMessages } from "@/lib/toolsRegistry";
import toolComponentMap from "@/lib/toolComponents";
import FAQSection from "@/components/FAQSection";
import HowToUse from "@/components/HowToUse";
import RelatedTools from "@/components/RelatedTools";
import AdBanner from "@/components/AdBanner";
import SEOHead from "@/components/SEOHead";

interface PageProps {
  params: { locale: string; "tool-slug": string };
}

// 全ロケール × 全ツールの静的パスを生成
export function generateStaticParams() {
  return tools.flatMap((tool) =>
    ["en", "ja"].map((locale) => ({
      locale,
      "tool-slug": tool.slug,
    }))
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const slug = params["tool-slug"];
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const messages = (await import(
    `@/messages/${locale}/tools/${slug}.json`
  )) as { default: ToolMessages };
  const tm = messages.default;

  const tPage = await getTranslations({ locale, namespace: "toolPage" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const siteName = tSite("name");

  const alternateLocale = locale === "ja" ? "en" : "ja";

  return {
    title: `${tm.title} - ${tPage("freeOnlineTool")}`,
    description: tm.description,
    keywords: tm.keywords,
    alternates: {
      canonical: `${siteUrl}/${locale}/${slug}`,
      languages: {
        en: `${siteUrl}/en/${slug}`,
        ja: `${siteUrl}/ja/${slug}`,
        "x-default": `${siteUrl}/en/${slug}`,
      },
    },
    openGraph: {
      title: `${tm.title} - ${tPage("freeOnlineTool")} | ${siteName}`,
      description: tm.description,
      url: `${siteUrl}/${locale}/${slug}`,
      images: [
        {
          url: `/og?title=${encodeURIComponent(tm.title)}&icon=${encodeURIComponent(tool.icon)}`,
          width: 1200,
          height: 630,
          alt: tm.title,
        },
      ],
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { locale } = params;
  const slug = params["tool-slug"];
  setRequestLocale(locale);
  const tool = getToolBySlug(slug);

  if (!tool) notFound();

  const messages = (await import(
    `@/messages/${locale}/tools/${slug}.json`
  )) as { default: ToolMessages };
  const tm = messages.default;

  const tPage = await getTranslations({ locale, namespace: "toolPage" });
  const tSections = await getTranslations({ locale, namespace: "sections" });
  const tCat = await getTranslations({ locale, namespace: "categories" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  // 関連ツールのローカライズ
  const relatedToolsBase = getRelatedTools(slug);
  const relatedTools: LocalizedTool[] = await Promise.all(
    relatedToolsBase.map(async (t) => {
      const m = (await import(
        `@/messages/${locale}/tools/${t.slug}.json`
      )) as { default: ToolMessages };
      return {
        ...t,
        title: m.default.title,
        description: m.default.description,
        categoryLabel: tCat(t.category),
      };
    })
  );

  // WebApplication 構造化データ
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tm.title,
    description: tm.description,
    url: `${siteUrl}/${locale}/${slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: locale === "ja" ? "JPY" : "USD",
    },
  };

  // FAQPage 構造化データ
  const faqSchema = tm.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tm.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  // BreadcrumbList 構造化データ
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteName = tSite("name");
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteName,
        item: `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tCat(tool.category),
        item: `${siteUrl}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: tm.title,
        item: `${siteUrl}/${locale}/${slug}`,
      },
    ],
  };

  const schemas = [webAppSchema, breadcrumbSchema, ...(faqSchema ? [faqSchema] : [])];

  const ToolComponent = toolComponentMap[tool.component] ?? null;

  return (
    <>
      <SEOHead jsonLd={schemas} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-8">
          {/* メインコンテンツ */}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span aria-hidden="true">{tool.icon}</span>
              {tm.title}
            </h1>
            <p className="mt-2 text-gray-500 text-sm">{tm.description}</p>

            {/* ツール本体 */}
            <div className="mt-6 tool-card">
              {ToolComponent ? (
                <ToolComponent />
              ) : (
                <p className="text-sm text-gray-400 text-center py-8">
                  {tPage("comingSoon")}
                </p>
              )}
            </div>

            <AdBanner slot="tool-result-below" className="mt-6" />

            <HowToUse
              steps={tm.howToUse}
              title={tSections("howToUse")}
            />

            <AdBanner slot="before-faq" className="mt-6" />

            <FAQSection
              faqs={tm.faq}
              title={tSections("faq")}
            />
          </div>

          {/* サイドバー（デスクトップのみ） */}
          <aside className="hidden lg:block mt-0">
            <div className="sticky top-24">
              <AdBanner slot="sidebar" className="mb-6" />
              <RelatedTools
                tools={relatedTools}
                title={tSections("relatedTools")}
                locale={locale}
              />
            </div>
          </aside>
        </div>

        {/* モバイル: 関連ツール */}
        <div className="lg:hidden mt-8">
          <RelatedTools
            tools={relatedTools}
            title={tSections("relatedTools")}
            locale={locale}
          />
        </div>
      </div>
    </>
  );
}
