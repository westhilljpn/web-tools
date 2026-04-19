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
    title: isJa ? "利用規約" : "Terms of Service",
    description: isJa
      ? `${siteName}の利用規約です。当サービスをご利用の際は本規約に同意いただく必要があります。`
      : `Terms of service for ${siteName}. By using this service, you agree to these terms.`,
    alternates: {
      canonical: `${siteUrl}/${locale}/terms`,
      languages: {
        en: `${siteUrl}/en/terms`,
        ja: `${siteUrl}/ja/terms`,
        "x-default": `${siteUrl}/en/terms`,
      },
    },
  };
}

export default async function TermsPage({ params }: PageProps) {
  const { locale } = params;
  const tSite = await getTranslations({ locale, namespace: "site" });
  const siteName = tSite("name");

  if (locale === "ja") {
    return <JaTermsContent siteName={siteName} />;
  }
  return <EnTermsContent siteName={siteName} />;
}

function JaTermsContent({ siteName }: { siteName: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">利用規約</h1>
      <div className="space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第1条（本規約の適用）</h2>
          <p>
            本利用規約（以下「本規約」）は、{siteName}（以下「当サイト」）が提供する
            すべてのWebツールおよびサービス（以下「本サービス」）の利用条件を定めるものです。
            ユーザーは本サービスを利用することで、本規約に同意したものとみなします。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第2条（無料利用・自己責任）</h2>
          <p>
            本サービスは無料でご利用いただけます。
            ただし、本サービスの利用はすべてユーザー自身の責任において行うものとします。
          </p>
          <p className="mt-2">
            本サービスの利用によって生じたいかなる損害（直接・間接を問わず）についても、
            当サイトは一切の責任を負いません。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第3条（出力結果の正確性）</h2>
          <p>
            当サイトの各ツールが提供する計算結果・変換結果・その他の出力については、
            その正確性・完全性・有用性を保証しません。
          </p>
          <p className="mt-2">
            医療・法律・財務等の専門的判断が必要な場面での使用は特にご注意ください。
            重要な用途においては、専門家への確認を推奨します。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第4条（サービスの変更・終了）</h2>
          <p>
            当サイトは、ユーザーへの事前通知なく、本サービスの内容を変更・追加・削除、
            または本サービスの提供を終了することがあります。
            これによってユーザーに生じた損害について、当サイトは責任を負いません。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第5条（禁止事項）</h2>
          <p>ユーザーは本サービスの利用にあたり、以下の行為を禁止します。</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>法令または公序良俗に違反する行為</li>
            <li>当サイトのサーバーやネットワークに過度な負荷をかける行為</li>
            <li>当サイトの運営を妨害する行為</li>
            <li>その他、当サイトが不適切と判断する行為</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第6条（知的財産権）</h2>
          <p>
            当サイトのコンテンツ（テキスト・画像・ソースコード等）に関する知的財産権は、
            当サイト運営者に帰属します。
            無断での転載・複製・改変等はご遠慮ください。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">第7条（準拠法・管轄）</h2>
          <p>
            本規約の解釈および適用は日本法に準拠します。
            本サービスに関して紛争が生じた場合は、当サイト運営者の所在地を管轄する
            裁判所を第一審の専属的合意管轄とします。
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">お問い合わせ</h2>
          <p>本規約に関するお問い合わせは、下記メールアドレスまでご連絡ください。</p>
          <p className="mt-2">
            メールアドレス:{" "}
            <a href="mailto:westhilljpn@gmail.com" className="text-primary hover:underline">
              westhilljpn@gmail.com
            </a>
          </p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">制定日：2026年4月9日</p>
      </div>
    </div>
  );
}

function EnTermsContent({ siteName }: { siteName: string }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Terms of Service</h1>
      <div className="space-y-8 text-sm leading-relaxed text-gray-700">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 1 – Applicability</h2>
          <p>
            These Terms of Service (&quot;Terms&quot;) govern your use of all web tools and services
            (&quot;Service&quot;) provided by {siteName} (&quot;Site&quot;). By using the Service, you agree to
            these Terms.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 2 – Free Use & Responsibility</h2>
          <p>The Service is provided free of charge. All use is at your own risk.</p>
          <p className="mt-2">
            The Site is not liable for any damages (direct or indirect) arising from use of
            the Service.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 3 – Accuracy of Results</h2>
          <p>
            The Site does not warrant the accuracy, completeness, or usefulness of any
            calculation, conversion, or other output provided by its tools.
          </p>
          <p className="mt-2">
            Exercise particular caution when using results for medical, legal, financial, or
            other professional purposes. Consult a qualified expert for important decisions.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 4 – Changes & Termination</h2>
          <p>
            The Site may modify, add, remove, or discontinue the Service at any time without
            prior notice. The Site is not liable for any resulting damages to users.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 5 – Prohibited Activities</h2>
          <p>The following activities are prohibited when using the Service:</p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>Activities that violate laws or public order</li>
            <li>Placing excessive load on the Site&apos;s servers or networks</li>
            <li>Interfering with the operation of the Site</li>
            <li>Any other activities deemed inappropriate by the Site</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 6 – Intellectual Property</h2>
          <p>
            All intellectual property rights in the Site&apos;s content (text, images, source code,
            etc.) belong to the Site operator. Unauthorized reproduction or modification is
            prohibited.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Article 7 – Governing Law & Jurisdiction</h2>
          <p>
            These Terms are governed by the laws of Japan. Any disputes shall be subject to
            the exclusive jurisdiction of the court with jurisdiction over the Site operator&apos;s
            location as the court of first instance.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact</h2>
          <p>For inquiries about these Terms, please contact us at the email address below.</p>
          <p className="mt-2">
            Email:{" "}
            <a href="mailto:westhilljpn@gmail.com" className="text-primary hover:underline">
              westhilljpn@gmail.com
            </a>
          </p>
        </section>
        <p className="text-xs text-gray-400 pt-4 border-t border-gray-100">Effective: January 1, 2024</p>
      </div>
    </div>
  );
}
