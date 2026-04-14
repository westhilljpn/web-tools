import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import tools, { getFeaturedTools } from "@/lib/toolsRegistry";
import type { LocalizedTool, ToolMessages } from "@/lib/toolsRegistry";
import HomepageClient from "@/components/HomepageClient";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return {
    title: tHome("title"),
    description: tSite("description"),
    alternates: {
      canonical: `${siteUrl}/${locale}`,
      languages: {
        en: `${siteUrl}/en`,
        ja: `${siteUrl}/ja`,
        "x-default": `${siteUrl}/en`,
      },
    },
    openGraph: {
      url: `${siteUrl}/${locale}`,
      images: [
        {
          url: `/og?title=${encodeURIComponent(tHome("title"))}&icon=%F0%9F%94%A7`,
          width: 1200,
          height: 630,
          alt: tHome("title"),
        },
      ],
    },
  };
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = params;
  setRequestLocale(locale);
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  // ツール一覧にローカライズ済みタイトル・説明を付与
  const localizedTools: LocalizedTool[] = await Promise.all(
    tools.map(async (tool) => {
      const messages = (await import(
        `@/messages/${locale}/tools/${tool.slug}.json`
      )) as { default: ToolMessages };
      return {
        ...tool,
        title: messages.default.title,
        description: messages.default.description,
        categoryLabel: tCat(tool.category),
      };
    })
  );

  // カテゴリ一覧（"all" + 登録カテゴリ）
  const categoryKeys = ["all", "text", "convert", "image", "calculate", "lifestyle", "dev"] as const;
  const categories = categoryKeys.map((key) => ({
    key,
    label: tCat(key),
  }));

  // おすすめツールのローカライズ
  const featuredSlugs = new Set(getFeaturedTools().map((t) => t.slug));
  const featuredTools = localizedTools.filter((t) => featuredSlugs.has(t.slug));

  const homeStrings = {
    title: tHome("title"),
    subtitle: tHome("subtitle"),
    filterLabel: tHome("filterLabel"),
    filterPlaceholder: tHome("filterPlaceholder"),
    noTools: tHome("noTools"),
    comingSoon: tHome("comingSoon"),
    featured: tHome("featured"),
    recentTools: tHome("recentTools"),
  };

  return (
    <HomepageClient
      tools={localizedTools}
      featuredTools={featuredTools}
      categories={categories}
      homeStrings={homeStrings}
      locale={locale}
    />
  );
}
