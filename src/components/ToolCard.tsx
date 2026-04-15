import { Link } from "@/i18n/routing";
import type { LocalizedTool, ToolCategory } from "@/lib/toolsRegistry";

interface ToolCardProps {
  tool: LocalizedTool;
  locale: string;
}

/** カテゴリ別スタイル定義（パレット7色のみ使用） */
const CATEGORY_STYLES: Record<ToolCategory, {
  /** span の inline style に渡す CSS グラデーション文字列 */
  gradient: string;
  /** アイコン背景の Tailwind クラス */
  iconBg: string;
  /** カテゴリバッジの Tailwind クラス */
  badgeCls: string;
}> = {
  text: {
    gradient: "linear-gradient(90deg,#1D3D5E,#b6dcef)",
    iconBg: "bg-sky/40",
    badgeCls: "bg-sky/40 text-primary dark:bg-sky/20 dark:text-sky",
  },
  convert: {
    gradient: "linear-gradient(90deg,#7B9098,#cbe0eb)",
    iconBg: "bg-sky-soft/80",
    badgeCls: "bg-sky-soft text-steel dark:bg-sky/10 dark:text-sky/80",
  },
  image: {
    gradient: "linear-gradient(90deg,#1D3D5E,#7B9098)",
    iconBg: "bg-primary/10",
    badgeCls: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-sky",
  },
  calculate: {
    gradient: "linear-gradient(90deg,#9D8C56,#c8b87a)",
    iconBg: "bg-gold/10",
    badgeCls: "bg-gold/10 text-gold",
  },
  lifestyle: {
    gradient: "linear-gradient(90deg,#b6dcef,#f2f5fd)",
    iconBg: "bg-sky/25",
    badgeCls: "bg-sky/20 text-steel dark:bg-sky/10 dark:text-sky/70",
  },
  dev: {
    gradient: "linear-gradient(90deg,#e94d71,rgba(233,77,113,0.3))",
    iconBg: "bg-accent/10",
    badgeCls: "bg-accent/10 text-accent",
  },
};

export default function ToolCard({ tool, locale }: ToolCardProps) {
  const styles = CATEGORY_STYLES[tool.category];

  return (
    <Link href={`/${tool.slug}`} locale={locale as "en" | "ja"} className="block group">
      <article className="tool-card h-full relative overflow-hidden transition-colors duration-200">
        {/* カテゴリ別トップグラデーションボーダー（3px） */}
        <span
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{ background: styles.gradient }}
          aria-hidden="true"
        />

        {/* アイコン + タイトル */}
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${styles.iconBg}`}
            aria-hidden="true"
          >
            {tool.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-primary dark:text-sky group-hover:text-accent transition-colors truncate">
              {tool.title}
            </h2>
            {/* カテゴリバッジ */}
            <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${styles.badgeCls}`}>
              {tool.categoryLabel}
            </span>
          </div>
        </div>

        {/* 説明文 */}
        <p className="mt-3 text-sm text-steel dark:text-sky/60 line-clamp-2">
          {tool.description}
        </p>
      </article>
    </Link>
  );
}
