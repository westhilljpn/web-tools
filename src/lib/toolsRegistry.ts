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
  /** おすすめツールとしてホームに表示する */
  featured?: boolean;
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
    updatedAt: "2026-04-12",
  },
  {
    slug: "json-formatter",
    category: "text",
    icon: "📄",
    component: "JsonFormatter",
    updatedAt: "2026-04-05",
    featured: true,
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
    featured: true,
  },
  {
    slug: "color-converter",
    category: "convert",
    icon: "🎨",
    component: "ColorConverter",
    updatedAt: "2026-04-05",
    featured: true,
  },
  {
    slug: "password-generator",
    category: "lifestyle",
    icon: "🔑",
    component: "PasswordGenerator",
    updatedAt: "2026-04-05",
    featured: true,
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
    featured: true,
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
    featured: true,
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
    icon: "🆔",
    component: "UuidGenerator",
    updatedAt: "2026-04-11",
    featured: true,
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
  {
    slug: "color-palette",
    category: "image",
    icon: "🎨",
    component: "ColorPalette",
    updatedAt: "2026-04-11",
  },
  {
    slug: "cron-parser",
    category: "dev",
    icon: "⏰",
    component: "CronParser",
    updatedAt: "2026-04-11",
  },
  {
    slug: "aspect-ratio",
    category: "calculate",
    icon: "📐",
    component: "AspectRatio",
    updatedAt: "2026-04-11",
  },
  {
    slug: "html-encoder",
    category: "dev",
    icon: "🏷️",
    component: "HtmlEncoder",
    updatedAt: "2026-04-11",
  },
  {
    slug: "css-gradient-generator",
    category: "image",
    icon: "🌈",
    component: "CssGradientGenerator",
    updatedAt: "2026-04-11",
  },
  {
    slug: "json-csv-converter",
    category: "convert",
    icon: "↔️",
    component: "JsonCsvConverter",
    updatedAt: "2026-04-11",
  },
  {
    slug: "sql-formatter",
    category: "dev",
    icon: "🗄️",
    component: "SqlFormatter",
    updatedAt: "2026-04-11",
  },
  {
    slug: "unicode-font-generator",
    category: "text",
    icon: "🔤",
    component: "UnicodeFontGenerator",
    updatedAt: "2026-04-11",
  },
  {
    slug: "text-repeater",
    category: "text",
    icon: "🔁",
    component: "TextRepeater",
    updatedAt: "2026-04-11",
  },
  {
    slug: "markdown-table-generator",
    category: "dev",
    icon: "📋",
    component: "MarkdownTableGenerator",
    updatedAt: "2026-04-11",
  },
  {
    slug: "code-minifier",
    category: "dev",
    icon: "🗜️",
    component: "CodeMinifier",
    updatedAt: "2026-04-11",
  },
  {
    slug: "ip-info",
    category: "dev",
    icon: "🌐",
    component: "IpInfo",
    updatedAt: "2026-04-11",
  },
  {
    slug: "paper-size",
    category: "calculate",
    icon: "📄",
    component: "PaperSize",
    updatedAt: "2026-04-12",
  },
  {
    slug: "gacha-calculator",
    category: "calculate",
    icon: "🎰",
    component: "GachaCalculator",
    updatedAt: "2026-04-12",
  },
  {
    slug: "investment-calculator",
    category: "calculate",
    icon: "📈",
    component: "InvestmentCalculator",
    updatedAt: "2026-04-12",
    featured: true,
  },
  {
    slug: "mojibake-fixer",
    category: "text",
    icon: "🔣",
    component: "MojibakeFixer",
    updatedAt: "2026-04-12",
  },
  {
    slug: "text-sorter",
    category: "text",
    icon: "🔃",
    component: "TextSorter",
    updatedAt: "2026-04-12",
  },
  {
    slug: "roman-numerals",
    category: "convert",
    icon: "🔢",
    component: "RomanNumerals",
    updatedAt: "2026-04-12",
  },
  {
    slug: "html-to-markdown",
    category: "text",
    icon: "⬇️",
    component: "HtmlToMarkdown",
    updatedAt: "2026-04-12",
  },
  {
    slug: "image-compressor",
    category: "image",
    icon: "🗜️",
    component: "ImageCompressor",
    updatedAt: "2026-04-12",
  },
  {
    slug: "morse-code",
    category: "convert",
    icon: "📡",
    component: "MorseCode",
    updatedAt: "2026-04-14",
  },
  {
    slug: "color-mixer",
    category: "image",
    icon: "🎨",
    component: "ColorMixer",
    updatedAt: "2026-04-14",
  },
  {
    slug: "tax-calculator",
    category: "calculate",
    icon: "🧾",
    component: "TaxCalculator",
    updatedAt: "2026-04-14",
  },
  {
    slug: "reading-time",
    category: "text",
    icon: "📚",
    component: "ReadingTime",
    updatedAt: "2026-04-14",
  },
  {
    slug: "date-calculator",
    category: "calculate",
    icon: "🗓️",
    component: "DateCalculator",
    updatedAt: "2026-04-17",
  },
  {
    slug: "calorie-calculator",
    category: "lifestyle",
    icon: "🔥",
    component: "CalorieCalculator",
    updatedAt: "2026-04-17",
  },
  {
    slug: "body-fat-calculator",
    category: "lifestyle",
    icon: "💪",
    component: "BodyFatCalculator",
    updatedAt: "2026-04-17",
  },
  {
    slug: "sleep-calculator",
    category: "lifestyle",
    icon: "😴",
    component: "SleepCalculator",
    updatedAt: "2026-04-17",
  },
  {
    slug: "css-box-shadow",
    category: "dev",
    icon: "🎨",
    component: "CssBoxShadow",
    updatedAt: "2026-04-17",
  },
  {
    slug: "wcag-contrast-checker",
    category: "dev",
    icon: "♿",
    component: "WcagContrastChecker",
    updatedAt: "2026-04-17",
  },
  {
    slug: "text-deduplicator",
    category: "text",
    icon: "🧹",
    component: "TextDeduplicator",
    updatedAt: "2026-04-18",
  },
  {
    slug: "character-counter-jp",
    category: "text",
    icon: "📃",
    component: "CharacterCounterJp",
    updatedAt: "2026-04-18",
  },
];

export default tools;

/** おすすめツールを取得する */
export function getFeaturedTools(): Tool[] {
  return tools.filter((tool) => tool.featured);
}

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
