// ツール一覧の単一ソース。新規ツール追加・削除はこのファイルだけ編集する。
// 翻訳可能な文字列（title, description, faq, howToUse 等）は
// src/messages/[locale]/tools/[slug].json で管理する。

/** カテゴリキー（翻訳キーとして categories.[key] で参照） */
export type ToolCategory =
  | "text"
  | "convert"
  | "image"
  | "calculate"
  | "lifestyle"
  | "dev";

/** ツールの非ローカライズ情報（toolsRegistry 管理分） */
export interface Tool {
  slug: string;
  /** カテゴリキー — 翻訳は categories.[category] を参照 */
  category: ToolCategory;
  icon: string;
  /** src/tools/ 内のコンポーネントファイル名（拡張子なし） */
  component: string;
  /** ISO 8601 形式（サイトマップ用） */
  updatedAt: string;
}

/** ローカライズ済みツール（pages / コンポーネントで使用） */
export interface LocalizedTool extends Tool {
  title: string;
  description: string;
  categoryLabel: string;
}

/** ツール別メッセージファイルの型 */
export interface ToolMessages {
  title: string;
  description: string;
  keywords: string[];
  label: string;
  placeholder: string;
  buttons: Record<string, string>;
  results: Record<string, string>;
  limitCheck: { title: string; unit: string; over: string };
  toast: Record<string, string>;
  howToUse: Array<{ label: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
}

// ツール一覧
const tools: Tool[] = [
  {
    slug: "text-counter",
    category: "text",
    icon: "📝",
    component: "TextCounter",
    updatedAt: "2026-03-24",
  },
  {
    slug: "json-formatter",
    category: "text",
    icon: "📄",
    component: "JsonFormatter",
    updatedAt: "2026-04-05",
  },
  {
    slug: "base64",
    category: "text",
    icon: "🔐",
    component: "Base64Tool",
    updatedAt: "2026-04-05",
  },
  {
    slug: "url-encode",
    category: "text",
    icon: "🔗",
    component: "UrlEncode",
    updatedAt: "2026-04-05",
  },
  {
    slug: "case-converter",
    category: "text",
    icon: "🔡",
    component: "CaseConverter",
    updatedAt: "2026-04-05",
  },
  {
    slug: "qr-generator",
    category: "image",
    icon: "📷",
    component: "QrGenerator",
    updatedAt: "2026-04-05",
  },
  {
    slug: "color-converter",
    category: "convert",
    icon: "🎨",
    component: "ColorConverter",
    updatedAt: "2026-04-05",
  },
  {
    slug: "password-generator",
    category: "lifestyle",
    icon: "🔑",
    component: "PasswordGenerator",
    updatedAt: "2026-04-05",
  },
  {
    slug: "timestamp-converter",
    category: "convert",
    icon: "⏱️",
    component: "TimestampConverter",
    updatedAt: "2026-04-06",
  },
  {
    slug: "unit-converter",
    category: "convert",
    icon: "📐",
    component: "UnitConverter",
    updatedAt: "2026-04-06",
  },
  {
    slug: "regex-tester",
    category: "dev",
    icon: "🔍",
    component: "RegexTester",
    updatedAt: "2026-04-06",
  },
  {
    slug: "age-calculator",
    category: "calculate",
    icon: "🎂",
    component: "AgeCalculator",
    updatedAt: "2026-04-06",
  },
  {
    slug: "bmi-calculator",
    category: "calculate",
    icon: "⚖️",
    component: "BmiCalculator",
    updatedAt: "2026-04-08",
  },
  {
    slug: "loan-calculator",
    category: "calculate",
    icon: "🏦",
    component: "LoanCalculator",
    updatedAt: "2026-04-08",
  },
  {
    slug: "pomodoro-timer",
    category: "lifestyle",
    icon: "🍅",
    component: "PomodoroTimer",
    updatedAt: "2026-04-09",
  },
  {
    slug: "image-converter",
    category: "image",
    icon: "🔄",
    component: "ImageConverter",
    updatedAt: "2026-04-11",
  },
  {
    slug: "images-to-pdf",
    category: "convert",
    icon: "📑",
    component: "ImagesToPdf",
    updatedAt: "2026-04-11",
  },
  {
    slug: "hash-generator",
    category: "dev",
    icon: "🔒",
    component: "HashGenerator",
    updatedAt: "2026-04-11",
  },
  {
    slug: "markdown-preview",
    category: "dev",
    icon: "📝",
    component: "MarkdownPreview",
    updatedAt: "2026-04-11",
  },
  {
    slug: "diff-checker",
    category: "dev",
    icon: "🔀",
    component: "DiffChecker",
    updatedAt: "2026-04-11",
  },
  {
    slug: "uuid-generator",
    category: "dev",
    icon: "🪪",
    component: "UuidGenerator",
    updatedAt: "2026-04-11",
  },
  {
    slug: "lorem-ipsum",
    category: "text",
    icon: "📖",
    component: "LoremIpsum",
    updatedAt: "2026-04-11",
  },
  {
    slug: "number-base-converter",
    category: "convert",
    icon: "🔢",
    component: "NumberBaseConverter",
    updatedAt: "2026-04-11",
  },
  {
    slug: "image-resizer",
    category: "image",
    icon: "📐",
    component: "ImageResizer",
    updatedAt: "2026-04-11",
  },
  {
    slug: "text-to-slug",
    category: "text",
    icon: "🔗",
    component: "TextToSlug",
    updatedAt: "2026-04-11",
  },
  {
    slug: "jwt-decoder",
    category: "dev",
    icon: "🔐",
    component: "JwtDecoder",
    updatedAt: "2026-04-11",
  },
  {
    slug: "word-counter",
    category: "text",
    icon: "📊",
    component: "WordCounter",
    updatedAt: "2026-04-11",
  },
  {
    slug: "percentage-calculator",
    category: "calculate",
    icon: "💯",
    component: "PercentageCalculator",
    updatedAt: "2026-04-11",
  },
];

export default tools;

/** slug からツール情報を取得する */
export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((tool) => tool.slug === slug);
}

/** カテゴリでフィルタリングする */
export function getToolsByCategory(category: ToolCategory): Tool[] {
  return tools.filter((tool) => tool.category === category);
}

/** 関連ツールを取得する（同カテゴリから指定ツールを除いた最大 N 件） */
export function getRelatedTools(slug: string, limit = 5): Tool[] {
  const current = getToolBySlug(slug);
  if (!current) return [];
  return tools
    .filter((t) => t.slug !== slug && t.category === current.category)
    .slice(0, limit);
}
