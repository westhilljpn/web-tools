// メタタグ・構造化データ管理コンポーネント
// Next.js 14 App Router では layout.tsx / page.tsx の metadata export を使うため、
// このコンポーネントは JSON-LD 構造化データの挿入に特化する

interface SEOHeadProps {
  /** JSON-LD 構造化データオブジェクト（複数可） */
  jsonLd: Record<string, unknown> | Record<string, unknown>[];
}

export default function SEOHead({ jsonLd }: SEOHeadProps) {
  const schemas = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
