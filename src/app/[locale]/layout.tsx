import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";
import { routing } from "@/i18n/routing";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "site" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${t("name")} - ${t("tagline")}`,
      template: `%s | ${t("name")}`,
    },
    description: t("description"),
    openGraph: {
      type: "website",
      siteName: t("name"),
      locale: locale === "ja" ? "ja_JP" : "en_US",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = params;

  // サポートされていないロケールは 404
  if (!routing.locales.includes(locale as "en" | "ja")) {
    notFound();
  }

  // クライアントコンポーネント向けにメッセージを渡す
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <Header />

          {/* 広告配置予定: ヘッダー直下 */}
          <AdBanner
            slot="header-below"
            className="max-w-7xl mx-auto w-full px-4 pt-4"
          />

          <main className="flex-1">{children}</main>

          {/* 広告配置予定: フッター上 */}
          <AdBanner
            slot="footer-above"
            className="max-w-7xl mx-auto w-full px-4 pb-4"
          />

          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
