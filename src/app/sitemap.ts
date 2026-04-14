import type { MetadataRoute } from "next";
import tools from "@/lib/toolsRegistry";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
const locales = ["en", "ja"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  // トップページ（全ロケール）
  const homePages: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${siteUrl}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1.0,
  }));

  // 固定ページ（全ロケール）
  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) => [
    {
      url: `${siteUrl}/${locale}/privacy`,
      lastModified: new Date("2025-10-01"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${siteUrl}/${locale}/terms`,
      lastModified: new Date("2025-10-01"),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ]);

  // 各ツールページ（全ロケール）
  const toolPages: MetadataRoute.Sitemap = tools.flatMap((tool) =>
    locales.map((locale) => ({
      url: `${siteUrl}/${locale}/${tool.slug}`,
      lastModified: new Date(tool.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }))
  );

  return [...homePages, ...staticPages, ...toolPages];
}
