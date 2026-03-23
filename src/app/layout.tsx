import type { Metadata } from "next";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/AdBanner";

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "便利ツール集";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - 無料オンラインツール`,
    template: `%s | ${siteName}`,
  },
  description: `${siteName}は、テキスト処理・変換・計算など20〜30種類の無料Webツールを提供するサイトです。すべてブラウザ上で動作し、データは一切サーバーに送信されません。`,
  openGraph: {
    type: "website",
    siteName,
    locale: "ja_JP",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        {/* 広告配置予定: ヘッダー直下
            NEXT_PUBLIC_ADSENSE_ENABLED=true になったら有効化される */}
        <AdBanner slot="header-below" className="max-w-7xl mx-auto w-full px-4 pt-4" />

        <main className="flex-1">
          {children}
        </main>

        {/* 広告配置予定: フッター上 */}
        <AdBanner slot="footer-above" className="max-w-7xl mx-auto w-full px-4 pb-4" />

        <Footer />
      </body>
    </html>
  );
}
