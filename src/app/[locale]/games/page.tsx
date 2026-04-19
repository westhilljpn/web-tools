import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import tools, { getToolsByCategory } from "@/lib/toolsRegistry";
import type { ToolMessages } from "@/lib/toolsRegistry";

interface PageProps {
  params: { locale: string };
}

export async function generateStaticParams() {
  return ["en", "ja"].map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "gamesHub" });
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const siteName = tSite("name");

  return {
    title: `${t("title")} | ${siteName}`,
    description: t("description"),
    alternates: {
      canonical: `${siteUrl}/${locale}/games`,
      languages: {
        en: `${siteUrl}/en/games`,
        ja: `${siteUrl}/ja/games`,
        "x-default": `${siteUrl}/en/games`,
      },
    },
    openGraph: {
      title: `${t("title")} | ${siteName}`,
      description: t("description"),
      url: `${siteUrl}/${locale}/games`,
    },
  };
}

export default async function GamesPage({ params }: PageProps) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "gamesHub" });
  const tCat = await getTranslations({ locale, namespace: "categories" });

  const gameTools = getToolsByCategory("game");
  const localizedGames = await Promise.all(
    gameTools.map(async (tool) => {
      const messages = (await import(
        `@/messages/${locale}/tools/${tool.slug}.json`
      )) as { default: ToolMessages };
      return {
        ...tool,
        title: messages.default.title,
        description: messages.default.description,
      };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-primary dark:text-sky tracking-tight">
        🎮 {t("title")}
      </h1>
      <p className="mt-2 text-steel dark:text-sky/60 text-sm">{t("description")}</p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {localizedGames.map((game) => (
          <Link
            key={game.slug}
            href={`/${game.slug}` as `/${string}`}
            className="tool-card group flex flex-col gap-2 p-5 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">{game.icon}</span>
              <div>
                <h2 className="font-semibold text-primary dark:text-sky group-hover:text-accent transition-colors">
                  {game.title}
                </h2>
                <span className="text-xs text-steel dark:text-sky/50">{tCat("game")}</span>
              </div>
            </div>
            <p className="text-sm text-steel dark:text-sky/60 line-clamp-2">{game.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
