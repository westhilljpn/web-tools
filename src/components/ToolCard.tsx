import { Link } from "@/i18n/routing";
import type { LocalizedTool } from "@/lib/toolsRegistry";

interface ToolCardProps {
  tool: LocalizedTool;
  locale: string;
}

export default function ToolCard({ tool, locale }: ToolCardProps) {
  return (
    <Link href={`/${tool.slug}`} locale={locale as "en" | "ja"} className="block group">
      <article
        className="tool-card h-full
                   border-l-4 border-l-transparent
                   hover:border-l-primary dark:hover:border-l-blue-400
                   hover:bg-blue-50/40 dark:hover:bg-blue-950/20
                   transition-colors duration-200"
      >
        {/* アイコン + タイトル */}
        <div className="flex items-start gap-3">
          <span className="text-3xl leading-none" aria-hidden="true">
            {tool.icon}
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-slate-100 group-hover:text-primary dark:group-hover:text-blue-400 transition-colors truncate">
              {tool.title}
            </h2>
            {/* カテゴリバッジ */}
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-950 text-primary dark:text-blue-400">
              {tool.categoryLabel}
            </span>
          </div>
        </div>

        {/* 説明文 */}
        <p className="mt-3 text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
          {tool.description}
        </p>
      </article>
    </Link>
  );
}
