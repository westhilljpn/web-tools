import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

interface PageProps {
  params: { locale: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = params;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  const siteName = tSite("name");

  const isJa = locale === "ja";
  return {
    title: isJa ? "プライバシーポリシー" : "Privacy Policy",
    description: isJa
      ? `${siteName}のプライバシーポリシーです。個人情報の取扱い、アクセス解析、広告に関する方針を説明しています。`
      : `Privacy policy for ${siteName}. Explains our approach to personal data, analytics, and advertising.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/privacy`,
      languages: {
        en: `${siteUrl}/en/privacy`,
        ja: `${siteUrl}/ja/privacy`,
        "x-default": `${siteUrl}/en/privacy`,
      },
    },
  };
}

export default async function PrivacyPage({ params }: PageProps) {
  const { locale } = params;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteName = tSite("name");

  if (locale === "ja") {
    return <JaPrivacyContent siteName={siteName} />;
  }
  return <EnPrivacyContent siteName={siteName} />;
}

function JaPrivacyContent({ siteName }: { siteName: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">個人情報の取扱い</h2>
          <p>
            当サイト（{siteName}）は、ユーザーが入力したテキスト・数値などのデータを一切サーバーに送信しません。
            すべての処理はお使いのブラウザ（クライアントサイド）のみで完結します。
          </p>
          <p className="mt-2">
            当サイトは現時点でユーザー登録・ログイン機能を提供しておらず、
            氏名・メールアドレス等の個人情報を収集していません。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">アクセス解析</h2>
          <p>
            当サイトでは、サービス改善のために Google Analytics を使用する場合があります。
            Google Analytics はトラフィックデータ収集のために Cookie を使用しますが、
            このデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className="mt-2">
            Google Analytics のデータ収集を無効にする場合は、
            Google アナリティクス オプトアウト アドオンをご利用ください。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">広告</h2>
          <p>
            当サイトでは、将来的に Google AdSense による広告を掲載する可能性があります。
            Google AdSense は広告配信のために Cookie を使用し、
            ユーザーの興味に基づいた広告を表示することがあります。
          </p>
          <p className="mt-2">
            広告の Cookie を無効にする場合は、
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google 広告設定ページ
            </a>
            からオプトアウトできます。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookie について</h2>
          <p>
            当サイトは、上記のアクセス解析・広告サービスによる Cookie を使用する場合があります。
            ブラウザの設定から Cookie を無効にすることは可能ですが、
            一部のサービスが正常に動作しなくなる場合があります。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">外部リンクについて</h2>
          <p>
            当サイトから外部サイトへのリンクを掲載することがありますが、
            リンク先の内容については責任を負いかねます。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">ポリシーの変更</h2>
          <p>
            本ポリシーは必要に応じて改訂することがあります。
            変更があった場合は当ページにて告知します。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">お問い合わせ</h2>
          <p>本ポリシーに関するお問い合わせは、下記メールアドレスまでご連絡ください。</p>
          <p className="mt-2">
            メールアドレス:{" "}
            <a href="mailto:contact@example.com" className="text-primary hover:underline">
              contact@example.com
            </a>
          </p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">制定日：2024年1月1日</p>
      </div>
    </div>
  );
}

function EnPrivacyContent({ siteName }: { siteName: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Personal Data</h2>
          <p>
            {siteName} does not transmit any text, numbers, or other data entered by users to any server.
            All processing occurs entirely within your browser (client-side).
          </p>
          <p className="mt-2">
            This site does not offer user registration or login, and does not collect personal
            information such as names or email addresses.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Analytics</h2>
          <p>
            This site may use Google Analytics to improve our services. Google Analytics uses
            cookies to collect traffic data anonymously and does not identify individuals.
          </p>
          <p className="mt-2">
            To opt out of Google Analytics data collection, please use the
            Google Analytics Opt-out Browser Add-on.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Advertising</h2>
          <p>
            This site may display Google AdSense ads in the future. Google AdSense uses cookies
            to serve ads based on your interests.
          </p>
          <p className="mt-2">
            To opt out of personalized ads, visit the{" "}
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Google Ad Settings page
            </a>
            .
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h2>
          <p>
            This site may use cookies from the analytics and advertising services described above.
            You can disable cookies in your browser settings, though some services may not function
            properly as a result.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">External Links</h2>
          <p>
            This site may contain links to external websites. We are not responsible for the
            content of linked sites.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Policy Changes</h2>
          <p>
            This policy may be revised as needed. Any changes will be announced on this page.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
          <p>For inquiries about this policy, please contact us at the email address below.</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:contact@example.com" className="text-primary hover:underline">
              contact@example.com
            </a>
          </p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Effective: January 1, 2024</p>
      </div>
    </div>
  );
}
